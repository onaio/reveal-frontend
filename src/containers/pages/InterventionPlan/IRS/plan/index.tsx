// this is the IRS Plan page component
import { Actions } from 'gisida';
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

import { GREY } from '../../.../../../../../colors';
import {
  SUPERSET_JURISDICTIONS_DATA_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE,
  SUPERSET_PLANS_TABLE_SLICE,
} from '../../../../../configs/env';
import { HOME, HOME_URL, INTERVENTION_IRS_URL, MAP_ID } from '../../../../../constants';
import {
  FlexObject,
  preventDefault,
  RouteParams,
  stopPropagation,
  stopPropagationAndPreventDefault,
} from '../../../../../helpers/utils';
import {
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
  getJurisdictionsIdArray,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import plansReducer, {
  extractPlanPayloadFromPlanRecord,
  extractPlanRecordFromPlanPayload,
  extractPlanRecordResponseFromPlanPayload,
  fetchPlanRecords,
  getPlanRecordById,
  InterventionType,
  PlanPayload,
  PlanRecord,
  PlanRecordResponse,
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

const OpenSrpLocationService = new OpenSRPService('location');
const OpenSrpPlanService = new OpenSRPService('plans');

/** IrsPlanProps - interface for IRS Plan page */
export interface IrsPlanProps {
  allJurisdictionIds: string[];
  fetchAllJurisdictionIdsActionCreator: typeof fetchAllJurisdictionIds;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlanRecords;
  isDraftPlan?: boolean;
  isFinalizedPlan?: boolean;
  isNewPlan?: boolean;
  jurisdictionsArray: Jurisdiction[];
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
  jurisdictionsArray: [],
  loadedJurisdictionIds: [],
  planById: null,
  planId: null,
  supersetService: supersetFetch,
};

interface TableCrumb {
  label: string;
  id: string | null;
  active: boolean;
}

interface IrsPlanState {
  childlessChildrenIds: string[];
  country: JurisdictionsByCountry | null;
  doRenderTable: boolean;
  filteredJurisdictionIds: string[];
  focusJurisdictionId: string | null;
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
      isEditingPlanName: false,
      isLoadingGeoms: false,
      isLoadingJurisdictions: !!!props.jurisdictionsArray.length,
      isSaveDraftDisabled: false,
      isStartingPlan: props.isNewPlan || props.isDraftPlan || false,
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
        : props.planById || null,
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
      isFinalizedPlan,
      loadedJurisdictionIds,
      planId,
      planById,
      supersetService,
    } = this.props;

    // GET LIST OF ALL JURISDICTIONS
    let allJurIds: string[] = [];
    if (!allJurisdictionIds.length || allJurisdictionIds.length === loadedJurisdictionIds.length) {
      // todo - is there a better way to fetch a list of ALL jurisdiction ids?
      await supersetFetch(SUPERSET_JURISDICTIONS_DATA_SLICE, { row_limit: 3000 }).then(result => {
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
    let planJurisdictionIdsToGet: string[] = [];
    let otherJurisdictionIdsToGet: string[] = [];
    if (planId && isFinalizedPlan) {
      const pivotParams = superset.getFormData(500, [
        { comparator: planId, operator: '==', subject: 'plan_id' },
      ]);
      await supersetService(SUPERSET_PLAN_STRUCTURE_PIVOT_SLICE, pivotParams).then(
        relevantJuridictions => {
          if (!relevantJuridictions) {
            return new Promise((resolve, reject) => reject());
          }

          // define jurisdictions not in the store
          planJurisdictionIdsToGet = relevantJuridictions
            .map((j: any) =>
              !loadedJurisdictionIds.includes(j.jurisdiction_id) ? j.jurisdiction_id : null
            )
            .filter((j: string | null) => j && strict.length);

          if (!planJurisdictionIdsToGet.length) {
            return new Promise(resolve => resolve());
          }

          // build superset adhoc filter expression
          let sqlFilterExpression = '';
          for (let i = 0; i < planJurisdictionIdsToGet.length; i += 1) {
            const jurId = planJurisdictionIdsToGet[i];
            if (i) {
              sqlFilterExpression += ' OR ';
            }
            sqlFilterExpression += `jurisdiction_id = '${jurId}'`;
          }

          // define superset params for
          const planJurisdictionSupersetParams = superset.getFormData(1000, [
            { sqlExpression: sqlFilterExpression },
          ]);

          return supersetService(SUPERSET_JURISDICTIONS_SLICE, planJurisdictionSupersetParams).then(
            (jurisdictionResults: Jurisdiction[]) =>
              fetchJurisdictionsActionCreator(jurisdictionResults)
          );
        }
      );
    }

    // GET REMAINING JURISDICTIONS
    if (!isFinalizedPlan) {
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
        ? superset.getFormData(3000, [{ sqlExpression: sqlFilterExpression }])
        : { row_limit: 3000 };

      supersetService(SUPERSET_JURISDICTIONS_DATA_SLICE, otherJurisdictionSupersetParams).then(
        (jurisdictionResults: FlexObject[] = []) => {
          const jurisdictions = jurisdictionResults.map(j => {
            const { id, parent_id, name, geographic_level } = j;
            const jurisdiction: Jurisdiction = {
              geographic_level: geographic_level || 0,
              jurisdiction_id: id,
              name: name || null,
              parent_id: parent_id || null,
            };
            return jurisdiction;
          });
          return fetchJurisdictionsActionCreator(jurisdictions);
        }
      );
    }
  }

  public componentWillReceiveProps(nextProps: IrsPlanProps) {
    const {
      childlessChildrenIds,
      country,
      isLoadingGeoms,
      isLoadingJurisdictions,
      newPlan,
    } = this.state;
    const { isDraftPlan, jurisdictionsArray, planById } = nextProps;

    if (newPlan && childlessChildrenIds && country && isLoadingGeoms) {
      const filteredJurisdictions = jurisdictionsArray.filter(
        (j: Jurisdiction) => childlessChildrenIds.indexOf(j.jurisdiction_id) !== -1
      );

      const loadedJurisdictions = filteredJurisdictions.filter((j: Jurisdiction) => j.geojson);
      if (loadedJurisdictions.length === filteredJurisdictions.length) {
        this.setState({
          isLoadingGeoms: false,
        });
      }
    }

    if (
      isLoadingJurisdictions &&
      jurisdictionsArray.length !== this.props.jurisdictionsArray.length
    ) {
      this.setState({ isLoadingJurisdictions: false });
    }

    if (isDraftPlan && !newPlan && planById && planById.plan_jurisdictions_ids) {
      this.setState({
        isStartingPlan: !!this.state.country,
        newPlan: planById,
      });
    }
  }

  public render() {
    const { planId, planById, isDraftPlan, isFinalizedPlan, isNewPlan } = this.props;
    const {
      planCountry,
      doRenderTable,
      tableCrumbs,
      newPlan,
      isEditingPlanName,
      isLoadingJurisdictions,
      isSaveDraftDisabled,
      isStartingPlan,
    } = this.state;
    if (
      (planId && !planById) ||
      (isNewPlan && !newPlan) ||
      (isDraftPlan && isLoadingJurisdictions)
    ) {
      return <Loading />;
    }

    const pageLabel =
      (isFinalizedPlan && planById && planById.plan_title) ||
      (isDraftPlan && planById && `${planById.plan_title} (draft)`) ||
      (newPlan && newPlan.plan_title) ||
      'New Plan';

    const breadCrumbProps = this.getBreadCrumbProps(this.props, pageLabel);

    let planTableProps: DrillDownProps<any> | null; // todo - type with DrillDownProps
    if (isFinalizedPlan) {
      planTableProps = this.getFinalizedPlanTableProps(this.props);
    } else {
      planTableProps = this.getDrilldownPlanTableProps(this.state);
    }

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
                    {/* <option value="BW">Botswana</option> */}
                    <option value="NA">Namibia</option>
                    <option value="TH">Thailand</option>
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

    const onEditNameButtonClick = (e: any) => {
      this.onEditNameButtonClick(e);
    };
    const onCancleEditNameButtonClick = (e: any) => {
      this.onCancleEditNameButtonClick(e);
    };
    const onEditNameInputChange = (e: any) => {
      this.onEditNameInputChange(e);
    };
    const onSaveEditNameButtonClick = (e: any) => {
      this.onSaveEditNameButtonClick(e);
    };
    const onEditPlanSettingsButtonClick = (e: any) => {
      this.onEditPlanSettingsButtonClick(e);
    };
    const onSaveAsDraftButtonClick = (e: any) => {
      this.onSaveAsDraftButtonClick(e);
    };

    const planHeaderRow = (
      <Row>
        {isFinalizedPlan && (
          <Col xs="9" className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
          </Col>
        )}
        {!isFinalizedPlan && !isEditingPlanName && (
          <Col xs="9" className="page-title-col">
            <h2 className="page-title">IRS: {pageLabel}</h2>
            <Button color="link" onClick={onEditNameButtonClick}>
              edit
            </Button>
          </Col>
        )}
        {!isFinalizedPlan && newPlan && isEditingPlanName && (
          <Col xs="9" className="page-title-col">
            <h2 className="page-title edit">IRS:</h2>
            <InputGroup className="edit-plan-title-input-group">
              <Input
                id="edit-plan-title-input"
                name="edit-plan-title-input"
                onChange={onEditNameInputChange}
                placeholder={newPlan.plan_title}
              />
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={onCancleEditNameButtonClick}>
                  cancel
                </Button>
              </InputGroupAddon>
              <InputGroupAddon addonType="append">
                <Button color="primary" onClick={onSaveEditNameButtonClick}>
                  save
                </Button>
              </InputGroupAddon>

              <Button color="link" onClick={onEditPlanSettingsButtonClick}>
                Plan settings...
              </Button>
            </InputGroup>
          </Col>
        )}
        {/* <Col>Save / finalize buttons will go here</Col> */}
        {!isFinalizedPlan && (
          <Col xs="3" className="save-plan-buttons-column">
            <Button
              color="success"
              disabled={isSaveDraftDisabled}
              onClick={onSaveAsDraftButtonClick}
            >
              Save as a Draft
            </Button>
          </Col>
        )}
      </Row>
    );

    const onTableBreadCrumbClick = (e: any) => {
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

    const gisidaWrapperProps = this.getGisidaWrapperProps();

    return (
      <div className="mb-5">
        <Helmet>
          <title>IRS: {isNewPlan ? 'New Plan' : pageLabel}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        {planHeaderRow}

        {this.state.isLoadingGeoms && (
          <Row>
            <Col>
              <Loading />
            </Col>
          </Row>
        )}

        {gisidaWrapperProps && (
          <Row>
            <Col>
              <div className="map irs-plan-map">
                <GisidaWrapper {...gisidaWrapperProps} />
              </div>
            </Col>
          </Row>
        )}

        {/* Section for table of jurisdictions */}
        {planTableProps && (
          <Row>
            <Col>
              <h3 className="table-title">Jurisdictions</h3>
              {tableCrumbs.length && tableBreadCrumbs}
              {doRenderTable && <DrillDownTable {...planTableProps} />}
            </Col>
          </Row>
        )}
      </div>
    );
  }

  // Jurisdiction Hierarchy Control
  private onTableBreadCrumbClick = (e: any) => {
    preventDefault(e);
    if (e && e.target && e.target.id) {
      this.onResetDrilldownTableHierarchy(e.target.id);
    }
  };
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
  private onDrilldownClick(id: string) {
    const { tableCrumbs } = this.state;
    const { jurisdictionsArray } = this.props;

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
  private getNewPlanDate(): string {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  private getNewPlanTitle(): string {
    const date = this.getNewPlanDate();
    return `${InterventionType.IRS}_${date}`;
  }
  private onEditNameButtonClick(e: any) {
    preventDefault(e);
    if (this.state.newPlan) {
      this.setState({
        isEditingPlanName: true,
        previousPlanName: this.state.newPlan.plan_title,
      });
    }
  }
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
  private onCancleEditNameButtonClick(e: any) {
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
  private onSaveEditNameButtonClick(e: any) {
    e.preventDefault();
    this.setState({
      isEditingPlanName: false,
      previousPlanName: '',
    });
  }
  private onEditPlanSettingsButtonClick(e: any) {
    if (!this.props.isFinalizedPlan) {
      this.setState({ isStartingPlan: true });
    }
  }

  // new Plan form handlers
  private onSetPlanNameChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_title: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  private onSetPlanStartDateChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_effective_period_start: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  private onSetPlanEndDateChange(e: any) {
    if (e && e.target && e.target.value) {
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_effective_period_end: e.target.value,
      };
      this.setState({ newPlan });
    }
  }
  private onSelectCountryChange(e: any) {
    if (e && e.target && (e.target.value as ADMN0_PCODE)) {
      this.setState({ planCountry: e.target.value });
    }
  }
  private onStartPlanFormSubmit(e: any) {
    const { newPlan: NewPlan, planCountry } = this.state;
    const { jurisdictionsArray, isDraftPlan } = this.props;
    const country: JurisdictionsByCountry = CountriesAdmin0[planCountry as ADMN0_PCODE];

    const jurisdictionsToInclude = this.getDecendantJurisdictionIds(
      country.jurisdictionIds,
      jurisdictionsArray
    );

    const filteredJurisdictions: Jurisdiction[] = jurisdictionsArray.filter(
      (jurisdiction: Jurisdiction) =>
        jurisdictionsToInclude.indexOf(jurisdiction.jurisdiction_id) !== -1
    );

    const filteredJurisdictionIds = filteredJurisdictions.map(j => j.jurisdiction_id);
    const childlessChildrenIds = this.getChildlessChildrenIds(filteredJurisdictions);

    const newPlan: PlanRecord | null = NewPlan
      ? {
          ...NewPlan,
          plan_jurisdictions_ids:
            isDraftPlan && NewPlan && NewPlan.plan_jurisdictions_ids
              ? this.getAncestorJurisdictionIds(NewPlan.plan_jurisdictions_ids, jurisdictionsArray)
              : [...jurisdictionsToInclude],
        }
      : NewPlan;

    const tableCrumbs: TableCrumb[] = [
      {
        active: true,
        id: null,
        label: country.ADMN0_EN,
      },
    ];

    this.setState(
      {
        childlessChildrenIds,
        country,
        filteredJurisdictionIds,
        isLoadingGeoms: true,
        isStartingPlan: false,
        newPlan,
        tableCrumbs,
      },
      () => {
        // Get geoms for jurisdictionsToInclude
        const { childlessChildrenIds: ChildlessChildrenIds } = this.state;

        const loadedJurisdictionIds = this.props.jurisdictionsArray
          .filter(j => ChildlessChildrenIds.includes(j.jurisdiction_id) && !!j.geojson)
          .map(j => j.jurisdiction_id);

        const jurisdictionsToLoad = ChildlessChildrenIds.filter(
          j => !loadedJurisdictionIds.includes(j)
        );

        if (jurisdictionsToLoad.length) {
          const promises = [];
          for (const j of jurisdictionsToLoad) {
            promises.push(
              new Promise((resolve, reject) => {
                OpenSrpLocationService.read(j, {
                  is_jurisdiction: true,
                })
                  .then(jurisidction => resolve(jurisidction))
                  .catch(error => reject(error));
              })
            );
          }

          Promise.all(promises).then((results: any[]) => {
            const jurisdictions: Jurisdiction[] = [];
            for (const result of results) {
              const J = filteredJurisdictions.find(
                j => j.jurisdiction_id === result.id
              ) as Jurisdiction;
              if (J) {
                const j: Jurisdiction = {
                  ...J,
                  geojson: result,
                };
                jurisdictions.push(j);
              }
            }
            this.props.fetchJurisdictionsActionCreator(jurisdictions);
          });
        } else {
          this.setState({ isLoadingGeoms: false });
        }
      }
    );
  }

  // Jurisdiction Selection Control
  private onToggleJurisdictionSelection(id: string) {
    const { newPlan: NewPlan, filteredJurisdictionIds } = this.state;
    const filteredJurisdictions = this.props.jurisdictionsArray.filter(j =>
      filteredJurisdictionIds.includes(j.jurisdiction_id)
    );
    if (NewPlan && NewPlan.plan_jurisdictions_ids && filteredJurisdictions.length) {
      const newPlanJurisdictionIds = [...NewPlan.plan_jurisdictions_ids];

      // define child jurisdictions of clicked jurisdiction
      const jurisdictionIdsToToggle = this.getDecendantJurisdictionIds([id], filteredJurisdictions);

      // loop through all child jurisdictions
      for (const jurisdictionId of jurisdictionIdsToToggle) {
        // if checked and not in plan_jurisdictions_ids, add it
        if (!newPlanJurisdictionIds.includes(jurisdictionId)) {
          newPlanJurisdictionIds.push(jurisdictionId);
          // if not checked and in plan_jurisdictions_ids, remove it
        } else {
          newPlanJurisdictionIds.splice(newPlanJurisdictionIds.indexOf(jurisdictionId), 1);
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
  private onTableCheckboxChange(e: any) {
    if (e && e.target) {
      const { value: id } = e.target;
      this.onToggleJurisdictionSelection(id);
    }
  }
  private onToggleAllCheckboxChange(e: any) {
    const { newPlan: NewPlan, filteredJurisdictionIds } = this.state;
    const filteredJurisdictions = this.props.jurisdictionsArray.filter(j =>
      filteredJurisdictionIds.includes(j.jurisdiction_id)
    );
    if (e && e.target && NewPlan) {
      const { checked: isSelected } = e.target;
      const newPlanJurisdictionIds: string[] = isSelected
        ? filteredJurisdictions.map((j: Jurisdiction) => j.jurisdiction_id)
        : [];
      const newPlan: PlanRecord = {
        ...(this.state.newPlan as PlanRecord),
        plan_jurisdictions_ids: [...newPlanJurisdictionIds],
      };
      this.setState({ newPlan });
    }
  }

  // Getter methods
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
  private getDecendantJurisdictionIds(
    ParentIds: string[],
    jurisdictionsArray: Jurisdiction[],
    doIncludeParentIds: boolean = true
  ): string[] {
    const decendantIds: string[] = [];
    const parentIds: string[] = [...ParentIds];

    while (parentIds.length) {
      const parentId = parentIds.shift() as string;
      if (ParentIds.indexOf(parentId) === -1 || doIncludeParentIds) {
        decendantIds.push(parentId);
      }

      for (const jurisdiction of jurisdictionsArray) {
        if (jurisdiction.parent_id === parentId) {
          parentIds.push(jurisdiction.jurisdiction_id);
        }
      }
    }

    return decendantIds;
  }
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

  private getGisidaWrapperProps(): GisidaProps | null {
    const { country, isLoadingGeoms, filteredJurisdictionIds } = this.state;
    const filteredJurisdictions = this.props.jurisdictionsArray.filter(j =>
      filteredJurisdictionIds.includes(j.jurisdiction_id)
    );
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
        visible: t < 2,
      };
      ADMIN_LINE_LAYERS.push(adminLineLayer);
    }

    const ADMIN_FILL_LAYERS: any[] = [];
    const ADMIN_FILL_HANDLERS: Handlers[] = [];
    const adminFillColors: string[] = ['black', 'red', 'orange', 'yellow', 'green'];
    for (let t = 1; t < tilesets.length; t += 1) {
      const adminFillLayer = {
        ...fillLayerConfig,
        id: `${ADMN0_EN}-admin-${t}-fill`,
        paint: {
          'fill-color': adminFillColors[t],
          'fill-opacity': 0.75,
        },
        source: {
          layer: tilesets[t].layer,
          type: 'vector',
          url: tilesets[t].url,
        },
        visible: t === 1,
      };

      const handler: Handlers = {
        layer: [`${ADMN0_EN}-admin-${t}-fill`],
        method: e => {
          this.onAdminFillClick(e, country, t);
        },
        name: `${ADMN0_EN}-admin-${t}-fill-drilldown`,
        type: 'click',
      };
      ADMIN_FILL_HANDLERS.push(handler);

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
      }
      ADMIN_FILL_LAYERS.push(adminFillLayer);
    }

    function getJurisdictionFillLayers(jurisdictions: Jurisdiction[]) {
      const layers: FlexObject[] = [];
      const geoGraphicLevels: number[] = [];

      for (const j of jurisdictions) {
        const { geographic_level } = j;
        if (
          typeof geographic_level !== 'undefined' &&
          geoGraphicLevels.indexOf(geographic_level) === -1
        ) {
          geoGraphicLevels.push(geographic_level);
        }
      }
      geoGraphicLevels.sort().reverse();
      const colorMap = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

      for (const g of geoGraphicLevels) {
        const featureCollection = {
          features: jurisdictions.filter(j => j.geographic_level === g).map(j => j.geojson),
          type: 'FeatureCollection',
        };

        const layer = {
          ...fillLayerConfig,
          id: `${ADMN0_EN}-admin-${g}-jurisdiction-fill`,
          paint: {
            'fill-color': colorMap[g],
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
        layers.push(layer);
      }
      return layers;
    }

    const JURISDICTION_FILL_LAYERS = getJurisdictionFillLayers(filteredJurisdictions);

    const drillUpHandler: Handlers = {
      method: e => {
        this.onDrillUpClick(e, country);
      },
      name: 'drill-up-handler',
      type: 'click',
    };

    const gisidaWrapperProps: GisidaProps = {
      bounds,
      geoData: null,
      handlers: [...ADMIN_FILL_HANDLERS, drillUpHandler],
      layers: [...ADMIN_LINE_LAYERS, ...ADMIN_FILL_LAYERS, ...JURISDICTION_FILL_LAYERS],
      pointFeatureCollection: null,
      polygonFeatureCollection: null,
      structures: null,
    };
    return gisidaWrapperProps;
  }

  private onAdminFillClick(e: any, country: JurisdictionsByCountry, geographicLevel: number) {
    const { point, target: Map, originalEvent } = e;
    const features = Map.queryRenderedFeatures(point);
    const isShiftClick = originalEvent.shiftKey;
    const { filteredJurisdictionIds, childlessChildrenIds } = this.state;
    const filteredJurisdictions = this.props.jurisdictionsArray.filter(j =>
      filteredJurisdictionIds.includes(j.jurisdiction_id)
    );

    // handle Drilldown Click
    if (!isShiftClick && features.length && country.tilesets) {
      const feature = features[0];
      const { geometry, layer, properties } = feature;
      const clickedFeatureName = properties[country.tilesets[geographicLevel].idField];
      const clickedFeatureJurisdiction = filteredJurisdictions.find(
        j => j.name === clickedFeatureName
      ) as Jurisdiction;

      this.onDrilldownClick(clickedFeatureJurisdiction.jurisdiction_id);
      this.onResetDrilldownTableHierarchy(clickedFeatureJurisdiction.jurisdiction_id);

      // toggle current layer
      store.dispatch(Actions.toggleLayer(MAP_ID, layer.id));
      // check for next Admin fill layer
      if (country.tilesets[geographicLevel + 1]) {
        // zoom to clicked admin level
        const newBounds = GeojsonExtent(geometry);
        Map.fitBounds(newBounds, { padding: 20 });
        // toggle next admin fill layer
        const nextLayerId = `${country.ADMN0_EN}-admin-${geographicLevel + 1}-fill`;
        store.dispatch(Actions.toggleLayer(MAP_ID, nextLayerId));
        // todo - filter next layer down
      } else {
        // define childless decendant jurisdictions
        const decendantChildlessChildrenIds = this.getDecendantJurisdictionIds(
          [clickedFeatureJurisdiction.jurisdiction_id],
          filteredJurisdictions,
          false
        );
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
        Map.fitBounds(newBounds, { padding: 20 });
      }
    }

    // Handle selection click
    if (isShiftClick && features.length && country.tilesets) {
      const feature = features[0];
      const { properties } = feature;

      const clickedFeatureName = properties[country.tilesets[geographicLevel].idField];
      const clickedFeatureJurisdiction = filteredJurisdictions.find(
        j => j.name === clickedFeatureName
      ) as Jurisdiction;
      this.onToggleJurisdictionSelection(clickedFeatureJurisdiction.jurisdiction_id);
    }
  }

  private onDrillUpClick(e: any, country: JurisdictionsByCountry) {
    const { point, target: Map } = e;
    const features = Map.queryRenderedFeatures(point);

    if (!features.length && country.tilesets && country.bounds) {
      for (let t = 1; t < country.tilesets.length; t += 1) {
        const layerId = `${country.ADMN0_EN}-admin-${t}-fill`;
        if (Map.getLayer(layerId)) {
          const isLayerVisible = Map.getLayoutProperty(layerId, 'visibility') === 'visible';
          if ((t !== 1 && isLayerVisible) || (t === 1 && !isLayerVisible)) {
            store.dispatch(Actions.toggleLayer(MAP_ID, layerId));
          }
        }
      }
      Map.fitBounds(country.bounds, { padding: 20 });
      this.onResetDrilldownTableHierarchy(null);
    }
  }

  /** getDrilldownPlanTableProps - getter for hierarchical DrilldownTable props
   * @param props - component props
   * @returns tableProps|null - compatible object for DrillDownTable props
   */
  private getDrilldownPlanTableProps(state: IrsPlanState) {
    const { filteredJurisdictionIds, newPlan } = state;
    const filteredJurisdictions = this.props.jurisdictionsArray.filter(j =>
      filteredJurisdictionIds.includes(j.jurisdiction_id)
    );
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

    const onDrilldownClick = (e: any) => {
      if (e && e.target && e.target.id) {
        if (this.state.childlessChildrenIds.includes(e.target.id)) {
          stopPropagationAndPreventDefault(e);
        } else {
          this.onDrilldownClick(e.target.id);
        }
      }
    };

    const columns = [
      {
        Header: () => (
          <Input
            checked={planJurisdictionIds.length === filteredJurisdictions.length}
            className="plan-jurisdiction-select-all-checkbox"
            onChange={onToggleAllCheckboxChange}
            type="checkbox"
          />
        ),
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

    const tableProps: DrillDownProps<any> = {
      CellComponent: DropDownCell,
      columns,
      data: filteredJurisdictions.map((j: any) => ({
        ...j,
        id: j.jurisdiction_id,
        isChildless: this.state.childlessChildrenIds.includes(j.jurisdiction_id),
      })),
      identifierField: 'jurisdiction_id',
      linkerField: 'name',
      minRows: 0,
      parentIdentifierField: 'parent_id',
      rootParentId: this.state.focusJurisdictionId,
      showPagination: false,
      useDrillDownTrProps: true,
    };
    return tableProps;
  }
  /** getFinalizedPlanTableProps - getter for (flat) DrilldownTable props
   * @param props - component props
   * @returns tableProps|null - compatible object for DrillDownTable props
   */
  private getFinalizedPlanTableProps(props: IrsPlanProps) {
    const { jurisdictionsArray } = props;
    if (!jurisdictionsArray.length) {
      return null;
    }
    const jurisdictionData = jurisdictionsArray.map((j: Jurisdiction) =>
      j.geojson
        ? {
            ...j.geojson.properties,
          }
        : {
            id: j.jurisdiction_id,
            jurisdiction_name: j.name,
            parent_id: '',
          }
    );
    const columns: Column[] = [
      {
        Header: 'Name',
        columns: [
          {
            Header: '',
            accessor: 'jurisdiction_name',
          },
        ],
      },
      {
        Header: 'Teams Assigned',
        columns: [
          {
            Header: '',
            accessor: () => <span className="text-info">None assigned</span>,
            id: 'teams_assigned',
          },
        ],
      },
    ];

    const tableProps: DrillDownProps<any> = {
      CellComponent: DropDownCell,
      columns,
      data: [...jurisdictionData],
      identifierField: 'jurisdiction_id',
      linkerField: 'jurisdiction_name',
      minRows: 0,
      parentIdentifierField: 'parent_id',
      rootParentId: null,
      showPageSizeOptions: false,
      showPagination: false,
      useDrillDownTrProps: true,
    };
    return tableProps;
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

  // Service handlers
  private onSaveAsDraftButtonClick(e: any) {
    const { newPlan, childlessChildrenIds } = this.state;
    if (newPlan && newPlan.plan_jurisdictions_ids) {
      const now = new Date();
      const newPlanDraft: PlanRecord = {
        ...newPlan,
        plan_date: `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`,
        plan_jurisdictions_ids: newPlan.plan_jurisdictions_ids.filter(j =>
          childlessChildrenIds.includes(j)
        ),
        plan_status: PlanStatus.DRAFT,
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
                  this.props.history.push(
                    `${INTERVENTION_IRS_URL}/draft/${planPayload.identifier}`
                  );
                })
                .catch(() => {
                  this.setState({ isSaveDraftDisabled: false });
                });
            } else if (this.props.isDraftPlan) {
              OpenSrpPlanService.update(planPayload)
                .then(() => {
                  this.setState({
                    isSaveDraftDisabled: false,
                    newPlan: {
                      ...newPlanDraft,
                      plan_jurisdictions_ids: [...(newPlan.plan_jurisdictions_ids as string[])],
                    },
                  });
                })
                .catch(() => {
                  this.setState({ isSaveDraftDisabled: false });
                });
            }
          });

          // PUSH to OpenSRP endpoint
          // if res.ok
          // save to state as new PlanRecord
          // navigate to `/plan/draft/${newPlan.plan_id}
          // else
          // throw error (popup)
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

const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId = ownProps.match.params.id || null;
  const plan = getPlanRecordById(state, planId);
  const isNewPlan = planId === null;
  const isDraftPlan = plan && plan.plan_status !== 'active';
  const isFinalizedPlan = plan && plan.plan_status === 'active';

  const allJurisdictionIds = getAllJurisdictionsIdArray(state);
  const jurisdictionsArray = getJurisdictionsArray(state);
  const loadedJurisdictionIds = getJurisdictionsIdArray(state);

  const props = {
    allJurisdictionIds,
    isDraftPlan,
    isFinalizedPlan,
    isNewPlan,
    jurisdictionsArray,
    loadedJurisdictionIds,
    planById: plan,
    planId,
    ...ownProps,
  };
  return props;
};

const mapDispatchToProps = {
  fetchAllJurisdictionIdsActionCreator: fetchAllJurisdictionIds,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlanRecords,
};

const ConnectedIrsPlan = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlan);

export default ConnectedIrsPlan;
