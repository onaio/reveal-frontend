// this is the IRS Plan page component
import { Actions, GisidaMap } from 'gisida';
import { keyBy } from 'lodash';
import { EventData, LngLatBoundsLike } from 'mapbox-gl';
import { Map as mbMap } from 'mapbox-gl';
import moment from 'moment';
import { MouseEvent } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Column } from 'react-table';
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Row,
} from 'reactstrap';
import { Store } from 'redux';
import uuidv4 from 'uuid/v4';

import GeojsonExtent from '@mapbox/geojson-extent';
import DrillDownTable, { DrillDownProps, DropDownCell } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';

import {
  DATE_FORMAT,
  IRS_PLAN_COUNTRIES,
  SUPERSET_JURISDICTIONS_DATA_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE,
} from '../../../../../configs/env';
import {
  HOME,
  HOME_URL,
  INTERVENTION_IRS_URL,
  MAP_ID,
  NEW_PLAN,
  OPENSRP_FIND_BY_PROPERTIES,
  OPENSRP_LOCATION,
  OPENSRP_PARENT_ID,
  OPENSRP_PLANS,
} from '../../../../../constants';
import {
  FlexObject,
  preventDefault,
  RouteParams,
  stopPropagation,
  stopPropagationAndPreventDefault,
} from '../../../../../helpers/utils';
import {
  adminLayerColors,
  ADMN0_PCODE,
  CountriesAdmin0,
  fillLayerConfig,
  JurisdictionsByCountry,
  lineLayerConfig,
} from './../../../../../configs/settings';

import { OpenSRPService } from '../../../../../services/opensrp';
import supersetFetch from '../../../../../services/superset';

import store from '../../../../../store';
import jurisdictionReducer, {
  fetchAllJurisdictionIds,
  fetchJurisdictions,
  getAllJurisdictionsIdArray,
  getJurisdictionsArray,
  getJurisdictionsById,
  getJurisdictionsIdArray,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import plansReducer, {
  extractPlanPayloadFromPlanRecord,
  extractPlanRecordResponseFromPlanPayload,
  fetchPlanRecords,
  getPlanRecordById,
  InterventionType,
  PlanPayload,
  PlanRecord,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

import { strict } from 'assert';
import { Helmet } from 'react-helmet';
import GisidaWrapper, { GisidaProps, Handlers } from '../../../../../components/GisidaWrapper';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../../components/page/Loading';

import './style.css';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** initialize OpenSRP API services */
const OpenSrpLocationService = new OpenSRPService(OPENSRP_LOCATION);
const OpenSrpPlanService = new OpenSRPService(OPENSRP_PLANS);

/** IrsPlanProps - interface for IRS Plan page */
export interface IrsPlanProps {
  allJurisdictionIds: string[];
  fetchAllJurisdictionIdsActionCreator: typeof fetchAllJurisdictionIds;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlanRecords;
  isDraftPlan?: boolean;
  isFinalizedPlan?: boolean;
  isNewPlan?: boolean;
  jurisdictionsById: { [key: string]: Jurisdiction };
  loadedJurisdictionIds: string[];
  planById?: PlanRecord | null;
  planId: string | null;
  supersetService: typeof supersetFetch;
}

/** defaultIrsPlanProps - default props for IRS Plan page */
export const defaultIrsPlanProps: IrsPlanProps = {
  allJurisdictionIds: [],
  fetchAllJurisdictionIdsActionCreator: fetchAllJurisdictionIds,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlanRecords,
  isDraftPlan: false,
  isFinalizedPlan: false,
  isNewPlan: false,
  jurisdictionsById: {},
  loadedJurisdictionIds: [],
  planById: null,
  planId: null,
  supersetService: supersetFetch,
};

/** Interface for breadcrumb item */
interface TableCrumb {
  label: string;
  id: string | null;
  active: boolean;
}

/** Interface to describe props for the IrsPlan component */
interface IrsPlanState {
  childlessChildrenIds: string[];
  country: JurisdictionsByCountry | null;
  doRenderTable: boolean;
  filteredJurisdictionIds: string[];
  focusJurisdictionId: string | null;
  gisidaWrapperProps: GisidaProps | null;
  isBuildingGisidaProps: boolean;
  isEditingPlanName: boolean;
  isLoadingGeoms: boolean;
  isLoadingJurisdictions: boolean;
  isSaveDraftDisabled: boolean;
  isStartingPlan: boolean;
  newPlan: PlanRecord | null;
  planCountry: string;
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
      country: null,
      doRenderTable: true,
      filteredJurisdictionIds: [],
      focusJurisdictionId: null,
      gisidaWrapperProps: null,
      isBuildingGisidaProps: false,
      isEditingPlanName: false,
      isLoadingGeoms: false,
      isLoadingJurisdictions: true,
      isSaveDraftDisabled: false,
      isStartingPlan: props.isNewPlan || false,
      newPlan: props.isNewPlan
        ? {
            id: uuidv4(),
            plan_date: this.getNewPlanDate(),
            plan_effective_period_end: '',
            plan_effective_period_start: '',
            plan_fi_reason: '',
            plan_fi_status: '',
            plan_id: uuidv4(),
            plan_intervention_type: InterventionType.IRS,
            plan_jurisdictions_ids: [],
            plan_status: PlanStatus.NEW,
            plan_title: this.getNewPlanTitle(),
            plan_version: '',
          }
        : (props.planById as PlanRecord) || null,
      planCountry: '',
      previousPlanName: '',
      tableCrumbs: [],
    };
  }

  public async componentDidMount() {
    const {
      allJurisdictionIds,
      fetchAllJurisdictionIdsActionCreator,
      fetchJurisdictionsActionCreator,
      fetchPlansActionCreator,
      isDraftPlan,
      isNewPlan,
      loadedJurisdictionIds,
      planId,
      planById,
      supersetService,
    } = this.props;

    // GET LIST OF ALL JURISDICTIONS
    let allJurIds: string[] = [];
    if (!allJurisdictionIds.length || allJurisdictionIds.length === loadedJurisdictionIds.length) {
      // todo - is there a better way to fetch a list of ALL jurisdiction ids?
      await supersetFetch(SUPERSET_JURISDICTIONS_DATA_SLICE, { row_limit: 10000 }).then(result => {
        // populate array of unique `id`s
        if (result && result.length) {
          for (const j of result) {
            if (allJurIds.indexOf(j.id) === -1) {
              allJurIds.push(j.id);
            }
          }
        }
        return fetchAllJurisdictionIdsActionCreator([...allJurIds]);
      });
    } else {
      allJurIds = [...allJurisdictionIds];
    }

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

    // GET PLAN JURISDICTIONS associated with this plan
    const planJurisdictionIdsToGet: string[] = [];
    let otherJurisdictionIdsToGet: string[] = [];

    // GET REMAINING JURISDICTIONS
    let sqlFilterExpression = '';
    let idsToUse: string[] = [];
    if (loadedJurisdictionIds.length || planJurisdictionIdsToGet.length) {
      otherJurisdictionIdsToGet = allJurIds.filter((j: string) => {
        return !loadedJurisdictionIds.includes(j) && !planJurisdictionIdsToGet.includes(j);
      });

      const otherJurisdictionIdsNotToGet = Array.from(
        new Set([...planJurisdictionIdsToGet, ...loadedJurisdictionIds])
      );

      const doInclude = otherJurisdictionIdsToGet.length < otherJurisdictionIdsNotToGet.length;
      idsToUse = doInclude ? otherJurisdictionIdsToGet : otherJurisdictionIdsNotToGet;

      // build query params
      for (let i = 0; i < idsToUse.length; i += 1) {
        const jurId = idsToUse[i];
        if (i) {
          sqlFilterExpression += doInclude ? ' OR ' : ' AND ';
        }
        sqlFilterExpression += `id ${doInclude ? '=' : '!='} '${jurId}'`;
      }
    }

    const otherJurisdictionSupersetParams = sqlFilterExpression.length
      ? superset.getFormData(10000, [{ sqlExpression: sqlFilterExpression }])
      : { row_limit: 10000 };

    await supersetService(SUPERSET_JURISDICTIONS_DATA_SLICE, otherJurisdictionSupersetParams).then(
      (jurisdictionResults: FlexObject[] = []) => {
        const jurisdictionsArray: Jurisdiction[] = jurisdictionResults.map(j => {
          const { id, parent_id, name, geographic_level } = j;
          const jurisdiction: Jurisdiction = {
            geographic_level: geographic_level || 0,
            jurisdiction_id: id,
            name: name || null,
            parent_id: parent_id || null,
          };
          return jurisdiction;
        });
        // initialize Finalized Plan
        if (
          !isNewPlan &&
          this.props.planById &&
          this.props.planById.plan_jurisdictions_ids &&
          this.props.planById.plan_jurisdictions_ids.length
        ) {
          const jurisdictionsById = keyBy(jurisdictionsArray, j => j.jurisdiction_id);

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
            OpenSrpLocationService.read(parentlessParent, {
              is_jurisdiction: true,
              return_geometry: false,
            }).then(result => {
              if (result && result.properties) {
                const country: JurisdictionsByCountry =
                  CountriesAdmin0[
                    (result.properties.ADM0_PCODE || result.properties.name) as ADMN0_PCODE
                  ];

                if (country) {
                  const countryIds = country.jurisdictionId.length
                    ? [country.jurisdictionId]
                    : [...country.jurisdictionIds];
                  const filteredJurisdictions = isDraftPlan
                    ? this.getDecendantJurisdictionIds(countryIds, jurisdictionsById).map(
                        j => jurisdictionsById[j]
                      )
                    : ancestorIds.map(j => jurisdictionsById[j]);
                  const childlessChildrenIds = this.getChildlessChildrenIds(filteredJurisdictions);

                  const newPlan: PlanRecord = {
                    ...(this.props.planById as PlanRecord),
                    plan_jurisdictions_ids: [...ancestorIds],
                  };

                  const tableCrumbs: TableCrumb[] = [
                    {
                      active: true,
                      id: country.jurisdictionId.length ? country.jurisdictionId : null,
                      label: country.ADMN0_EN,
                    },
                  ];

                  this.setState(
                    {
                      childlessChildrenIds,
                      country,
                      filteredJurisdictionIds: isDraftPlan
                        ? filteredJurisdictions.map(j => j.jurisdiction_id)
                        : ancestorIds,
                      focusJurisdictionId: country.jurisdictionId.length
                        ? country.jurisdictionId
                        : this.state.focusJurisdictionId,
                      isLoadingGeoms: !!isDraftPlan,
                      isLoadingJurisdictions: false,
                      isStartingPlan: false,
                      newPlan,
                      planCountry: result.properties.ADM0_PCODE,
                      tableCrumbs,
                    },
                    () => {
                      if (isDraftPlan) {
                        this.loadJurisdictionGeometries();
                      }
                    }
                  );
                } else {
                  // handle country not found
                }
              }
            });
          }
        } else {
          this.setState({ isLoadingJurisdictions: false });
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
    const { isNewPlan, isFinalizedPlan, jurisdictionsById, planById } = nextProps;

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
            const gisidaWrapperProps = this.getGisidaWrapperProps();
            this.setState({
              gisidaWrapperProps,
              isBuildingGisidaProps: false,
            });
          }
        );
      }
    }

    if (
      !isFinalizedPlan &&
      isLoadingJurisdictions &&
      Object.keys(jurisdictionsById).length !== Object.keys(this.props.jurisdictionsById).length
    ) {
      this.setState({ isLoadingJurisdictions: false });
    }

    if (isNewPlan && !newPlan && planById && planById.plan_jurisdictions_ids) {
      this.setState({
        isStartingPlan: !!this.state.country,
        newPlan: planById,
      });
    }
  }

  public render() {
    const { planId, planById, isDraftPlan, isFinalizedPlan, isNewPlan } = this.props;
    const {
      doRenderTable,
      gisidaWrapperProps,
      isBuildingGisidaProps,
      isEditingPlanName,
      isLoadingJurisdictions,
      isSaveDraftDisabled,
      isStartingPlan,
      newPlan,
      planCountry,
      tableCrumbs,
    } = this.state;
    if (
      (planId && !planById) ||
      (isNewPlan && !newPlan) ||
      isLoadingJurisdictions ||
      isBuildingGisidaProps
    ) {
      return <Loading />;
    }

    const pageLabel =
      (isFinalizedPlan && planById && planById.plan_title) ||
      (isDraftPlan && planById && `${planById.plan_title} (draft)`) ||
      (newPlan && newPlan.plan_title) ||
      NEW_PLAN;

    const breadCrumbProps = this.getBreadCrumbProps(this.props, pageLabel);

    const planTableProps = this.getDrilldownPlanTableProps(this.state);

    const onSetPlanNameChange = (e: any) => {
      this.onSetPlanNameChange(e);
    };
    const onSetPlanStartDateChange = (e: any) => {
      this.onSetPlanStartDateChange(e);
    };
    const onSetPlanEndDateChange = (e: any) => {
      this.onSetPlanEndDateChange(e);
    };
    const onSelectCountryChange = (e: any) => {
      this.onSelectCountryChange(e);
    };
    const onStartPlanFormSubmit = (e: any) => {
      this.onStartPlanFormSubmit(e);
    };

    const irsCountryOptions = (IRS_PLAN_COUNTRIES.length
      ? IRS_PLAN_COUNTRIES
      : Object.keys(CountriesAdmin0)
    )
      .map((c, i) => {
        if (CountriesAdmin0[c as ADMN0_PCODE]) {
          const country = CountriesAdmin0[c as ADMN0_PCODE];
          return (
            <option key={i} value={country.ADMN0_PCODE}>
              {country.ADMN0_EN}
            </option>
          );
        }
        return false;
      })
      .filter(o => o);

    if (isStartingPlan && newPlan) {
      const { plan_effective_period_end, plan_effective_period_start, plan_title } = newPlan;
      return (
        <div className="mb-5">
          <Helmet>
            <title>IRS: New Plan</title>
          </Helmet>
          <HeaderBreadcrumbs {...breadCrumbProps} />
          <Row>
            <Col>
              <h2 className="page-title">New IRS Plan</h2>
            </Col>
          </Row>
          <Row>
            <Col xs="6">
              <Form>
                <FormGroup>
                  <Label for="set-plan-name">Plan Name</Label>
                  <Input
                    id="set-plan-name"
                    onChange={onSetPlanNameChange}
                    placeholder={plan_title}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="set-plan-start-date">Start Date</Label>
                  <Input
                    id="set-plan-start-date"
                    onChange={onSetPlanStartDateChange}
                    defaultValue={plan_effective_period_start}
                    type="date"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="set-plan-end-date">End Date</Label>
                  <Input
                    id="set-plan-end-date"
                    onChange={onSetPlanEndDateChange}
                    defaultValue={plan_effective_period_end}
                    type="date"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="select-plan-country">Select a Country</Label>
                  <Input
                    id="select-plan-country"
                    defaultValue={planCountry}
                    name="select-plan-country"
                    onChange={onSelectCountryChange}
                    type="select"
                  >
                    <option>...</option>
                    {irsCountryOptions}
                  </Input>
                </FormGroup>
                <Button
                  color="primary"
                  disabled={
                    !newPlan.plan_effective_period_end.length ||
                    !newPlan.plan_effective_period_start.length ||
                    !planCountry.length
                  }
                  onClick={onStartPlanFormSubmit}
                >
                  Select Jurisdictions
                </Button>
              </Form>
            </Col>
          </Row>
        </div>
      );
    }

    const onEditNameButtonClick = (e: MouseEvent) => {
      this.onEditNameButtonClick(e);
    };
    const onCancleEditNameButtonClick = (e: MouseEvent) => {
      this.onCancleEditNameButtonClick(e);
    };
    const onEditNameInputChange = (e: any) => {
      this.onEditNameInputChange(e);
    };
    const onSaveEditNameButtonClick = (e: MouseEvent) => {
      this.onSaveEditNameButtonClick(e);
    };
    const onEditPlanSettingsButtonClick = (e: MouseEvent) => {
      this.onEditPlanSettingsButtonClick(e);
    };
    const onSaveAsDraftButtonClick = (e: MouseEvent) => {
      this.onSavePlanButtonClick(e);
    };
    const onSaveFinalizedPlanButtonClick = (e: MouseEvent) => {
      this.onSavePlanButtonClick(e, true);
    };

    const planHeaderRow = (
      <Row>
        {isFinalizedPlan && (
          <Col xs="8" className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
          </Col>
        )}
        {!isFinalizedPlan && !isEditingPlanName && (
          <Col xs="8" className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
            <Button color="link" onClick={onEditNameButtonClick} size="sm">
              edit
            </Button>
          </Col>
        )}
        {!isFinalizedPlan && newPlan && isEditingPlanName && (
          <Col xs="8" className="page-title-col">
            <h2 className="page-title edit">IRS:</h2>
            <InputGroup className="edit-plan-title-input-group">
              <Input
                id="edit-plan-title-input"
                name="edit-plan-title-input"
                onChange={onEditNameInputChange}
                placeholder={newPlan.plan_title}
              />
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={onCancleEditNameButtonClick} size="sm">
                  cancel
                </Button>
              </InputGroupAddon>
              <InputGroupAddon addonType="append">
                <Button color="primary" onClick={onSaveEditNameButtonClick} size="sm">
                  save
                </Button>
              </InputGroupAddon>

              <Button color="link" onClick={onEditPlanSettingsButtonClick} size="sm">
                Plan settings...
              </Button>
            </InputGroup>
          </Col>
        )}
        {/* <Col>Save / finalize buttons will go here</Col> */}
        {!isFinalizedPlan && (
          <Col xs="4" className="save-plan-buttons-column">
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
            {!isNewPlan && (
              <Button
                className="save-as-finalized-plan-btn"
                color="primary"
                disabled={isSaveDraftDisabled}
                onClick={onSaveFinalizedPlanButtonClick}
                size="sm"
              >
                Save Finalized Plan
              </Button>
            )}
          </Col>
        )}
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
          <title>IRS: {isNewPlan ? 'New Plan' : pageLabel}</title>
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

  // Jurisdiction Hierarchy Control
  /** onTableBreadCrumbClick - handler for drilldown table breadcrumb clicks to reset the table hierarchy */
  private onTableBreadCrumbClick = (e: MouseEvent) => {
    preventDefault(e);
    if (e && e.currentTarget && e.currentTarget.id) {
      this.onResetDrilldownTableHierarchy(e.currentTarget.id);
    }
  };
  /** onResetDrilldownTableHierarchy - function for resetting drilldown table hierachy baseline
   * @param Id - the id of the highest level parent_idto show in the table, or null to reset completely
   */
  private onResetDrilldownTableHierarchy(Id: string | null) {
    const id = Id !== 'null' ? Id : null;
    const { tableCrumbs } = this.state;
    const nextActiveCrumbIndex = tableCrumbs.map(c => c.id).indexOf(id) + 1;
    const nextCrumbs = [...tableCrumbs];
    nextCrumbs.splice(nextActiveCrumbIndex);
    nextCrumbs[nextCrumbs.length - 1].active = true;

    this.setState(
      {
        doRenderTable: false,
        focusJurisdictionId: id,
        tableCrumbs: nextCrumbs,
      },
      () => {
        this.setState({
          doRenderTable: true,
        });
      }
    );
  }
  /** onDrilldownClick - function to update the drilldown breadcrumbs when drilling down into the hierarchy
   * @param id - the jurisidction_id of the Jurisdiction clicked
   */
  private onDrilldownClick(id: string) {
    const { tableCrumbs, filteredJurisdictionIds } = this.state;
    const { jurisdictionsById } = this.props;
    const jurisdictionsArray = filteredJurisdictionIds.map(j => jurisdictionsById[j]);
    let newCrumb: TableCrumb | null = null;
    for (const j of jurisdictionsArray) {
      if (j.jurisdiction_id === id) {
        newCrumb = {
          active: true,
          id,
          label: j.name || 'Jurisdiction',
        };
        break;
      }
    }

    const newCrumbs: TableCrumb[] = tableCrumbs.map(c => ({
      ...c,
      active: false,
    }));

    if (newCrumb) {
      this.setState({
        focusJurisdictionId: (id as string) || null,
        tableCrumbs: [...newCrumbs, newCrumb],
      });
    }
  }

  // Plan Title Control
  /** getNewPlanDate - getter function for today's date (YYYY-MM-DD)
   * @returns string of today's date
   */
  private getNewPlanDate(): string {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  /** getNewPlanTitle - getter function generating new plan title
   * @returns string of default auto-generated plan title
   */
  private getNewPlanTitle(): string {
    const date = this.getNewPlanDate();
    return `${InterventionType.IRS}_${date}`;
  }
  /** onEditNameButtonClick - handler enabling inline-editing the plan name */
  private onEditNameButtonClick(e: MouseEvent) {
    preventDefault(e);
    if (this.state.newPlan) {
      this.setState({
        isEditingPlanName: true,
        previousPlanName: this.state.newPlan.plan_title,
      });
    }
  }
  /** onEditNameInputChange - handler updating component state when plan title is changed */
  private onEditNameInputChange(e: any) {
    const { newPlan: NewPlan } = this.state;
    if (NewPlan) {
      const newPlan: PlanRecord = {
        ...NewPlan,
        plan_title: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  /** onCancleEditNameButtonClick - handler disabling inline-editing and restoring previous plan title */
  private onCancleEditNameButtonClick(e: MouseEvent) {
    preventDefault(e);
    const { newPlan: NewPlan, previousPlanName } = this.state;
    if (NewPlan) {
      const newPlan: PlanRecord = {
        ...NewPlan,
        plan_title: previousPlanName,
      };
      this.setState({
        isEditingPlanName: false,
        newPlan,
        previousPlanName: '',
      });
    }
  }
  /** onSaveEditNameButtonClick - handler disabling inline-editing */
  private onSaveEditNameButtonClick(e: MouseEvent) {
    e.preventDefault();
    this.setState({
      isEditingPlanName: false,
      previousPlanName: '',
    });
  }
  /** onEditPlanSettingsButtonClick - handler updating component state to render new plan form */
  private onEditPlanSettingsButtonClick(e: MouseEvent) {
    if (!this.props.isFinalizedPlan) {
      this.setState({ isStartingPlan: true });
    }
  }

  // New Plan form handlers
  /** onSetPlanNameChange - handler updating plan title in component state */
  private onSetPlanNameChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_title: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  /** onSetPlanStartDateChange - handler updatint plan_effective_period_start in component state */
  private onSetPlanStartDateChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_effective_period_start: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  /** onSetPlanEndDateChange - handler updatint plan_effective_period_end in component state */
  private onSetPlanEndDateChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_effective_period_end: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  /** onSelectCountryChange - handler updating country in component state */
  private onSelectCountryChange(e: any) {
    if (e && e.target && (e.target.value as ADMN0_PCODE)) {
      this.setState({ planCountry: e.target.value });
    }
  }
  /** onStartPlanFormSubmit - handler which:
   * Updates component state with relative Jurisdictions
   * Identifies childless children Jurisdictions
   * Sets the first drilldown table breadcrumb
   * Requests unloaded geojson for childless children
   */
  private async onStartPlanFormSubmit(e: MouseEvent) {
    const { newPlan: NewPlan, planCountry } = this.state;
    const { jurisdictionsById, isDraftPlan } = this.props;
    const country: JurisdictionsByCountry = CountriesAdmin0[planCountry as ADMN0_PCODE];

    if (!country || (!country.jurisdictionIds.length && !country.jurisdictionId.length)) {
      return false;
    }

    const jurisdictionIds = country.jurisdictionIds.length
      ? [...country.jurisdictionIds]
      : [country.jurisdictionId];

    const jurisdictionsToInclude = this.getDecendantJurisdictionIds(
      jurisdictionIds,
      jurisdictionsById
    );

    const filteredJurisdictions: Jurisdiction[] = jurisdictionsToInclude.map(
      j => jurisdictionsById[j]
    );
    const filteredJurisdictionIds = filteredJurisdictions.map(j => j.jurisdiction_id);

    const childlessChildrenIds = this.getChildlessChildrenIds(filteredJurisdictions);

    const newPlan: PlanRecord | null = NewPlan
      ? {
          ...NewPlan,
          plan_jurisdictions_ids:
            isDraftPlan && NewPlan && NewPlan.plan_jurisdictions_ids
              ? this.getAncestorJurisdictionIds(NewPlan.plan_jurisdictions_ids, jurisdictionsById)
              : [...jurisdictionsToInclude],
        }
      : NewPlan;

    const tableCrumbs: TableCrumb[] = [
      {
        active: true,
        id: country.jurisdictionId.length ? country.jurisdictionId : null,
        label: country.ADMN0_EN,
      },
    ];

    this.setState(
      {
        childlessChildrenIds,
        country,
        filteredJurisdictionIds,
        focusJurisdictionId: country.jurisdictionId.length
          ? country.jurisdictionId
          : this.state.focusJurisdictionId,
        isLoadingGeoms: true,
        isStartingPlan: false,
        newPlan,
        tableCrumbs,
      },
      this.loadJurisdictionGeometries
    );
  }

  private loadJurisdictionGeometries() {
    // Get geoms for jurisdictionsToInclude
    const {
      childlessChildrenIds: ChildlessChildrenIds,
      country,
      filteredJurisdictionIds,
    } = this.state;
    const { jurisdictionsById } = this.props;

    const doLoadAllGeojson = country && country.tilesets && !country.tilesets.length;
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

    if (!doLoadAllGeojson) {
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
              .then(jurisidction => resolve(jurisidction))
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
      this.setState({ isLoadingGeoms: false });
    }
  }

  // Jurisdiction Selection Control (which jurisidcitions should be included in the plan)
  /** onToggleJurisdictionSelection - toggles selection of clicked Jurisdiction and all decendants
   * @param id - the jurisdiction_id of the Jurisdiction being toggled
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
      const jurisdictionIdsToToggle = this.getDecendantJurisdictionIds(
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

      // if parent is no longer, deselect it (todo: make this recursive)
      const { parent_id } = jurisdictionsById[id];
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
      if (
        typeof clickedFeatureJurisdiction.geographic_level !== 'undefined' &&
        country &&
        country.tilesets
      ) {
        const Map = window.maps.find((e: mbMap) => (e as GisidaMap)._container.id === MAP_ID);

        for (
          let g = clickedFeatureJurisdiction.geographic_level;
          g < geoGraphicLevels.length;
          g += 1
        ) {
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
          } else if (Map && Map.getLayer(`${country.ADMN0_EN}-admin-${g}-jurisdiction-fill`)) {
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
      this.setState({ newPlan });
    }
  }
  /** onTableCheckboxChange - handler for drilldown table checkbox click which calls this.onToggleJurisdictionSelection */
  private onTableCheckboxChange(e: any) {
    if (e && e.target) {
      const { value: id } = e.target;
      this.onToggleJurisdictionSelection(id);
    }
  }
  /** onToggleAllCheckboxChange - handler for de/select all Jurisdictions checkbox which updates component state */
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
        ? this.getDecendantJurisdictionIds([focusJurisdictionId], jurisdictionsById)
        : [...filteredJurisdictionIds];

      // const newPlanJurisdictionIds: string[] = [];
      if (focusJurisdictionId && isSelected) {
        // select previously deselected decendants
        for (const d of decendantIds) {
          if (!selectedIds.includes(d)) {
            selectedIds.push(d);
          }
        }
      } else if (focusJurisdictionId && !isSelected) {
        // de-select previously selected decendants
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
        const Map = window.maps.find((m: mbMap) => (m as GisidaMap)._container.id === MAP_ID);

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
            // ids selected in this geographic level
            const adminLevelIds = selectedJurisdictionsIds.filter(
              j => jurisdictionsById[j] && jurisdictionsById[j].geographic_level === d
            );
            // all Jurisdictions for this geographic level
            const adminLevelJurs = nextFilteredJurisdictionIds
              .filter(j => jurisdictionsById[j] && jurisdictionsById[j].geographic_level === d)
              .map(j => jurisdictionsById[j]);
            // Mapbox categorical stops style spec
            const adminFillOpacity = this.getJurisdictionSelectionStops(
              adminLevelIds,
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
        }
      });
    }
  }

  // Getter methods
  /** getChildlessChildrenIds - hierarchy util to get all childless decendants of certain Jurisdictions
   * @param filteredJurisdictions - list of Jurisdictions of which to find the childless decendants
   * @returns list of jurisdiction_ids of childless decendants
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
  /** getDecendantJurisdictionIds - hierarchy util to get all decendants of certain Jurisdictions
   * @param ParentIds - jurisdiction_ids of the parent jurisdictions for which to find decendants
   * @param jurisdictionsById - list Jurisdictions through which to search for decendants
   * @param doIncludeParentIds - boolean to determine whether or not to include ParentId strings in returned list
   * @returns list of jurisdiction_ids of all decendants
   */
  private getDecendantJurisdictionIds(
    ParentIds: string[],
    jurisdictionsById: { [key: string]: Jurisdiction },
    doIncludeParentIds: boolean = true
  ): string[] {
    const decendantIds: string[] = [];
    const parentIds: string[] = [...ParentIds];

    while (parentIds.length) {
      const parentId = parentIds.shift() as string;
      if (ParentIds.indexOf(parentId) === -1 || doIncludeParentIds) {
        decendantIds.push(parentId);
      }
      const jurisdictionsKeys = Object.keys(jurisdictionsById);
      for (const jurisdiction of jurisdictionsKeys) {
        if (jurisdictionsById[jurisdiction].parent_id === parentId) {
          parentIds.push(jurisdictionsById[jurisdiction].jurisdiction_id);
        }
      }
    }

    return decendantIds;
  }
  /** getDecendantJurisdictionIds - recursive hierarchy util to get all ancestors of certain Jurisdictions
   * @param ChildIds - jurisdiction_ids of the child jurisdictions for which to find ancestors
   * @param jurisdictions [array] - list Jurisdictions through which to search for decendants
   * @param jurisdictions [object] - key/value map of jurisdictionsById
   * @param doIncludeChildIds - boolean to determine whether or not to include ChildId strings in returned list
   * @returns list of jurisdiction_ids of all ancestors
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

  private getJurisdictionSelectionStops(
    selectedIds: string[],
    jurisdictions: Jurisdiction[],
    tileset: FlexObject | undefined
  ) {
    const uniqueKeys: string[] = [];
    const selectionStyle = {
      default: 0.3,
      property: (tileset && tileset.idField) || 'jurisdiction_id',
      stops: [] as Array<[string, number]>,
      type: 'categorical',
    };
    for (const j of jurisdictions) {
      const key: string = tileset && tileset.idField && j.name ? j.name : j.jurisdiction_id;
      // keys in stops must be unique
      if (!uniqueKeys.includes(key)) {
        uniqueKeys.push(key);
        const opacity = selectedIds.includes(j.jurisdiction_id) ? 0.75 : 0.3;
        selectionStyle.stops.push([key, opacity]);
      }
    }
    return (selectionStyle.stops.length && selectionStyle) || 0.75;
  }

  /** getGeographicLevelsFromJurisdictions - utility to derive all geographic levels
   * @param filteredJurisdictions - array of Jurisdictions relevant to the country
   * @returns array of geographic levels as numbers
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

  /** getGisidaWrapperProps - GisidaWrapper prop builder building out layers and handlers for Gisida */
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

    const ADMIN_LINE_LAYERS: any[] = [];
    const adminBorderWidths: number[] = [1.5, 1, 0.75, 0.5];
    for (let t = 0; t < tilesets.length; t += 1) {
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

    const ADMIN_FILL_LAYER_IDS: string[] = [];
    const ADMIN_FILL_LAYERS: any[] = [];
    const adminFillColors: string[] = ['black', 'red', 'orange', 'yellow', 'green'];
    const selectedJurisdictionsIds =
      newPlan && newPlan.plan_jurisdictions_ids
        ? [...newPlan.plan_jurisdictions_ids]
        : [...filteredJurisdictionIds];

    for (let t = 1; t < tilesets.length; t += 1) {
      const adminFillLayerId = `${ADMN0_EN}-admin-${t}-fill`;

      const adminLevelIds = selectedJurisdictionsIds.filter(
        j => jurisdictionsById[j] && jurisdictionsById[j].geographic_level === t
      );
      const adminLevelJurs = filteredJurisdictionIds
        .filter(j => jurisdictionsById[j] && jurisdictionsById[j].geographic_level === t)
        .map(j => jurisdictionsById[j]);

      const adminFillOpacity = this.getJurisdictionSelectionStops(
        adminLevelIds,
        adminLevelJurs,
        tilesets[t]
      );

      ADMIN_FILL_LAYER_IDS.unshift(adminFillLayerId);
      const adminFillLayer = {
        ...fillLayerConfig,
        id: adminFillLayerId,
        paint: {
          'fill-color': adminFillColors[t],
          'fill-opacity': adminFillOpacity,
        },
        source: {
          layer: tilesets[t].layer,
          type: 'vector',
          url: tilesets[t].url,
        },
        visible: true,
      };

      const tooltipVal = tilesets[t].idField;
      if (tooltipVal && tooltipVal.length) {
        (adminFillLayer as any).popup = {
          body: `<p class="select-jurisdictin-tooltip">{{${tooltipVal}}}</p>`,
        };
      }

      if (t === 1) {
        const adminFilterExpression: any[] = ['any'];
        for (const jurisdiction of filteredJurisdictions) {
          if (jurisdiction.geographic_level === 1) {
            const filterExpression = [
              '==',
              tilesets[t].idField,
              jurisdiction.name as string,
            ].filter(e => !!e);
            if (filterExpression.length === 3) {
              adminFilterExpression.push(filterExpression);
            }
          }
        }
        if (adminFilterExpression.length > 1) {
          (adminFillLayer as any).filter = [...adminFilterExpression];
        }
      } else {
        (adminFillLayer as any).filter = ['==', tilesets[t].parentIdField, ''];
      }

      ADMIN_FILL_LAYERS.unshift(adminFillLayer);
    }

    const self = this;
    function getJurisdictionFillLayers(jurisdictions: Jurisdiction[], tiles: any[]) {
      const layers: FlexObject[] = [];
      const geoGraphicLevels: number[] = [];
      const layerIds: string[] = [];
      const adminLayerIds: string[] = [];
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
      const jurisdictionFeatures: any[] = [];
      const selectedIds =
        self.state.newPlan && self.state.newPlan.plan_jurisdictions_ids
          ? [...self.state.newPlan.plan_jurisdictions_ids]
          : [...filteredJurisdictionIds];

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
          jurisdictionFeatures.push(feature);
        }

        const geoLevelIds: string[] = featureCollection.features
          .map(f => (f && f.properties && f.properties.jurisdiction_id) || '')
          .filter(j => j !== '' && selectedIds.includes(j));

        const geoLevelJurs: Jurisdiction[] = jurisdictions.filter(j =>
          geoLevelIds.includes(j.jurisdiction_id)
        );

        const selectionFillOpacity = self.getJurisdictionSelectionStops(
          geoLevelIds,
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
   * @param e - Mapbox Event object
   * @param country - JurisdictionsByCountry object containing basic hierarchy information per country
   * @param geographicLevel - The hierarchical level of the feature being clicked
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
    const geographicLevel = [...adminLayerIds].indexOf(feature.layer.id) + 1;
    const isShiftClick = originalEvent.shiftKey;
    const isJurisdictionLayer = jurisdictionLayerIds.includes(feature.layer.id);
    const { filteredJurisdictionIds, childlessChildrenIds } = this.state;
    const { jurisdictionsById } = this.props;
    const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);
    const filteredJurisdictionsById = keyBy(filteredJurisdictions, j => j.jurisdiction_id);

    if (feature && country.tilesets) {
      const { geometry, layer, properties } = feature;

      const doUseTilesets = !!country.tilesets[geographicLevel];
      const clickedFeatureId =
        doUseTilesets && !isJurisdictionLayer
          ? properties[country.tilesets[geographicLevel].idField]
          : properties.jurisdiction_id;

      const clickedFeatureJurisdiction = filteredJurisdictions.find(
        j =>
          j[doUseTilesets && !isJurisdictionLayer ? 'name' : 'jurisdiction_id'] === clickedFeatureId
      ) as Jurisdiction;

      if (clickedFeatureJurisdiction && !isShiftClick && !isJurisdictionLayer) {
        // handle Drilldown Click
        this.onDrilldownClick(clickedFeatureJurisdiction.jurisdiction_id);
        this.onResetDrilldownTableHierarchy(clickedFeatureJurisdiction.jurisdiction_id);

        // toggle current layer / filter current layer
        if (geographicLevel === 1) {
          store.dispatch(Actions.toggleLayer(MAP_ID, layer.id));
        } else {
          const layerFilter = Map.getFilter(layer.id);
          if (layerFilter) {
            layerFilter[2] = '';
            Map.setFilter(layer.id, layerFilter);
          } else {
            Map.setFilter(layer.id, ['==', 'parentId', clickedFeatureJurisdiction.jurisdiction_id]);
          }
        }

        const nextAdminTileset = country.tilesets[geographicLevel + 1];
        const nextAdminIdIndex = adminLayerIds.indexOf(
          `${country.ADMN0_EN}-admin-${geographicLevel + 1}-jurisdiction-fill`
        );
        const nextAdminLayerId = nextAdminIdIndex !== -1 && adminLayerIds[nextAdminIdIndex];
        // check for next Admin fill layer
        if (
          (country.tilesets.length && nextAdminTileset) ||
          (!country.tilesets.length && nextAdminLayerId)
        ) {
          // zoom to clicked admin level
          const newBounds: LngLatBoundsLike = GeojsonExtent(geometry);
          Map.fitBounds(newBounds, { padding: 20 });
          // toggle next admin fill layer
          const nextLayerId =
            nextAdminLayerId || `${country.ADMN0_EN}-admin-${geographicLevel + 1}-fill`;
          // update layer filter of next admin level fill layer
          if (Map.getLayer(nextLayerId)) {
            const nextLayerFilter = Map.getFilter(nextLayerId);
            if (nextLayerFilter && country.tilesets && country.tilesets[geographicLevel]) {
              nextLayerFilter[2] = properties[country.tilesets[geographicLevel].idField];
              Map.setFilter(nextLayerId, nextLayerFilter);
            } else if (nextLayerFilter) {
              nextLayerFilter[2] = properties.jurisdiction_id;
              Map.setFilter(nextLayerId, nextLayerFilter);
            } else {
              Map.setFilter(nextLayerId, ['==', 'parentId', properties.jurisdiction_id]);
            }
          }
        } else {
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
                  Map.setFilter(adminLayer, ['==', 'parentId', '']);
                }
              }
            }
          }

          // define childless decendant jurisdictions
          const decendantChildlessChildrenIds = this.getDecendantJurisdictionIds(
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
          const newBounds = GeojsonExtent({
            features: decendantChildlessFeatures,
            type: 'FeatureCollection',
          });
          if (newBounds) {
            Map.fitBounds(newBounds, { padding: 20 });
          }
        }
      } else if (isShiftClick && clickedFeatureJurisdiction) {
        // Handle selection click
        this.onToggleJurisdictionSelection(clickedFeatureJurisdiction.jurisdiction_id);
      }
    }
  }
  /** onDrillUpClick - map click handler passed into Gisida for resetting the drilldown hierarchy
   * @param e - Mapbox Event object
   * @param country - JurisdictionsByCountry object containing basic hierarchy information per country
   */
  private onDrillUpClick(
    e: EventData,
    country: JurisdictionsByCountry,
    filteredJurisdictions: Jurisdiction[]
  ) {
    const { point, target: Map } = e;
    const features = Map.queryRenderedFeatures(point);
    const { ADMN0_EN, bounds, jurisdictionId, tilesets } = country;
    if (!features.length && tilesets && bounds) {
      if (tilesets.length) {
        let t = 1;
        for (t; t < tilesets.length; t += 1) {
          const layerId = `${ADMN0_EN}-admin-${t}-fill`;
          if (Map.getLayer(layerId)) {
            // Reset layers to default visibility
            if (t === 1) {
              const isLayerVisible = Map.getLayoutProperty(layerId, 'visibility') === 'visible';
              if (!isLayerVisible) {
                store.dispatch(Actions.toggleLayer(MAP_ID, layerId));
              }
            } else {
              const layerFilter = Map.getFilter(layerId);
              if (layerFilter) {
                layerFilter[2] = '';
                Map.setFilter(layerId, layerFilter);
              }
            }
          }
        }
        // Reset layer filter for Jurisdiction fill layer
        const jurisdictionsLayerId = `${country.ADMN0_EN}-admin-${t}-jurisdiction-fill`;
        if (Map.getLayer(jurisdictionsLayerId)) {
          const jurisdicitonLayerFilter = Map.getFilter(jurisdictionsLayerId);
          if (jurisdicitonLayerFilter) {
            jurisdicitonLayerFilter[2] = '';
            Map.setFilter(jurisdictionsLayerId, jurisdicitonLayerFilter);
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

      Map.fitBounds(bounds as LngLatBoundsLike, { padding: 20 });
      this.onResetDrilldownTableHierarchy(jurisdictionId.length ? jurisdictionId : null);
    }
  }

  /** getDrilldownPlanTableProps - getter for hierarchical DrilldownTable props
   * @param props - component props
   * @returns tableProps|null - compatible object for DrillDownTable props
   */
  private getDrilldownPlanTableProps(state: IrsPlanState) {
    const { filteredJurisdictionIds, newPlan, focusJurisdictionId } = state;
    const { jurisdictionsById } = this.props;
    const filteredJurisdictions = filteredJurisdictionIds.map(j => jurisdictionsById[j]);

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

    const columns = [
      {
        Header: () => {
          const isChecked = this.getIsJurisdictionPartiallySelected(this.state.focusJurisdictionId);

          return (
            <Input
              checked={isChecked}
              className="plan-jurisdiction-select-all-checkbox"
              onChange={onToggleAllCheckboxChange}
              type="checkbox"
            />
          );
        },
        columns: [
          {
            Header: '',
            accessor: (j: Jurisdiction) => (
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
            accessor: (j: any) => (
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
            accessor: (j: any) => {
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
    ];

    if (this.props.isFinalizedPlan) {
      columns.shift();
      columns.push({
        Header: 'Teams Assigned',
        columns: [
          {
            Header: '',
            accessor: () => <span className="text-info">X Teams Assigned to Y Jurisdictions</span>,
            id: 'teams_assigned',
          },
        ],
      });
    }

    const tableProps: DrillDownProps<any> = {
      CellComponent: DropDownCell,
      columns,
      data: filteredJurisdictions.map((j: any) => ({
        ...j,
        id: j.jurisdiction_id,
        isChildless: this.state.childlessChildrenIds.includes(j.jurisdiction_id),
        isPartiallySelected:
          !this.state.childlessChildrenIds.includes(j.jurisdiction_id) &&
          this.getChildlessChildrenIds([jurisdictionsById[j.jurisdiction_id]]),
      })),
      identifierField: 'jurisdiction_id',
      linkerField: 'name',
      minRows: 0,
      parentIdentifierField: 'parent_id',
      rootParentId: this.state.focusJurisdictionId,
      showPagination: true,
      useDrillDownTrProps: true,
    };
    return tableProps;
  }

  /** util to check if Jurisdiction has any selected decendants
   * @param id - the jurisdiction_id of the Jurisdiction being checked
   * @returns boolean
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
      const decendants: Jurisdiction[] = this.getDecendantJurisdictionIds([id], jurisdictionsById)
        .map(j => jurisdictionsById[j])
        .filter(j => !!j);
      const childlessDecendants: string[] = this.getChildlessChildrenIds(decendants);
      for (const child of childlessDecendants) {
        if (planJurisdictionIds.includes(child)) {
          return true;
        }
      }
    }

    return planJurisdictionIds.length === filteredJurisdictions.length;
  }

  /** getBreadCrumbProps - get properties for HeaderBreadcrumbs component
   * @param props - component props
   * @param pageLabel - string for the current page lable
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
   * @param e - MouseEvent
   * @param isFinal - determines if the Plan should be saved as a draft or as a finalized plan
   */
  private onSavePlanButtonClick(e: MouseEvent, isFinal: boolean = false) {
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

      if (newPlanDraft.plan_jurisdictions_ids && newPlanDraft.plan_jurisdictions_ids.length) {
        const planPayload = extractPlanPayloadFromPlanRecord(newPlanDraft);
        if (planPayload) {
          this.setState({ isSaveDraftDisabled: true }, () => {
            if (this.props.isNewPlan) {
              OpenSrpPlanService.create(planPayload)
                .then(() => {
                  // todo - force remounting of component by breaking this page into several
                  // this.props.history.push(
                  //   `${INTERVENTION_IRS_URL}/draft/${planPayload.identifier}`
                  // );
                  this.props.history.push(INTERVENTION_IRS_URL);
                })
                .catch(() => {
                  this.setState({ isSaveDraftDisabled: false });
                });
            } else if (this.props.isDraftPlan) {
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
  const plan = getPlanRecordById(state, planId);
  const isNewPlan = planId === null;
  const isDraftPlan = plan && plan.plan_status !== 'active';
  const isFinalizedPlan = plan && plan.plan_status === 'active';

  const jurisdictionsById = getJurisdictionsById(state);
  const allJurisdictionIds = getAllJurisdictionsIdArray(state);
  const loadedJurisdictionIds = getJurisdictionsIdArray(state);

  const props = {
    allJurisdictionIds,
    isDraftPlan,
    isFinalizedPlan,
    isNewPlan,
    jurisdictionsById,
    loadedJurisdictionIds,
    planById: plan,
    planId,
    ...ownProps,
  };
  return props;
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchAllJurisdictionIdsActionCreator: fetchAllJurisdictionIds,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlanRecords,
};

/** Create connected IrsPlan */
const ConnectedIrsPlan = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlan);

export default ConnectedIrsPlan;
