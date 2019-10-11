// this is the IRS Plan page component
import { Actions } from 'gisida';
import { keyBy, values } from 'lodash';
import { EventData, LngLatBoundsLike, MapboxGeoJSONFeature } from 'mapbox-gl';
import moment from 'moment';
import { MouseEvent } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Button, Col, Input, Row } from 'reactstrap';
import { Store } from 'redux';

import GeojsonExtent from '@mapbox/geojson-extent';
import DrillDownTable, { DrillDownProps, DropDownCell } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';

import {
  DATE_FORMAT,
  SUPERSET_JURISDICTIONS_DATA_SLICE,
  SUPERSET_MAX_RECORDS,
} from '../../../../../configs/env';
import {
  HOME,
  HOME_URL,
  INTERVENTION_IRS_URL,
  JURISDICTION_ID,
  MAP_ID,
  NEW_PLAN,
  OPENSRP_FIND_BY_PROPERTIES,
  OPENSRP_GET_ASSIGNMENTS_ENDPOINT,
  OPENSRP_LOCATION,
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PARENT_ID,
  OPENSRP_PLANS,
  OPENSRP_POST_ASSIGNMENTS_ENDPOINT,
  PARENTID,
} from '../../../../../constants';
import {
  FlexObject,
  getFeatureByProperty,
  getGisidaMapById,
  preventDefault,
  RouteParams,
  setGisidaMapPosition,
  stopPropagation,
  stopPropagationAndPreventDefault,
} from '../../../../../helpers/utils';
import {
  adminLayerColors,
  baseTilesetGeographicLevel,
  CountriesAdmin0,
  deselectedJurisdictionOpacity,
  fillLayerConfig,
  fullySelectedJurisdictionOpacity,
  JurisdictionLevels,
  JurisdictionsByCountry,
  jurisdictionSelectionTooltipHint,
  lineLayerConfig,
  partiallySelectedJurisdictionOpacity,
  Tileset,
} from './../../../../../configs/settings';

import { OpenSRPService } from '../../../../../services/opensrp';
import supersetFetch from '../../../../../services/superset';

import store from '../../../../../store';
import jurisdictionReducer, {
  fetchAllJurisdictionIds,
  fetchJurisdictions,
  getAllJurisdictionsIdArray,
  getJurisdictionsById,
  getJurisdictionsIdArray,
  Jurisdiction,
  JurisdictionGeoJSON,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import assignmentReducer, {
  Assignment,
  fetchAssignments,
  getAssignmentsArrayByPlanId,
  reducerName as assignmentReducerName,
} from '../../../../../store/ducks/opensrp/assignments';
import organizationsReducer, {
  fetchOrganizations,
  getOrganizationsById,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../../../store/ducks/opensrp/organizations';
import plansReducer, {
  extractPlanPayloadFromPlanRecord,
  extractPlanRecordResponseFromPlanPayload,
  fetchPlanRecords,
  getPlanRecordById,
  PlanPayload,
  PlanRecord,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

import { Helmet } from 'react-helmet';
import GisidaWrapper, { GisidaProps, Handlers } from '../../../../../components/GisidaWrapper';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';

import { ADMN0_PCODE, JurisdictionTypes } from '../../../../../configs/types';
import AssignTeamTableCell, { AssignTeamCellProps } from '../../../../forms/AssignTeamTableCell';
import './../../../../../styles/css/drill-down-table.css';
import './style.css';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(assignmentReducerName, assignmentReducer);

/** initialize OpenSRP API services */
const OpenSrpLocationService = new OpenSRPService(OPENSRP_LOCATION);
const OpenSrpPlanService = new OpenSRPService(OPENSRP_PLANS);
const OpenSRPOrganizationService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
const OpenSrpAssignedService = new OpenSRPService(OPENSRP_GET_ASSIGNMENTS_ENDPOINT);
const OpenSrpAssignmentService = new OpenSRPService(OPENSRP_POST_ASSIGNMENTS_ENDPOINT);

/** IrsPlanProps - interface for IRS Plan page */
export interface IrsPlanProps {
  allJurisdictionIds: string[];
  assignmentsArray: Assignment[];
  fetchAllJurisdictionIdsActionCreator: typeof fetchAllJurisdictionIds;
  fetchAssignmentsActionCreator: typeof fetchAssignments;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchOrganizationsActionCreator: typeof fetchOrganizations;
  fetchPlansActionCreator: typeof fetchPlanRecords;
  isDraftPlan?: boolean;
  isFinalizedPlan?: boolean;
  jurisdictionsById: { [key: string]: Jurisdiction };
  loadedJurisdictionIds: string[];
  organizationsById: { [key: string]: Organization };
  planById?: PlanRecord | null;
  planId: string | null;
  supersetService: typeof supersetFetch;
}

/** defaultIrsPlanProps - default props for IRS Plan page */
export const defaultIrsPlanProps: IrsPlanProps = {
  allJurisdictionIds: [],
  assignmentsArray: [],
  fetchAllJurisdictionIdsActionCreator: fetchAllJurisdictionIds,
  fetchAssignmentsActionCreator: fetchAssignments,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchOrganizationsActionCreator: fetchOrganizations,
  fetchPlansActionCreator: fetchPlanRecords,
  isDraftPlan: false,
  isFinalizedPlan: false,
  jurisdictionsById: {},
  loadedJurisdictionIds: [],
  organizationsById: {},
  planById: null,
  planId: null,
  supersetService: supersetFetch,
};

/** Interface for breadcrumb item */
export interface TableCrumb {
  // todo: shift this out of here
  label: string;
  id: string | null;
  active: boolean;
  bounds?: LngLatBoundsLike;
}

/** Interface to describe props for the IrsPlan component */
interface IrsPlanState {
  childlessChildrenIds: string[];
  childrenByParentId: { [key: string]: string[] };
  country: JurisdictionsByCountry | null;
  doRenderTable: boolean;
  filteredJurisdictionIds: string[];
  focusJurisdictionId: string | null;
  gisidaWrapperProps: GisidaProps | null;
  isBuildingGisidaProps: boolean;
  isLoadingGeoms: boolean;
  isLoadingJurisdictions: boolean;
  isSaveDraftDisabled: boolean;
  newPlan: PlanRecord | null;
  planCountry: string;
  planTableProps: DrillDownProps<any> | null;
  previousPlanName: string;
  tableCrumbs: TableCrumb[];
}

/** IrsPlan - component for IRS Plan page */
class IrsPlan extends React.Component<
  RouteComponentProps<RouteParams> & IrsPlanProps,
  IrsPlanState
> {
  public static defaultProps = defaultIrsPlanProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlanProps) {
    super(props);
    this.state = {
      childlessChildrenIds: [],
      childrenByParentId: {},
      country: null,
      doRenderTable: true,
      filteredJurisdictionIds: [],
      focusJurisdictionId: null,
      gisidaWrapperProps: null,
      isBuildingGisidaProps: false,
      isLoadingGeoms: false,
      isLoadingJurisdictions: true,
      isSaveDraftDisabled: false,
      newPlan: (props.planById as PlanRecord) || null,
      planCountry: '',
      planTableProps: null,
      previousPlanName: '',
      tableCrumbs: [],
    };
  }

  public async componentDidMount() {
    const {
      fetchAssignmentsActionCreator,
      fetchJurisdictionsActionCreator,
      fetchOrganizationsActionCreator,
      fetchPlansActionCreator,
      isDraftPlan,
      planId,
      planById,
      supersetService,
    } = this.props;

    // GET PLAN
    if (planId && !planById) {
      await OpenSrpPlanService.read(planId)
        .then((plan: PlanPayload) => {
          const planRecord = extractPlanRecordResponseFromPlanPayload(plan);
          if (planRecord) {
            return fetchPlansActionCreator([planRecord]);
          }
        })
        .catch(err => err);
    } else if (isDraftPlan && planById) {
      this.setState({ newPlan: planById });
    }

    // Get assignments
    if (planId) {
      // fetch all organizations
      OpenSRPOrganizationService.list()
        .then((response: Organization[]) => {
          // save all organizations to store
          store.dispatch(fetchOrganizationsActionCreator(response));
          // get all assignments
          return this.getAllAssignments(planId, response, (nextAssignments: Assignment[]) =>
            store.dispatch(fetchAssignmentsActionCreator(nextAssignments))
          );
        })
        .catch((err: Error) => {
          /** TODO - find something to do with error */
        });
    }

    const otherJurisdictionSupersetParams = { row_limit: SUPERSET_MAX_RECORDS };

    // GET FULL JURISDICTION HIERARCHY
    await supersetService(SUPERSET_JURISDICTIONS_DATA_SLICE, otherJurisdictionSupersetParams).then(
      (jurisdictionResults: FlexObject[] = []) => {
        const jurisdictionsArray: Jurisdiction[] = jurisdictionResults
          .map(j => {
            const { id, parent_id, name, geographic_level } = j;
            const jurisdiction: Jurisdiction = {
              geographic_level: geographic_level || 0,
              jurisdiction_id: id,
              name: name || null,
              parent_id: parent_id || null,
            };
            return jurisdiction;
          })
          .sort((a, b) =>
            a.geographic_level && b.geographic_level ? b.geographic_level - a.geographic_level : 0
          );
        // initialize Plan
        if (
          this.props.planById &&
          this.props.planById.plan_jurisdictions_ids &&
          this.props.planById.plan_jurisdictions_ids.length
        ) {
          const jurisdictionsById = keyBy(jurisdictionsArray, j => j.jurisdiction_id);

          // build and store decendant jurisdictions, jurisdictionsArray MUST be sorted by geographic_level from high to low
          const childrenByParentId: { [key: string]: string[] } = {};
          for (const j of jurisdictionsArray) {
            if (j.parent_id) {
              if (!childrenByParentId[j.parent_id]) {
                childrenByParentId[j.parent_id] = [];
              }
              childrenByParentId[j.parent_id].push(j.jurisdiction_id);
              if (childrenByParentId[j.jurisdiction_id]) {
                childrenByParentId[j.parent_id] = childrenByParentId[j.parent_id].concat(
                  childrenByParentId[j.jurisdiction_id]
                );
              }
            }
          }

          // define level 0 Jurisdiction as parentlessParent
          const ancestorIds = this.getAncestorJurisdictionIds(
            [...this.props.planById.plan_jurisdictions_ids],
            jurisdictionsArray
          );
          const parentlessParent = ancestorIds.find(
            a =>
              jurisdictionsById[a] &&
              !jurisdictionsById[a].parent_id &&
              !jurisdictionsById[a].geographic_level
          );
          if (parentlessParent) {
            // GET parentlessParent Jurisdiction from OpenSRP
            OpenSrpLocationService.read(OPENSRP_FIND_BY_PROPERTIES, {
              is_jurisdiction: true,
              properties_filter: `name:${jurisdictionsById[parentlessParent].name}`,
              return_geometry: false,
            }).then(results => {
              const result = results[0];
              if (result && result.properties) {
                // Define which country settings to use
                const country: JurisdictionsByCountry =
                  CountriesAdmin0[
                    (result.properties.ADM0_PCODE || result.properties.name) as ADMN0_PCODE
                  ];

                if (country) {
                  // define id of parentless parent or ids of admin level 1s
                  const countryIds = country.jurisdictionId.length
                    ? [country.jurisdictionId]
                    : [...country.jurisdictionIds];
                  // define all Jurisdictions pertaining to this Plan only (by country)
                  const filteredJurisdictions = isDraftPlan
                    ? this.getDescendantJurisdictionIds(
                        countryIds,
                        jurisdictionsById,
                        true,
                        childrenByParentId
                      ).map(j => jurisdictionsById[j])
                    : ancestorIds.map(j => jurisdictionsById[j]);
                  const childlessChildrenIds = this.getChildlessChildrenIds(filteredJurisdictions);

                  const newPlan: PlanRecord = {
                    ...(this.props.planById as PlanRecord),
                    plan_jurisdictions_ids: [...ancestorIds],
                  };

                  // build first TableCrumb based on the country settings
                  const tableCrumbs: TableCrumb[] = [
                    {
                      active: true,
                      bounds: country.bounds,
                      id: country.jurisdictionId.length ? country.jurisdictionId : null,
                      label: country.ADMN0_EN,
                    },
                  ];

                  this.setState(
                    {
                      childlessChildrenIds,
                      childrenByParentId,
                      country,
                      filteredJurisdictionIds: isDraftPlan
                        ? filteredJurisdictions.map(j => j.jurisdiction_id)
                        : ancestorIds,
                      focusJurisdictionId: country.jurisdictionId.length
                        ? country.jurisdictionId
                        : this.state.focusJurisdictionId,
                      isLoadingGeoms: !!isDraftPlan,
                      isLoadingJurisdictions: false,
                      newPlan,
                      planCountry: result.properties.ADM0_PCODE,
                      tableCrumbs,
                    },
                    () => {
                      // build drilldown table props
                      const planTableProps = this.getDrilldownPlanTableProps(this.state);
                      this.setState({ planTableProps }, () => {
                        if (isDraftPlan) {
                          this.loadJurisdictionGeometries();
                        }
                      });
                    }
                  );
                } else {
                  // handle country not found
                }
              }
            });
          }
        } else {
          // build drilldown table props
          const planTableProps = this.getDrilldownPlanTableProps(this.state);
          this.setState({ isLoadingJurisdictions: false, planTableProps });
        }
        return fetchJurisdictionsActionCreator(jurisdictionsArray);
      }
    );
  }

  public componentWillReceiveProps(nextProps: IrsPlanProps) {
    const {
      childlessChildrenIds,
      country,
      isLoadingGeoms,
      isLoadingJurisdictions,
      newPlan,
    } = this.state;
    const { isFinalizedPlan, jurisdictionsById, planById } = nextProps;

    // update state after geometries are fetched from this.loadJurisdictionGeometries()
    if (newPlan && childlessChildrenIds && country && isLoadingGeoms) {
      const filteredJurisdictions = childlessChildrenIds.map(j => jurisdictionsById[j]);
      const loadedJurisdictions = filteredJurisdictions.filter((j: Jurisdiction) => j.geojson);

      if (loadedJurisdictions.length === filteredJurisdictions.length) {
        this.setState(
          {
            isBuildingGisidaProps: true,
            isLoadingGeoms: false,
          },
          () => {
            // build gisida wrapper props
            const gisidaWrapperProps = this.getGisidaWrapperProps();
            this.setState({
              gisidaWrapperProps,
              isBuildingGisidaProps: false,
            });
          }
        );
      }
    }

    // update state after Jurisdiction Hierarchy is fetched from SUPERSET_JURISDICTIONS_DATA_SLICE
    if (
      !isFinalizedPlan &&
      isLoadingJurisdictions &&
      Object.keys(jurisdictionsById).length !== Object.keys(this.props.jurisdictionsById).length
    ) {
      this.setState({ isLoadingJurisdictions: false });
    }

    // update state after fetching plan from OpenSRP
    if (!newPlan && planById && planById.plan_jurisdictions_ids) {
      this.setState({
        newPlan: planById,
      });
    }
  }

  public render() {
    const { planId, planById, isDraftPlan, isFinalizedPlan } = this.props;
    const {
      doRenderTable,
      gisidaWrapperProps,
      isBuildingGisidaProps,
      isLoadingJurisdictions,
      isSaveDraftDisabled,
      newPlan,
      tableCrumbs,
    } = this.state;
    if ((planId && !planById) || !newPlan || isLoadingJurisdictions || isBuildingGisidaProps) {
      return <Loading />;
    }

    const pageLabel =
      (isFinalizedPlan && planById && planById.plan_title) ||
      (isDraftPlan && planById && `${planById.plan_title} (draft)`) ||
      (newPlan && newPlan.plan_title) ||
      NEW_PLAN;

    const breadCrumbProps = this.getBreadCrumbProps(this.props, pageLabel);

    const { planTableProps } = this.state;

    const onSaveAsDraftButtonClick = () => {
      this.onSavePlanButtonClick();
    };
    const onSaveFinalizedPlanButtonClick = () => {
      this.onSavePlanButtonClick(true);
    };

    const planHeaderRow = (
      <Row>
        {isFinalizedPlan && (
          <Col xs="8" className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
          </Col>
        )}
        {!isFinalizedPlan && (
          <Col xs="8" className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
          </Col>
        )}

        <Col xs="4" className="save-plan-buttons-column">
          {!isFinalizedPlan && (
            <Button
              className="save-plan-as-draft-btn"
              color="success"
              disabled={isSaveDraftDisabled}
              onClick={onSaveAsDraftButtonClick}
              outline={isDraftPlan}
              size="sm"
            >
              Save as a Draft
            </Button>
          )}
          <Button
            className="save-as-finalized-plan-btn"
            color="primary"
            disabled={isSaveDraftDisabled}
            onClick={onSaveFinalizedPlanButtonClick}
            size="sm"
          >
            Save Finalized Plan
          </Button>
        </Col>
      </Row>
    );

    const onTableBreadCrumbClick = (e: MouseEvent) => {
      this.onTableBreadCrumbClick(e);
    };
    const tableBreadCrumbs = (
      <ol className="table-bread-crumbs breadcrumb">
        {this.state.tableCrumbs.map((crumb, i) => {
          const { active, id, label } = crumb;
          return (
            <li key={i} className="breadcrumb-item">
              {active ? (
                label
              ) : (
                <a
                  className={`table-bread-crumb-link`}
                  href=""
                  id={id || 'null'}
                  onClick={onTableBreadCrumbClick}
                >
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    );

    return (
      <div className="mb-5">
        <Helmet>
          <title>IRS: {pageLabel}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        {planHeaderRow}

        {gisidaWrapperProps ? (
          <Row>
            <Col>
              <div className="map irs-plan-map">
                <GisidaWrapper {...gisidaWrapperProps} />
              </div>
            </Col>
          </Row>
        ) : !isFinalizedPlan ? (
          <Loading />
        ) : (
          ''
        )}

        {/* Section for table of jurisdictions */}
        {planTableProps && planTableProps.data && planTableProps.data.length ? (
          <Row>
            <Col>
              <h3 className="table-title">{`${
                isFinalizedPlan ? 'Assign' : 'Select'
              } Jurisdictions`}</h3>
              {tableCrumbs.length && tableBreadCrumbs}
              {doRenderTable && <DrillDownTable {...planTableProps} />}
            </Col>
          </Row>
        ) : (
          <Loading />
        )}
      </div>
    );
  }

  /** getAllAssignments - funciton to get all assignments for the plan from OpenSRP
   * @param {string} planId the id of the plan for which to return assignments
   * @param {Organization[]} organizations an array of Organizations by which to query assignments
   * @param {(assignments:Assignment[])=>any} callback a function handling the resulting Assignments
   * @returns {(assignments:Assignment[])=>any} the callback passing the Assignments as the first parameter
   */
  public getAllAssignments(
    planId: string,
    organizations: Organization[],
    callback: (assignments: Assignment[]) => any
  ) {
    // define a reference of all organization ids
    const organizationIds: string[] = organizations.map((o: Organization) => o.identifier);

    // generate api calls for each organization id
    const assignmentPromises = organizationIds.map(
      (o: string) =>
        new Promise((resolve, reject) => {
          OpenSrpAssignedService.read(o, { plan: planId })
            .then(j => resolve(j))
            .catch(error => reject(error));
        })
    );

    // make all the calls to get assignments per org for the plan
    return Promise.all(assignmentPromises).then((results: any[]) => {
      const nextAssignments: Assignment[] = [];
      // step through all api results per organization
      for (let o = 0; o < results.length; o += 1) {
        const result = results[o];
        if (Array.isArray(result)) {
          // loop through all Assignments for this org in this plan
          for (const assignment of result) {
            if (assignment.planId === planId) {
              // ingest assigned Assignments as assignable Assignments
              nextAssignments.push({
                fromDate: moment(assignment.fromDate).format(),
                jurisdiction: assignment.jurisdictionId,
                organization: organizationIds[o],
                plan: planId,
                toDate: moment(assignment.toDate).format(),
              });
            }
          }
        }
      }
      // save the Assignments to the store
      return callback(nextAssignments);
    });
  }

  // Jurisdiction Hierarchy Control
  /** onTableBreadCrumbClick - handler for drilldown table breadcrumb clicks to reset the table hierarchy
   * @param {MouseEvent} e - event object from clicking the table breadcrumb
   */
  private onTableBreadCrumbClick = (e: MouseEvent) => {
    preventDefault(e);
    if (e && e.currentTarget && e.currentTarget.id) {
      // update map position
      const clickedTableCrumb = this.state.tableCrumbs.find(c => c.id === e.currentTarget.id);
      if (clickedTableCrumb && clickedTableCrumb.bounds && this.state.country) {
        // update map position
        setGisidaMapPosition({ bounds: clickedTableCrumb.bounds });

        // update map layer filters
        const filteredJurisdictions = this.state.filteredJurisdictionIds.map(
          j => this.props.jurisdictionsById[j]
        );
        const geographicLevel = this.state.tableCrumbs.map(c => c.id).indexOf(clickedTableCrumb.id);
        const fauxE: EventData = {
          bounds: clickedTableCrumb.bounds,
          clickedId: clickedTableCrumb.id,
          geographicLevel,
          target: getGisidaMapById(MAP_ID),
        };
        this.onDrillUpClick(fauxE, this.state.country, filteredJurisdictions);

        // update drilldown table
        this.onResetDrilldownTableHierarchy(clickedTableCrumb.id);
      }
    }
  };
  /** onResetDrilldownTableHierarchy - function for resetting drilldown table hierachy baseline
   * @param {string|null} Id - the id of the highest level parent_idto show in the table, or null to reset completely
   */
  private onResetDrilldownTableHierarchy(Id: string | null) {
    const id = Id !== 'null' ? Id : null;
    const { tableCrumbs } = this.state;
    const nextActiveCrumbIndex = tableCrumbs.map(c => c.id).indexOf(id) + 1;
    const nextCrumbs = tableCrumbs.map(c => ({ ...c, active: false }));
    nextCrumbs.splice(nextActiveCrumbIndex);
    nextCrumbs[nextCrumbs.length - 1].active = true;

    this.setState(
      {
        doRenderTable: false,
        focusJurisdictionId: id,
        tableCrumbs: nextCrumbs,
      },
      () => {
        const planTableProps = this.getDrilldownPlanTableProps(this.state);
        this.setState({
          doRenderTable: true,
          planTableProps,
        });
      }
    );
  }
  /** onDrilldownClick - function to update the drilldown breadcrumbs when drilling down into the hierarchy
   * @param {string} id - the jurisdiction_id of the Jurisdiction clicked
   */
  private onDrilldownClick(id: string) {
    const { tableCrumbs } = this.state;
    const { jurisdictionsById } = this.props;

    const newCrumb: TableCrumb | null =
      (jurisdictionsById[id] && {
        active: true,
        id,
        label: jurisdictionsById[id].name || 'Jurisdiction',
      }) ||
      null;

    if (newCrumb) {
      // rebuild tableCrumbs
      const newCrumbs: TableCrumb[] = tableCrumbs.map(c => ({
        ...c,
        active: false,
      }));

      // update map position
      const jurisdictionFeature = getFeatureByProperty('jurisdictionId', id);
      if (jurisdictionFeature && jurisdictionFeature.geometry) {
        const bounds = GeojsonExtent(jurisdictionFeature.geometry);
        newCrumb.bounds = bounds;
        setGisidaMapPosition({ bounds });
        this.updateMapOnHierarchyChange(jurisdictionFeature, jurisdictionsById[id]);
      }

      newCrumbs.push(newCrumb);

      this.setState(
        {
          focusJurisdictionId: (id as string) || null,
          tableCrumbs: [...newCrumbs],
        },
        () => {
          const planTableProps = this.getDrilldownPlanTableProps(this.state);
          this.setState({ planTableProps });
        }
      );
    }
  }

  /** loadJurisdictionGeometries - utility to define and fetch any required Jurisdiction GeoJSON from OpenSRP */
  private loadJurisdictionGeometries() {
    // Get geoms for jurisdictionsToInclude
    const {
      childlessChildrenIds: ChildlessChildrenIds,
      country,
      filteredJurisdictionIds,
    } = this.state;
    const { jurisdictionsById } = this.props;

    const doLoadAllGeojson = country && country.tilesets && !country.tilesets.length;
    const doLoadOperationalGeometries =
      !country ||
      !country.tilesets ||
      !country.tilesets.length ||
      !country.tilesets
        .map(t => t.jurisdictionType)
        .includes(JurisdictionLevels[1] as JurisdictionTypes);

    // Determine which Jurisdictions will need to be updated in state
    const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);

    const childlessChildren = ChildlessChildrenIds.map(j => jurisdictionsById[j]);

    const loadedJurisdictionIds = childlessChildren
      .filter(j => !!j.geojson)
      .map(j => j.jurisdiction_id);
    const jurisdictionIdsToLoad = ChildlessChildrenIds.filter(
      j => !loadedJurisdictionIds.includes(j)
    );

    // Determine all parent_ids of childless children jurisdictions
    const jurisdictionIdsToCall: string[] = doLoadAllGeojson
      ? filteredJurisdictions.map(j => j.jurisdiction_id)
      : [];

    if (!doLoadAllGeojson && doLoadOperationalGeometries) {
      for (const child of childlessChildren) {
        if (
          child.parent_id &&
          child.parent_id.length &&
          child.parent_id !== 'null' &&
          !jurisdictionIdsToCall.includes(child.parent_id)
        ) {
          jurisdictionIdsToCall.push(child.parent_id);
        }
      }
    }

    // Build a list of OpenSRP API calls to make (fetch by parent_id to reduce number of calls)
    if (jurisdictionIdsToCall.length) {
      const promises = [];
      for (const jurisdiction of jurisdictionIdsToCall) {
        const endpoint = doLoadAllGeojson ? jurisdiction : OPENSRP_FIND_BY_PROPERTIES;
        const params = { is_jurisdiction: true, return_geometry: true };
        if (!doLoadAllGeojson) {
          (params as any).properties_filter = `${OPENSRP_PARENT_ID}:${jurisdiction}`;
        }
        promises.push(
          new Promise((resolve, reject) => {
            OpenSrpLocationService.read(endpoint, params)
              .then(j => resolve(j))
              .catch(error => reject(error));
          })
        );
      }

      // Make all calls to OpenSRP API
      Promise.all(promises).then((results: any[]) => {
        const jurisdictions: Jurisdiction[] = [];
        // Loop through all parent_id results
        for (const Result of results) {
          const result = Array.isArray(Result) ? [...Result] : [{ ...Result }];
          // Loop through all children of parent
          for (const geojson of result) {
            // If the child geojson needs to be loaded into state, do so
            if (doLoadAllGeojson || jurisdictionIdsToLoad.includes(geojson.id)) {
              const J = jurisdictionsById[geojson.id];
              if (J) {
                const j: Jurisdiction = {
                  ...J,
                  geojson,
                };
                jurisdictions.push(j);
              }
            }
          }
        }
        // Update the store with newly loaded jurisdictions with geojson
        this.props.fetchJurisdictionsActionCreator(jurisdictions);
      });
    } else {
      this.setState(
        {
          isBuildingGisidaProps: true,
          isLoadingGeoms: false,
        },
        () => {
          const gisidaWrapperProps = this.getGisidaWrapperProps();
          this.setState({
            gisidaWrapperProps,
            isBuildingGisidaProps: false,
          });
        }
      );
    }
  }

  // Jurisdiction Selection Control (which jurisidcitions should be included in the plan)
  /** onToggleJurisdictionSelection - toggles selection of clicked Jurisdiction and all descendants
   * @param {string} id - the jurisdiction_id of the Jurisdiction being toggled
   */
  private onToggleJurisdictionSelection(id: string) {
    const { newPlan: NewPlan, filteredJurisdictionIds, country } = this.state;
    const { jurisdictionsById } = this.props;

    const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);
    const filteredJurisdictionsById = keyBy(filteredJurisdictions, j => j.jurisdiction_id);
    if (NewPlan && NewPlan.plan_jurisdictions_ids && filteredJurisdictions.length) {
      const newPlanJurisdictionIds = [...NewPlan.plan_jurisdictions_ids];
      const clickedFeatureJurisdiction = jurisdictionsById[id];
      const doSelect = !newPlanJurisdictionIds.includes(id);
      // define child jurisdictions of clicked jurisdiction
      const jurisdictionIdsToToggle = this.getDescendantJurisdictionIds(
        [id],
        filteredJurisdictionsById
      );

      // loop through all child jurisdictions
      for (const jurisdictionId of jurisdictionIdsToToggle) {
        // if checked and not in plan_jurisdictions_ids, add it
        if (doSelect && !newPlanJurisdictionIds.includes(jurisdictionId)) {
          newPlanJurisdictionIds.push(jurisdictionId);
          // if not checked and in plan_jurisdictions_ids, remove it
        } else if (!doSelect && newPlanJurisdictionIds.includes(jurisdictionId)) {
          newPlanJurisdictionIds.splice(newPlanJurisdictionIds.indexOf(jurisdictionId), 1);
        }
      }

      const { parent_id } = clickedFeatureJurisdiction;
      const isParentSelected = doSelect
        ? true
        : parent_id && this.getIsJurisdictionPartiallySelected(parent_id, newPlanJurisdictionIds);
      if (parent_id && !isParentSelected) {
        newPlanJurisdictionIds.splice(newPlanJurisdictionIds.indexOf(parent_id), 1);
      } else if (parent_id && isParentSelected && !newPlanJurisdictionIds.includes(parent_id)) {
        newPlanJurisdictionIds.push(parent_id);
      }

      // loop through all geographic_levels
      const geoGraphicLevels = this.getGeographicLevelsFromJurisdictions(filteredJurisdictions);
      if (country && country.tilesets) {
        const Map = getGisidaMapById(MAP_ID);

        for (let g = 1; g < geoGraphicLevels.length; g += 1) {
          // Define stops per geographic_level
          const jurisdictionsByLevelArray = filteredJurisdictions.filter(
            j => j.geographic_level === g
          );
          const nextPaintStops = this.getJurisdictionSelectionStops(
            newPlanJurisdictionIds,
            jurisdictionsByLevelArray,
            country.tilesets[g]
          );
          // Apply stops to the layer
          if (Map && Map.getLayer(`${country.ADMN0_EN}-admin-${g}-fill`)) {
            Map.setPaintProperty(
              `${country.ADMN0_EN}-admin-${g}-fill`,
              'fill-opacity',
              nextPaintStops
            );
          }
          if (Map && Map.getLayer(`${country.ADMN0_EN}-admin-${g}-jurisdiction-fill`)) {
            Map.setPaintProperty(
              `${country.ADMN0_EN}-admin-${g}-jurisdiction-fill`,
              'fill-opacity',
              nextPaintStops
            );
          }
        }
      }

      // define newPlan with newPlanJurisdictionIds, set state
      const newPlan: PlanRecord = {
        ...NewPlan,
        plan_jurisdictions_ids: [...newPlanJurisdictionIds],
      };
      this.setState({ newPlan }, () => {
        const planTableProps = this.getDrilldownPlanTableProps(this.state);
        this.setState({ planTableProps });
      });
    }
  }
  /** onTableCheckboxChange - handler for drilldown table checkbox click which calls this.onToggleJurisdictionSelection
   * @param {any} e - event object from Drilldown table checkbox click
   */
  private onTableCheckboxChange(e: any) {
    if (e && e.target) {
      const { value: id } = e.target;
      this.onToggleJurisdictionSelection(id);
    }
  }
  /** onToggleAllCheckboxChange - handler for de/select all Jurisdictions checkbox which updates component state
   * @param {any} e - event object from drilldown table toggle-all checkbox click
   */
  private onToggleAllCheckboxChange(e: any) {
    const { newPlan: NewPlan, filteredJurisdictionIds, focusJurisdictionId } = this.state;
    const { jurisdictionsById } = this.props;

    if (e && e.target && NewPlan) {
      const { checked: isSelected } = e.target;
      const { plan_jurisdictions_ids } = NewPlan;

      const selectedIds = (plan_jurisdictions_ids && [...plan_jurisdictions_ids]) || [
        ...filteredJurisdictionIds,
      ];
      const decendantIds = focusJurisdictionId
        ? this.getDescendantJurisdictionIds([focusJurisdictionId], jurisdictionsById)
        : [...filteredJurisdictionIds];

      // const newPlanJurisdictionIds: string[] = [];
      if (focusJurisdictionId && isSelected) {
        // select previously deselected descendants
        for (const d of decendantIds) {
          if (!selectedIds.includes(d)) {
            selectedIds.push(d);
          }
        }
      } else if (focusJurisdictionId && !isSelected) {
        // de-select previously selected descendants
        for (const d of decendantIds) {
          if (selectedIds.includes(d)) {
            selectedIds.splice(selectedIds.indexOf(d), 1);
          }
        }
      } else if (!focusJurisdictionId) {
        selectedIds.length = 0;
        if (isSelected) {
          selectedIds.concat(...filteredJurisdictionIds);
        }
      }

      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_jurisdictions_ids: [...selectedIds],
      };

      this.setState({ newPlan }, () => {
        const {
          country: nextCountry,
          filteredJurisdictionIds: nextFilteredJurisdictionIds,
          newPlan: nextNewPlan,
        } = this.state;
        const Map = getGisidaMapById(MAP_ID);

        // Loop through geographic levels and update selection fill-opacity stops
        if (nextCountry && Map) {
          const nextFilteredJurisdictions = nextFilteredJurisdictionIds.map(
            j => jurisdictionsById[j]
          );
          const selectedJurisdictionsIds =
            nextNewPlan && nextNewPlan.plan_jurisdictions_ids
              ? [...nextNewPlan.plan_jurisdictions_ids]
              : [...nextFilteredJurisdictionIds];

          const geoGraphicLevels = this.getGeographicLevelsFromJurisdictions(
            nextFilteredJurisdictions
          );

          for (let d = 1; d < geoGraphicLevels.length; d += 1) {
            // all Jurisdictions for this geographic level
            const adminLevelJurs = nextFilteredJurisdictionIds
              .filter(j => jurisdictionsById[j] && jurisdictionsById[j].geographic_level === d)
              .map(j => jurisdictionsById[j]);
            // Mapbox categorical stops style spec
            const adminFillOpacity = this.getJurisdictionSelectionStops(
              selectedJurisdictionsIds,
              adminLevelJurs,
              (nextCountry && nextCountry.tilesets && nextCountry.tilesets[d]) || undefined
            );

            if (Map && Map.getLayer(`${nextCountry.ADMN0_EN}-admin-${d}-fill`)) {
              Map.setPaintProperty(
                `${nextCountry.ADMN0_EN}-admin-${d}-fill`,
                'fill-opacity',
                adminFillOpacity
              );
            } else if (
              Map &&
              Map.getLayer(`${nextCountry.ADMN0_EN}-admin-${d}-jurisdiction-fill`)
            ) {
              Map.setPaintProperty(
                `${nextCountry.ADMN0_EN}-admin-${d}-jurisdiction-fill`,
                'fill-opacity',
                adminFillOpacity
              );
            }
          }

          const planTableProps = this.getDrilldownPlanTableProps(this.state);
          this.setState({ planTableProps });
        }
      });
    }
  }

  // Getter methods
  /** getChildlessChildrenIds - hierarchy util to get all childless descendants of certain Jurisdictions
   * @param {Jurisdiction[]} filteredJurisdictions - list of Jurisdictions of which to find the childless descendants
   * @returns {string[]} list of jurisdiction_ids of childless descendants
   */
  private getChildlessChildrenIds(filteredJurisdictions: Jurisdiction[]): string[] {
    const childlessChildrenIds = filteredJurisdictions.map(j => j.jurisdiction_id);
    let jndex = 0;

    for (const jurisdiction of filteredJurisdictions) {
      if (jurisdiction && jurisdiction.parent_id) {
        jndex = childlessChildrenIds.indexOf(jurisdiction.parent_id);
        if (jndex !== -1) {
          childlessChildrenIds.splice(jndex, 1);
        }
      }
    }

    return childlessChildrenIds;
  }
  /** getDescendantJurisdictionIds - hierarchy util to get all descendants of certain Jurisdictions
   * @param {string[]} ParentIds - jurisdiction_ids of the parent jurisdictions for which to find descendants
   * @param {{[key:string]:Jurisdiction}} jurisdictionsById - list Jurisdictions through which to search for descendants
   * @param {boolean} doIncludeParentIds - boolean to determine whether or not to include ParentId strings in returned list
   * @returns {string[]} list of jurisdiction_ids of all descendants
   */
  private getDescendantJurisdictionIds(
    ParentIds: string[],
    jurisdictionsById: { [key: string]: Jurisdiction },
    doIncludeParentIds: boolean = true,
    ChildrenByParentId?: { [key: string]: string[] }
  ): string[] {
    const { childlessChildrenIds } = this.state;
    const childrenByParentId = ChildrenByParentId || this.state.childrenByParentId;
    const decendantIds: string[] = [];
    const parentIds: string[] = [...ParentIds];

    while (parentIds.length) {
      const parentId = parentIds.shift() as string;
      if (ParentIds.indexOf(parentId) === -1 || doIncludeParentIds) {
        decendantIds.push(parentId);
      }
      if (childrenByParentId && childrenByParentId[parentId]) {
        for (const jurisdcitionId of childrenByParentId[parentId]) {
          if (!decendantIds.includes(jurisdcitionId)) {
            decendantIds.push(jurisdcitionId);
          }
        }
      } else if (!childlessChildrenIds.includes(parentId)) {
        const jurisdictionsKeys = Object.keys(jurisdictionsById);
        for (const jurisdiction of jurisdictionsKeys) {
          if (jurisdictionsById[jurisdiction].parent_id === parentId) {
            parentIds.push(jurisdictionsById[jurisdiction].jurisdiction_id);
          }
        }
      }
    }

    return decendantIds;
  }
  /** getDescendantJurisdictionIds - recursive hierarchy util to get all ancestors of certain Jurisdictions
   * @param {string[]} ChildIds - jurisdiction_ids of the child jurisdictions for which to find ancestors
   * @param {Jurisdiction[] | {[key:string]:Jurisdiction}} jurisdictions- list or key/value map of Jurisdictions through which to search for descendants
   * @param {boolean} doIncludeChildIds - to determine whether or not to include ChildId strings in returned list
   * @returns {string[]} list of jurisdiction_ids of all ancestors
   */
  private getAncestorJurisdictionIds(
    ChildIds: string[],
    jurisdictions: Jurisdiction[] | { [key: string]: Jurisdiction },
    doIncludeChildIds: boolean = true
  ): string[] {
    let ancestorIds: string[] = [];
    const childIds: string[] = [...ChildIds];

    let jurisdictionsById: { [key: string]: Jurisdiction } = {};
    if (Array.isArray(jurisdictions)) {
      for (const jurisdiction of jurisdictions) {
        jurisdictionsById[jurisdiction.jurisdiction_id] = jurisdiction;
      }
    } else {
      jurisdictionsById = { ...jurisdictions };
    }
    if (!Object.keys(jurisdictionsById).length) {
      return doIncludeChildIds ? childIds : [];
    }

    for (const childId of childIds) {
      if (doIncludeChildIds) {
        ancestorIds.push(childId);
      }
      const { parent_id: parentId } = jurisdictionsById[childId];
      if (parentId && parentId !== 'null' && parentId.length) {
        const parentIds = this.getAncestorJurisdictionIds(
          [parentId],
          jurisdictionsById,
          doIncludeChildIds
        );
        ancestorIds = [...ancestorIds, ...parentIds];
      }
    }

    return Array.from(new Set(ancestorIds));
  }

  /** utility for getting opacity stops based on selection
   * @param {string[]} selectedIds - Ids of all selected Juristictions
   * @param {Jurisdiction[]} jurisdictions - all Jurisdictions filtered by geographic level
   * @param {FlexObject | undefined} tileset - the coorisponding tileset
   */
  private getJurisdictionSelectionStops(
    selectedIds: string[],
    jurisdictions: Jurisdiction[],
    tileset: FlexObject | undefined
  ) {
    const { childrenByParentId } = this.state;
    const uniqueKeys: string[] = [];
    const selectionStyle = {
      default: deselectedJurisdictionOpacity,
      property: (tileset && tileset.idField) || 'jurisdiction_id',
      stops: [] as Array<[string, number]>,
      type: 'categorical',
    };

    for (const j of jurisdictions) {
      // keys in stops must be unique
      if (!uniqueKeys.includes(j.jurisdiction_id) && selectedIds.includes(j.jurisdiction_id)) {
        uniqueKeys.push(j.jurisdiction_id);
        let opacity: number = fullySelectedJurisdictionOpacity;
        if (childrenByParentId[j.jurisdiction_id]) {
          const selectedChildren =
            (childrenByParentId[j.jurisdiction_id] &&
              childrenByParentId[j.jurisdiction_id].filter(c => selectedIds.includes(c))) ||
            [];
          opacity =
            childrenByParentId[j.jurisdiction_id] &&
            selectedChildren.length !== childrenByParentId[j.jurisdiction_id].length
              ? partiallySelectedJurisdictionOpacity
              : fullySelectedJurisdictionOpacity;
        }

        selectionStyle.stops.push([j.jurisdiction_id, opacity]);
      }
    }
    return (selectionStyle.stops.length && selectionStyle) || deselectedJurisdictionOpacity;
  }

  /** getGeographicLevelsFromJurisdictions - utility to derive all geographic levels
   * @param {Jurisdiction[]} filteredJurisdictions - array of Jurisdictions relevant to the country
   * @returns {number[]} array of geographic levels as integers
   */
  private getGeographicLevelsFromJurisdictions(filteredJurisdictions: Jurisdiction[]): number[] {
    const geoGraphicLevels: number[] = [];
    for (const j of filteredJurisdictions) {
      const { geographic_level } = j;
      if (
        typeof geographic_level !== 'undefined' &&
        geoGraphicLevels.indexOf(geographic_level) === -1
      ) {
        geoGraphicLevels.push(geographic_level);
      }
    }
    geoGraphicLevels.sort();
    return geoGraphicLevels;
  }

  /** getGisidaWrapperProps - GisidaWrapper prop builder building out layers and handlers for Gisida
   * @returns {GisidaProps|null} props object for the GisidaWrapper or null
   */
  private getGisidaWrapperProps(): GisidaProps | null {
    const { country, isLoadingGeoms, filteredJurisdictionIds, newPlan } = this.state;
    const { jurisdictionsById } = this.props;
    const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);

    if (!country || isLoadingGeoms) {
      return null;
    }
    const { ADMN0_EN, tilesets, bounds } = country;
    if (!tilesets) {
      return null;
    }

    const ADMIN_LINE_LAYERS: FlexObject[] = [];
    const adminBorderWidths: number[] = [1.5, 1, 0.75, 0.5];
    for (let t = 0; t < tilesets.length; t += 1) {
      if (tilesets[t].jurisdictionType === JurisdictionLevels[0]) {
        const adminLineLayer = {
          ...lineLayerConfig,
          id: `${ADMN0_EN}-admin-${t}-line`,
          paint: {
            'line-color': 'white',
            'line-opacity': t ? 1 : 0.45,
            'line-width': adminBorderWidths[t],
          },
          source: {
            layer: tilesets[t].layer,
            type: 'vector',
            url: tilesets[t].url,
          },
          visible: true,
        };
        ADMIN_LINE_LAYERS.push(adminLineLayer);
      }
    }

    const ADMIN_FILL_LAYER_IDS: string[] = [];
    const ADMIN_FILL_LAYERS: FlexObject[] = [];
    const selectedJurisdictionsIds =
      newPlan && newPlan.plan_jurisdictions_ids
        ? [...newPlan.plan_jurisdictions_ids]
        : [...filteredJurisdictionIds];

    for (let t = 1; t < tilesets.length; t += 1) {
      const adminFillLayerId = `${ADMN0_EN}-admin-${t}-fill`;

      const adminLevelJurs = filteredJurisdictionIds
        .filter(j => jurisdictionsById[j] && jurisdictionsById[j].geographic_level === t)
        .map(j => jurisdictionsById[j]);

      const adminFillOpacity = this.getJurisdictionSelectionStops(
        selectedJurisdictionsIds,
        adminLevelJurs,
        tilesets[t]
      );

      ADMIN_FILL_LAYER_IDS.unshift(adminFillLayerId);
      const adminFillLayer = {
        ...fillLayerConfig,
        id: adminFillLayerId,
        paint: {
          'fill-color': adminLayerColors[t],
          'fill-opacity': adminFillOpacity,
        },
        source: {
          layer: tilesets[t].layer,
          type: 'vector',
          url: tilesets[t].url,
        },
        visible: true,
      };

      const tooltipVal = tilesets[t].labelField || tilesets[t].idField;
      if (tooltipVal && tooltipVal.length) {
        (adminFillLayer as any).popup = {
          body: `<div><p class="select-jurisdictin-tooltip">{{${tooltipVal}}}</p><span class="select-jurisdictin-tooltip-hint">${jurisdictionSelectionTooltipHint}</span></div>`,
        };
      }

      if (t > 1) {
        (adminFillLayer as any).filter = ['==', tilesets[t].parentIdField, ''];
      }

      ADMIN_FILL_LAYERS.unshift(adminFillLayer);
    }

    const self = this;
    function getJurisdictionFillLayers(jurisdictions: Jurisdiction[], tiles: Tileset[]) {
      const filteredJurisdictionsById = keyBy(jurisdictions, j => j.jurisdiction_id);
      const jurisdictionIds = jurisdictions.map(j => j.jurisdiction_id);
      const layers: FlexObject[] = [];
      const geoGraphicLevels: number[] = [];
      const layerIds: string[] = [];
      const adminLayerIds: string[] = [];
      const jurisdictionFeatures: JurisdictionGeoJSON[] = [];

      const operationalTilesets =
        tilesets &&
        tilesets.filter(t => t.jurisdictionType === (JurisdictionLevels[1] as JurisdictionTypes));
      const selectedIds =
        self.state.newPlan && self.state.newPlan.plan_jurisdictions_ids
          ? [...self.state.newPlan.plan_jurisdictions_ids]
          : [...filteredJurisdictionIds];

      if (tilesets && operationalTilesets && operationalTilesets.length) {
        const operationalGeographicLevelIndecies = operationalTilesets.map(ot =>
          tilesets.map(t => t.layer).indexOf(ot.layer)
        );
        for (const g of operationalGeographicLevelIndecies) {
          const geoLevelIds: string[] = jurisdictionIds.filter(
            j => filteredJurisdictionsById[j].geographic_level === g
          );
          const geoLevelJurs = geoLevelIds.map(j => filteredJurisdictionsById[j]);

          const selectionFillOpacity = self.getJurisdictionSelectionStops(
            selectedIds,
            geoLevelJurs,
            tilesets[g]
          );

          const layerId = `${ADMN0_EN}-admin-${g}-jurisdiction-fill`;
          const layer = {
            ...fillLayerConfig,
            filter: g !== 1 ? ['==', 'parentId', ''] : null,
            id: layerId,
            paint: {
              'fill-color': adminLayerColors[g],
              'fill-opacity': selectionFillOpacity,
            },
            popup: {
              body: '<p class="select-jurisdictin-tooltip">{{name}}</p>',
              join: [],
            },
            source: {
              layer: tilesets[g].layer,
              type: 'vector',
              url: tilesets[g].url,
            },
            visible: true,
          };

          if (tiles.length || (!tiles.length && !(g < geoGraphicLevels.length - 1))) {
            layerIds.push(layerId);
          } else {
            adminLayerIds.unshift(layerId);
          }

          layers.unshift(layer);
        }
      } else {
        // Derive geographic levels
        for (const j of jurisdictions) {
          const { geographic_level } = j;
          if (
            typeof geographic_level !== 'undefined' &&
            geoGraphicLevels.indexOf(geographic_level) === -1
          ) {
            geoGraphicLevels.push(geographic_level);
          }
        }
        geoGraphicLevels.sort();

        for (let i = 1; i < geoGraphicLevels.length; i += 1) {
          const g = geoGraphicLevels[i];
          const featureCollection = {
            features: jurisdictions
              .filter(j => j.geographic_level === g)
              .map(j => {
                if (j.geojson) {
                  return {
                    ...j.geojson,
                    properties: {
                      ...j.geojson.properties,
                      jurisdiction_id: j.jurisdiction_id,
                      selected: true,
                    },
                  };
                }
                return false;
              })
              .filter(geojson => geojson),
            type: 'FeatureCollection',
          };

          // stash features for bounds
          for (const feature of featureCollection.features) {
            jurisdictionFeatures.push(feature as JurisdictionGeoJSON);
          }

          const geoLevelIds: string[] = featureCollection.features
            .map(f => (f && f.properties && f.properties.jurisdiction_id) || '')
            .filter(j => j !== '' && selectedIds.includes(j));

          const geoLevelJurs: Jurisdiction[] = jurisdictions.filter(j =>
            geoLevelIds.includes(j.jurisdiction_id)
          );

          const selectionFillOpacity = self.getJurisdictionSelectionStops(
            selectedIds,
            geoLevelJurs,
            undefined
          );

          const layerId = `${ADMN0_EN}-admin-${g}-jurisdiction-fill`;
          const layer = {
            ...fillLayerConfig,
            filter: g !== 1 ? ['==', 'parentId', ''] : null,
            id: layerId,
            paint: {
              'fill-color': adminLayerColors[g],
              'fill-opacity': selectionFillOpacity,
            },
            popup: {
              body: '<p class="select-jurisdictin-tooltip">{{name}}</p>',
              join: [],
            },
            source: {
              ...fillLayerConfig.source,
              data: {
                ...fillLayerConfig.source.data,
                data: JSON.stringify(featureCollection),
              },
            },
            visible: true,
          };

          if (tiles.length || (!tiles.length && !(i < geoGraphicLevels.length - 1))) {
            layerIds.push(layerId);
          } else {
            adminLayerIds.unshift(layerId);
          }

          layers.unshift(layer);
        }
      }

      return {
        JURISDICTION_ADMIN_LAYER_IDS: adminLayerIds,
        JURISDICTION_BOUNDS: GeojsonExtent({
          features: [...jurisdictionFeatures],
          type: 'FeatureCollection',
        }),
        JURISDICTION_FILL_LAYERS: layers,
        JURISDICTION_LAYER_IDS: layerIds,
      };
    }

    const {
      JURISDICTION_ADMIN_LAYER_IDS,
      JURISDICTION_BOUNDS,
      JURISDICTION_FILL_LAYERS,
      JURISDICTION_LAYER_IDS,
    } = getJurisdictionFillLayers(filteredJurisdictions, tilesets);

    const onAdminFillClickLayerIds = tilesets.length
      ? ADMIN_FILL_LAYER_IDS
      : JURISDICTION_ADMIN_LAYER_IDS;

    const onAdminFillClickHandler: Handlers = {
      method: e => {
        this.onAdminFillClick(e, country, [...onAdminFillClickLayerIds].reverse(), [
          ...JURISDICTION_LAYER_IDS,
        ]);
      },
      name: `${ADMN0_EN}-fill-drilldown`,
      type: 'click',
    };

    const drillUpHandler: Handlers = {
      method: e => {
        this.onDrillUpClick(e, country, filteredJurisdictions);
      },
      name: 'drill-up-handler',
      type: 'click',
    };

    const gisidaWrapperProps: GisidaProps = {
      bounds: bounds || JURISDICTION_BOUNDS,
      geoData: null,
      handlers: [onAdminFillClickHandler, drillUpHandler],
      layers: [...ADMIN_LINE_LAYERS, ...JURISDICTION_FILL_LAYERS, ...ADMIN_FILL_LAYERS],
      pointFeatureCollection: null,
      polygonFeatureCollection: null,
      structures: null,
    };
    return gisidaWrapperProps;
  }

  /** onAdminFillClick - map click handler passed into Gisida for map drill down functionality
   * @param {MouseEvent} e - Mapbox Event object
   * @param {JurisdictionsByCountry} country - JurisdictionsByCountry object containing basic hierarchy information per country
   * @param {string[]} adminLayerIds - The ids of Gisida admin-fill layers
   * @param {string[]} jurisdictionLayerIds - The ids of Gisida (operational-)jurisdiction-fill layers
   */
  private onAdminFillClick(
    e: EventData,
    country: JurisdictionsByCountry,
    adminLayerIds: string[],
    jurisdictionLayerIds: string[]
  ) {
    const { point, target: Map, originalEvent } = e;
    const features = Map.queryRenderedFeatures(point);
    const feature = features[0];

    if (
      !feature ||
      !feature.layer ||
      !feature.layer.id ||
      (!adminLayerIds.includes(feature.layer.id) &&
        !jurisdictionLayerIds.includes(feature.layer.id))
    ) {
      return false;
    }
    const isShiftClick = originalEvent.shiftKey;
    const isJurisdictionLayer = jurisdictionLayerIds.includes(feature.layer.id);
    const geographicLevel = [...adminLayerIds, ...jurisdictionLayerIds].indexOf(feature.layer.id);
    const { filteredJurisdictionIds, childlessChildrenIds } = this.state;
    const { jurisdictionsById } = this.props;
    const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);

    if (feature && country.tilesets) {
      const { properties } = feature;

      const doUseTilesets = !!country.tilesets[geographicLevel];
      const clickedFeatureId =
        doUseTilesets &&
        (!isJurisdictionLayer ||
          (isJurisdictionLayer &&
            country.tilesets[geographicLevel].jurisdictionType === JurisdictionLevels[1]))
          ? properties[country.tilesets[geographicLevel].idField]
          : properties.jurisdiction_id;

      const clickedFeatureJurisdiction = filteredJurisdictions.find(
        j => j[JURISDICTION_ID] === clickedFeatureId
      ) as Jurisdiction;

      if (
        clickedFeatureJurisdiction &&
        !isShiftClick &&
        !isJurisdictionLayer &&
        !childlessChildrenIds.includes(clickedFeatureId)
      ) {
        // handle Drilldown Click
        this.onDrilldownClick(clickedFeatureJurisdiction.jurisdiction_id);
        this.onResetDrilldownTableHierarchy(clickedFeatureJurisdiction.jurisdiction_id);
        this.updateMapOnHierarchyChange(feature, clickedFeatureJurisdiction);
      } else if (isShiftClick && clickedFeatureJurisdiction) {
        // Handle selection click
        this.onToggleJurisdictionSelection(clickedFeatureJurisdiction.jurisdiction_id);
      }
    }
  }

  /** updates the Gisida Layers' filters and updates the position of the map
   * @param {MapboxGeoJSONFeature} feature - the mapbox feature which was clicked
   * @param {Jurisdiction} clickedFeatureJurisdiction - the Jurisdiction coorisponding to the clicke feature
   */
  private updateMapOnHierarchyChange(
    feature: MapboxGeoJSONFeature,
    clickedFeatureJurisdiction: Jurisdiction
  ) {
    const { country } = this.state;
    if (country) {
      const geographicLevel = clickedFeatureJurisdiction.geographic_level || 1;
      const Map = getGisidaMapById(MAP_ID);
      const { layer, properties, geometry } = feature;

      const { tilesets } = country;
      const layerIds = Map && (Map as any).style && Object.keys((Map as any).style.sourceCaches);

      if (Map && tilesets && properties && layerIds) {
        const doUseTilesets = !!tilesets[geographicLevel];
        if (geographicLevel === baseTilesetGeographicLevel) {
          if (Map.getLayer(layer.id)) {
            Map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        } else {
          const layerFilter = Map.getFilter(layer.id);
          if (layerFilter) {
            layerFilter[2] = '';
            Map.setFilter(layer.id, layerFilter);
          } else {
            Map.setFilter(layer.id, ['==', PARENTID, clickedFeatureJurisdiction.jurisdiction_id]);
          }
        }

        const adminLayerIds = layerIds.filter(l => l.includes('jurisdiction-fill')).sort();
        const nextAdminTileset = tilesets[geographicLevel + 1];
        const nextAdminIdIndex = adminLayerIds.indexOf(
          `${country.ADMN0_EN}-admin-${geographicLevel + 1}-jurisdiction-fill`
        );
        const nextAdminLayerId = nextAdminIdIndex !== -1 && adminLayerIds[nextAdminIdIndex];
        // check for next Admin fill layer
        if ((tilesets.length && nextAdminTileset) || (!tilesets.length && nextAdminLayerId)) {
          // zoom to clicked admin level
          const newBounds: LngLatBoundsLike = GeojsonExtent(geometry);
          setGisidaMapPosition({ bounds: newBounds });
          // toggle next admin fill layer
          const nextLayerId =
            nextAdminLayerId || `${country.ADMN0_EN}-admin-${geographicLevel + 1}-fill`;
          // update layer filter of next admin level fill layer
          if (Map.getLayer(nextLayerId)) {
            const nextLayerFilter = Map.getFilter(nextLayerId);
            if (nextLayerFilter && tilesets && tilesets[geographicLevel]) {
              nextLayerFilter[2] = properties[tilesets[geographicLevel].idField];
              Map.setFilter(nextLayerId, nextLayerFilter);
            } else if (nextLayerFilter) {
              nextLayerFilter[2] = properties.jurisdiction_id;
              Map.setFilter(nextLayerId, nextLayerFilter);
            } else {
              Map.setFilter(nextLayerId, ['==', PARENTID, properties.jurisdiction_id]);
            }
          }
        } else {
          const { jurisdictionsById } = this.props;
          const { childlessChildrenIds, filteredJurisdictionIds } = this.state;
          const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);
          const filteredJurisdictionsById = keyBy(filteredJurisdictions, j => j.jurisdiction_id);

          const decendantLayerId = `${country.ADMN0_EN}-admin-${geographicLevel +
            1}-jurisdiction-fill`;
          if (!doUseTilesets) {
            for (const adminLayer of adminLayerIds) {
              if (Map.getLayer(adminLayer)) {
                const layerFilter = Map.getFilter(adminLayer);
                if (layerFilter) {
                  layerFilter[2] = '';
                  Map.setFilter(adminLayer, layerFilter);
                } else {
                  Map.setFilter(adminLayer, ['==', PARENTID, '']);
                }
              }
            }
          }

          // define childless decendant jurisdictions
          const decendantChildlessChildrenIds = this.getDescendantJurisdictionIds(
            [clickedFeatureJurisdiction.jurisdiction_id],
            filteredJurisdictionsById,
            false
          );
          // update jurisdictions layer filter
          if (Map.getLayer(decendantLayerId)) {
            const nextLayerFilter = Map.getFilter(decendantLayerId);
            if (nextLayerFilter) {
              nextLayerFilter[2] = clickedFeatureJurisdiction.jurisdiction_id;
              Map.setFilter(decendantLayerId, nextLayerFilter);
            }
          }

          // define geojson of childless decendant jurisdictions
          const decendantChildlessFeatures = filteredJurisdictions
            .filter(
              j =>
                decendantChildlessChildrenIds.includes(j.jurisdiction_id) &&
                childlessChildrenIds.includes(j.jurisdiction_id)
            )
            .map(j => j.geojson);
          // zoom to extends of childless decendant jurisdiction geometries
          const newBounds: LngLatBoundsLike = GeojsonExtent({
            features: decendantChildlessFeatures,
            type: 'FeatureCollection',
          });
          if (newBounds) {
            setGisidaMapPosition({ bounds: newBounds });
          }
        }
      }
    }
  }

  /** onDrillUpClick - map click handler passed into Gisida for resetting the drilldown hierarchy
   * @param {EventData} e - Mapbox Event object
   * @param {JurisdictionsByCountry} country - JurisdictionsByCountry object containing basic hierarchy information per country
   * @param {Jurisdiction[]} filteredJurisdictions - filtered list of country-relevant Jurisdictions
   */
  private onDrillUpClick(
    e: EventData,
    country: JurisdictionsByCountry,
    filteredJurisdictions: Jurisdiction[]
  ) {
    const { geographicLevel, clickedId, point, target: Map } = e;
    const features = point ? Map.queryRenderedFeatures(point) : [];
    const { ADMN0_EN, jurisdictionId, tilesets } = country;
    const bounds = e.bounds || country.bounds;
    if (!features.length && tilesets && bounds) {
      if (tilesets.length) {
        let t = geographicLevel || baseTilesetGeographicLevel;
        for (t; t < tilesets.length; t += 1) {
          const layerId = `${ADMN0_EN}-admin-${t}-fill`;
          if (Map.getLayer(layerId)) {
            // Reset layers to default visibility
            if (t === 1 && geographicLevel !== t) {
              const isLayerVisible = Map.getLayoutProperty(layerId, 'visibility') === 'visible';
              if (!isLayerVisible) {
                Map.setLayoutProperty(layerId, 'visibility', 'visible');
              }
            } else {
              const layerFilter = Map.getFilter(layerId);
              if (layerFilter) {
                layerFilter[2] = t === geographicLevel + 1 ? clickedId : '';
                Map.setFilter(layerId, layerFilter);
              }
            }
          }
          if (tilesets[t].jurisdictionType === JurisdictionLevels[1]) {
            // Reset layer filter for operational Jurisdiction fill layer if defined in tileset
            const jurisdictionsTilesetLayerId = `${country.ADMN0_EN}-admin-${t}-jurisdiction-fill`;
            if (Map.getLayer(jurisdictionsTilesetLayerId)) {
              const jurisdicitonLayerFilter = Map.getFilter(jurisdictionsTilesetLayerId);
              if (jurisdicitonLayerFilter) {
                jurisdicitonLayerFilter[2] = '';
                Map.setFilter(jurisdictionsTilesetLayerId, jurisdicitonLayerFilter);
              }
            }
          }
        }

        // Reset layer filter for operational Jurisdiction fill layer if not defined in tileset
        const jurisdictionsGeojsonLayerId = `${country.ADMN0_EN}-admin-${t}-jurisdiction-fill`;
        if (Map.getLayer(jurisdictionsGeojsonLayerId)) {
          const jurisdicitonLayerFilter = Map.getFilter(jurisdictionsGeojsonLayerId);
          if (jurisdicitonLayerFilter) {
            jurisdicitonLayerFilter[2] = '';
            Map.setFilter(jurisdictionsGeojsonLayerId, jurisdicitonLayerFilter);
          }
        }
      }

      // todo - make this dry
      if (!tilesets.length) {
        const geoGraphicLevels: number[] = [];
        for (const j of filteredJurisdictions) {
          const { geographic_level } = j;
          if (
            typeof geographic_level !== 'undefined' &&
            geoGraphicLevels.indexOf(geographic_level) === -1
          ) {
            geoGraphicLevels.push(geographic_level);
          }
        }
        geoGraphicLevels.sort();
        for (const g of geoGraphicLevels) {
          const layerId = `${country.ADMN0_EN}-admin-${g}-jurisdiction-fill`;
          if (g !== 1 && Map.getLayer(layerId)) {
            const layerFilter = Map.getFilter(layerId);
            if (layerFilter) {
              layerFilter[2] = '';
              Map.setFilter(layerId, layerFilter);
            } else {
              Map.setFilter(layerId, ['==', 'parent_id', '']);
            }
          } else if (Map.getLayer(layerId)) {
            // Reset layers to default visibility
            const isLayerVisible = Map.getLayoutProperty(layerId, 'visibility') === 'visible';
            if (!isLayerVisible) {
              store.dispatch(Actions.toggleLayer(MAP_ID, layerId));
            }
            if (Map.getFilter(layerId)) {
              Map.setFilter(layerId, null);
            }
          }
        }
      }

      setGisidaMapPosition({ bounds });
      this.onResetDrilldownTableHierarchy(jurisdictionId.length ? jurisdictionId : null);
    }
  }

  /** getDrilldownPlanTableProps - getter for hierarchical DrilldownTable props
   * @param {IrsPlanState} state - component state
   * @returns {DrillDownProps<any>|null} - compatible object for DrillDownTable props or null
   */
  private getDrilldownPlanTableProps(state: IrsPlanState): DrillDownProps<any> | null {
    const { filteredJurisdictionIds, newPlan, focusJurisdictionId, tableCrumbs } = state;
    const { assignmentsArray, jurisdictionsById, planId } = this.props;
    const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);
    const isFocusJurisdictionTopLevel = tableCrumbs[0] && focusJurisdictionId === tableCrumbs[0].id;

    if (!newPlan || !newPlan.plan_jurisdictions_ids) {
      return null;
    }

    const planJurisdictionIds = [...newPlan.plan_jurisdictions_ids];
    const onToggleAllCheckboxChange = (e: any) => {
      this.onToggleAllCheckboxChange(e);
    };
    const onTableCheckboxChange = (e: any) => {
      this.onTableCheckboxChange(e);
    };

    const onDrilldownClick = (e: MouseEvent) => {
      if (e && e.currentTarget && e.currentTarget.id) {
        if (this.state.childlessChildrenIds.includes(e.currentTarget.id)) {
          stopPropagationAndPreventDefault(e);
        } else {
          this.onDrilldownClick(e.currentTarget.id);
        }
      }
    };

    const headerCheckboxIsChecked = isFocusJurisdictionTopLevel
      ? newPlan &&
        newPlan.plan_jurisdictions_ids &&
        newPlan.plan_jurisdictions_ids.length === filteredJurisdictionIds.length
      : !!focusJurisdictionId && this.getIsJurisdictionPartiallySelected(focusJurisdictionId);

    // a simple interface for the the drilldown table data extending Jurisdiciton
    interface JurisdictionRow extends Jurisdiction {
      assignedTeams: string[];
      isChildless: boolean;
      isPartiallySelected: boolean;
      planId: string;
    }

    const columns = [
      {
        Header: () => (
          <Input
            checked={headerCheckboxIsChecked}
            className="plan-jurisdiction-select-all-checkbox"
            onChange={onToggleAllCheckboxChange}
            type="checkbox"
          />
        ),
        columns: [
          {
            Header: '',
            accessor: (j: JurisdictionRow) => (
              <Input
                checked={planJurisdictionIds.includes(j.jurisdiction_id)}
                className="plan-jurisdiction-selection-checkbox"
                onChange={onTableCheckboxChange}
                onClick={stopPropagation}
                type="checkbox"
                value={j.jurisdiction_id}
              />
            ),
            id: 'jurisdiction_selection',
            maxWidth: 24,
          },
        ],
      },
      {
        Header: 'Name',
        columns: [
          {
            Header: '',
            accessor: (j: JurisdictionRow) => (
              <span
                id={j.jurisdiction_id}
                onClick={onDrilldownClick}
                className={`plan-jurisdiction-name${!j.isChildless ? ' btn-link' : ''}`}
              >
                {j.name}
              </span>
            ),
            id: 'name',
          },
        ],
      },
      {
        Header: 'Type',
        columns: [
          {
            Header: '',
            accessor: (j: JurisdictionRow) => {
              return (
                <span onClick={stopPropagationAndPreventDefault}>
                  {j.isChildless ? 'Spray Area' : `Admin Level ${j.geographic_level}`}
                </span>
              );
            },
            id: 'jurisdiction-type',
          },
        ],
      },
      {
        Header: 'Team Assignment',
        columns: [
          {
            Header: '',
            accessor: (j: JurisdictionRow) => {
              if (!j.isChildless) {
                return '';
              }
              const cellProps = {
                jurisdictionId: j.jurisdiction_id,
                planId: j.planId,
              } as AssignTeamCellProps;
              return <AssignTeamTableCell {...cellProps} />;
            },
            id: 'teams_assigned',
          },
        ],
      },
    ];

    if (this.props.isFinalizedPlan) {
      columns.shift();
    }

    let showPagination: boolean = false;
    if (this.state.focusJurisdictionId) {
      const directDescendants = filteredJurisdictions.filter(
        j => j.parent_id === this.state.focusJurisdictionId
      );
      showPagination = directDescendants.length > 20;
    }

    const data: JurisdictionRow[] = filteredJurisdictions.map(
      (j: Jurisdiction) =>
        ({
          ...j,
          assignedTeams: assignmentsArray
            .filter((a: Assignment) => a.jurisdiction === j.jurisdiction_id)
            .map((a: Assignment) => a.organization),
          id: j.jurisdiction_id,
          isChildless: this.state.childlessChildrenIds.includes(j.jurisdiction_id),
          isPartiallySelected:
            !this.state.childlessChildrenIds.includes(j.jurisdiction_id) &&
            this.getChildlessChildrenIds([jurisdictionsById[j.jurisdiction_id]]),
          planId,
        } as JurisdictionRow)
    );

    const tableProps: DrillDownProps<any> = {
      CellComponent: DropDownCell,
      columns,
      data,
      identifierField: 'jurisdiction_id',
      linkerField: 'name',
      minRows: 0,
      parentIdentifierField: 'parent_id',
      rootParentId: this.state.focusJurisdictionId,
      showPageSizeOptions: false,
      showPagination,
      useDrillDownTrProps: true,
    };
    return tableProps;
  }

  /** util to check if Jurisdiction has any selected descendants
   * @param {string|null} id - the jurisdiction_id of the Jurisdiction being checked
   * @param {string[]} selectedIds - the ids of Jurisdictions which are currently selected
   * @returns {boolean}
   */
  private getIsJurisdictionPartiallySelected(id: string | null, selectedIds?: string[]): boolean {
    const { newPlan, filteredJurisdictionIds } = this.state;
    const { jurisdictionsById } = this.props;
    const filteredJurisdictions = filteredJurisdictionIds
      .map(j => jurisdictionsById[j])
      .filter(j => !!j);
    const planJurisdictionIds =
      selectedIds ||
      (newPlan && newPlan.plan_jurisdictions_ids
        ? [...newPlan.plan_jurisdictions_ids]
        : [...filteredJurisdictionIds]);

    if (id) {
      // check if drilled down Jurisdiction is at least partially selected
      const descendants: Jurisdiction[] = this.getDescendantJurisdictionIds([id], jurisdictionsById)
        .map(j => jurisdictionsById[j])
        .filter(j => !!j);
      const childlessDescendants: string[] = this.getChildlessChildrenIds(descendants);
      for (const child of childlessDescendants) {
        if (planJurisdictionIds.includes(child)) {
          return true;
        }
      }
    }

    return planJurisdictionIds.length === filteredJurisdictions.length;
  }

  /** getBreadCrumbProps - get properties for HeaderBreadcrumbs component
   * @param {IrsPlanProps} props - component props
   * @param {string} pageLabel - string for the current page lable
   * @returns breadCrumbProps - compatible object for HeaderBreadcrumbs props
   */
  private getBreadCrumbProps(props: IrsPlanProps, pageLabel: string) {
    const { isDraftPlan, isFinalizedPlan, planId } = props;
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const basePage = {
      label: 'IRS',
      url: INTERVENTION_IRS_URL,
    };
    const urlPathAppend =
      (isFinalizedPlan && `plan/${planId}`) || (isDraftPlan && `draft/${planId}`) || 'new';
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: pageLabel,
        url: `${INTERVENTION_IRS_URL}/${urlPathAppend}`,
      },
      pages: [homePage, basePage],
    };
    return breadCrumbProps;
  }

  /** onSavePlanButtonClick - extracts PlanPayload from newPlan and PUSHs or PUTs to OpenSRP
   * @param {boolean} isFinal - determines if the Plan should be saved as a draft or as a finalized plan
   */
  private async onSavePlanButtonClick(isFinal: boolean = false) {
    const { newPlan, childlessChildrenIds } = this.state;
    if (newPlan && newPlan.plan_jurisdictions_ids) {
      const now = moment(new Date());
      const start = moment(newPlan.plan_effective_period_start);
      const end = moment(newPlan.plan_effective_period_end);
      const format = DATE_FORMAT.toUpperCase();
      const newPlanDraft: PlanRecord = {
        ...newPlan,
        plan_date: now.format(format),
        plan_effective_period_end: end.format(format),
        plan_effective_period_start: start.format(format),
        plan_jurisdictions_ids: newPlan.plan_jurisdictions_ids.filter(j =>
          childlessChildrenIds.includes(j)
        ),
        plan_status: isFinal ? PlanStatus.ACTIVE : PlanStatus.DRAFT,
        plan_version: Number.isNaN(Number(newPlan.plan_version))
          ? '1'
          : `${Number(newPlan.plan_version) + 1}`,
      };

      const { assignmentsArray, organizationsById } = this.props;

      if (newPlanDraft.plan_jurisdictions_ids && newPlanDraft.plan_jurisdictions_ids.length) {
        const planPayload = extractPlanPayloadFromPlanRecord(newPlanDraft);
        if (planPayload) {
          // create payload of assignments based on current store state
          const nextAssignments: Assignment[] = assignmentsArray.map((a: Assignment) => ({
            ...a,
            fromDate: moment(start).format(),
            toDate: moment(end).format(),
          }));

          // create temp reference to determine which assignments should be retired on server
          const assignmentTeamIdsByJurisdictionId: { [key: string]: string[] } = {};
          for (const assignment of nextAssignments) {
            if (!assignmentTeamIdsByJurisdictionId[assignment.jurisdiction]) {
              assignmentTeamIdsByJurisdictionId[assignment.jurisdiction] = [];
            }
            assignmentTeamIdsByJurisdictionId[assignment.jurisdiction].push(
              assignment.organization
            );
          }

          // fetch list of assignments from server which need to be retired
          const retiredAssignments: Assignment[] = await this.getAllAssignments(
            planPayload.identifier,
            values(organizationsById),
            (existingAssignments: Assignment[]) => {
              const assignmentsToRetire: Assignment[] = [];
              for (const result of existingAssignments) {
                if (
                  !assignmentTeamIdsByJurisdictionId[result.jurisdiction] ||
                  !assignmentTeamIdsByJurisdictionId[result.jurisdiction].includes(
                    result.organization
                  )
                ) {
                  assignmentsToRetire.push({
                    ...result,
                    fromDate: moment(0).format(),
                    toDate: moment(1000).format(),
                  } as Assignment);
                }
              }
              return assignmentsToRetire;
            }
          );

          this.setState({ isSaveDraftDisabled: true }, async () => {
            if (this.props.isDraftPlan) {
              OpenSrpPlanService.update(planPayload)
                .then(() => {
                  if (isFinal) {
                    // todo - force remounting of component by breaking this page into several
                    // this.props.history.push(
                    //   `${INTERVENTION_IRS_URL}/plan/${planPayload.identifier}`
                    // );
                    this.props.history.push(INTERVENTION_IRS_URL);
                  } else {
                    this.setState({
                      isSaveDraftDisabled: false,
                      newPlan: {
                        ...newPlanDraft,
                        plan_jurisdictions_ids: [...(newPlan.plan_jurisdictions_ids as string[])],
                      },
                    });
                  }
                })
                .catch(() => {
                  this.setState({ isSaveDraftDisabled: false });
                });

              // POST to retire unassigned assignments
              if (retiredAssignments.length) {
                await OpenSrpAssignmentService.create([...retiredAssignments])
                  .then(res => {
                    // todo - hook in success notification
                  })
                  .catch(err => {
                    // todo - handle errors
                  });
              }
              // POST to create new/updated assignments
              if (nextAssignments.length) {
                await OpenSrpAssignmentService.create([...nextAssignments])
                  .then(res => {
                    // todo - hook in success notification
                  })
                  .catch(err => {
                    // todo - handle errors
                  });
              }
            }
          });
        } else {
          alert('Uh oh, looks like something is (syntactically) wrong with the Plan schema');
        }
      } else {
        alert('Oops, no jurisdictions selected!');
      }
    } else if (!childlessChildrenIds.length) {
      alert('Oops, no jurisdictions selected!');
    }
  }
}

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  planId: string | null;
}

export { IrsPlan };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - the props
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId = ownProps.match.params.id || null;
  const planById = getPlanRecordById(state, planId);
  const isNewPlan = planId === null;
  const isDraftPlan = planById && planById.plan_status !== 'active';
  const isFinalizedPlan = planById && planById.plan_status === 'active';

  const jurisdictionsById = getJurisdictionsById(state);
  const allJurisdictionIds = getAllJurisdictionsIdArray(state);
  const loadedJurisdictionIds = getJurisdictionsIdArray(state);
  const organizationsById = getOrganizationsById(state);
  const assignmentsArray = getAssignmentsArrayByPlanId(state, planId);

  const props = {
    allJurisdictionIds,
    assignmentsArray,
    isDraftPlan,
    isFinalizedPlan,
    isNewPlan,
    jurisdictionsById,
    loadedJurisdictionIds,
    organizationsById,
    planById,
    planId,
    ...ownProps,
  };
  return props;
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchAllJurisdictionIdsActionCreator: fetchAllJurisdictionIds,
  fetchAssignmentsActionCreator: fetchAssignments,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchOrganizationsActionCreator: fetchOrganizations,
  fetchPlansActionCreator: fetchPlanRecords,
};

/** Create connected IrsPlan */
const ConnectedIrsPlan = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlan);

export default ConnectedIrsPlan;
