// this is the FocusInvestigation "active" page component
import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Column } from 'react-table';
import { Button, Col, Form, FormGroup, Input, Row } from 'reactstrap';
import { Store } from 'redux';
import GisidaWrapper from '../../../../components/GisidaWrapper';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import NullDataTable from '../../../../components/Table/NullDataTable/nulldatatable';
import TableHeader from '../../../../components/Table/TableHeaders/tableheaders';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLANS_SLICE,
} from '../../../../configs/env';
import {
  completeReactivePlansColumn,
  completeRoutinePlansColumn,
  currentReactivePlansColumns,
  currentRoutinePlansColumn,
  dateCompletedColumn,
  emptyCompleteReactivePlans,
  emptyCompleteRoutinePlans,
  emptyCurrentReactivePlans,
  emptyCurrentRoutinePlans,
  locationHierarchy,
  statusColumn,
} from '../../../../configs/settings';
import {
  CANTON,
  CASE_TRIGGERED,
  COMPLETE_FOCUS_INVESTIGATION,
  CURRENT_FOCUS_INVESTIGATION,
  DISTRICT,
  FI_REASON,
  FI_SINGLE_URL,
  FI_STATUS,
  FI_URL,
  FOCUS_AREA_INFO,
  FOCUS_INVESTIGATIONS,
  HOME,
  HOME_URL,
  IN,
  PROVINCE,
  REACTIVE,
  ROUTINE,
} from '../../../../constants';
import {
  defaultTableProps,
  extractPlan,
  FlexObject,
  getLocationColumns,
  jsxColumns,
  RouteParams,
  transformValues,
} from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import goalsReducer, {
  fetchGoals,
  getGoalsByPlanAndJurisdiction,
  Goal,
  reducerName as goalsReducerName,
} from '../../../../store/ducks/goals';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../store/ducks/jurisdictions';
import plansReducer, {
  fetchPlans,
  getPlanById,
  getPlansArray,
  getPlansIdArray,
  InterventionType,
  Plan,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import './single.css';

/** register the goals reducer */
reducerRegistry.register(goalsReducerName, goalsReducer);
/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);
/** register the jurisdictions reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** interface to describe props for ActiveFI component */
export interface SingleFIProps {
  completeReactivePlansArray: Plan[] | [];
  completeRoutinePlansArray: Plan[] | [];
  currentReactivePlansArray: Plan[] | [];
  currentRoutinePlansArray: Plan[] | [];
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlans;
  goalsArray: Goal[];
  jurisdiction: Jurisdiction | null;
  planById: Plan | null;
  plansIdArray: string[];
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI component */
export const defaultSingleFIProps: SingleFIProps = {
  completeReactivePlansArray: [],
  completeRoutinePlansArray: [],
  currentReactivePlansArray: [],
  currentRoutinePlansArray: [],
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
  goalsArray: [],
  jurisdiction: null,
  planById: null,
  plansIdArray: [],
  supersetService: supersetFetch,
};

/** Reporting for Single Active Focus Investigation */
class SingleFI extends React.Component<RouteComponentProps<RouteParams> & SingleFIProps, {}> {
  public static defaultProps = defaultSingleFIProps;
  constructor(props: RouteComponentProps<RouteParams> & SingleFIProps) {
    super(props);
  }

  public async componentDidMount() {
    const {
      fetchGoalsActionCreator,
      fetchJurisdictionsActionCreator,
      fetchPlansActionCreator,
      planById,
      supersetService,
    } = this.props;

    if (planById && planById.plan_id) {
      /** define superset filter params for plans */
      const plansParams = superset.getFormData(3000, [
        { comparator: planById.plan_id, operator: '==', subject: 'plan_id' },
      ]);
      /** define superset params for goals */
      const goalsParams = superset.getFormData(
        3000,
        [{ comparator: planById.plan_id, operator: '==', subject: 'plan_id' }],
        { action_prefix: true }
      );
      /** define superset filter params for jurisdictions */
      const jurisdictionsParams = superset.getFormData(3000, [
        { comparator: planById.jurisdiction_id, operator: '==', subject: 'jurisdiction_id' },
      ]);
      await supersetService(SUPERSET_PLANS_SLICE, jurisdictionsParams).then((result: Plan[]) =>
        fetchPlansActionCreator(result)
      );
      await supersetService(SUPERSET_GOALS_SLICE, goalsParams).then((result2: Goal[]) =>
        fetchGoalsActionCreator(result2)
      );
      await supersetFetch(SUPERSET_JURISDICTIONS_SLICE, jurisdictionsParams).then(
        (result: Jurisdiction[]) => fetchJurisdictionsActionCreator(result)
      );
    }
  }
  /** Handles form submission event */
  public handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }
  public render() {
    const {
      completeReactivePlansArray,
      completeRoutinePlansArray,
      currentReactivePlansArray,
      currentRoutinePlansArray,
      goalsArray,
      jurisdiction,
      planById,
    } = this.props;
    const theGoals = goalsArray;

    if (!planById || !theGoals || !jurisdiction) {
      return <Loading />;
    }
    /** theObject holds extracted plans from superset response */
    let theObject = extractPlan(planById);
    const propertiesToTransform = [
      'village',
      'canton',
      'district',
      'provice',
      'jurisdiction_id',
      'focusArea',
    ];
    theObject = transformValues(theObject, propertiesToTransform);
    const basePage = {
      label: FOCUS_INVESTIGATIONS,
      url: FI_URL,
    };
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: theObject.focusArea,
        url: `${FI_SINGLE_URL}/${planById.id}`,
      },
      pages: [],
    };
    const namePaths =
      planById.jurisdiction_name_path instanceof Array ? planById.jurisdiction_name_path : [];
    const pages = namePaths.map(namePath =>
      // return a page object for each name path
      ({
        label: namePath,
        url: '',
      })
    );
    breadCrumbProps.pages = [homePage, basePage, ...pages];
    /** currentRoutineReactivePlans array that holds current routine and reactive tables  */
    const currentRoutineReactivePlans: FlexObject[] = [];
    /** completeRoutineReactivePlans array that holds complete routine and reactive tables  */
    const completeRoutineReactivePlans: FlexObject[] = [];
    /** Check if either currentReactivePlansArray or currentRoutinePlansArray length is greater than  zero
     * to build current section tables i.e (routine & reactive) with data
     */
    if (
      (currentReactivePlansArray && currentReactivePlansArray.length > 0) ||
      (currentRoutinePlansArray && currentRoutinePlansArray.length > 0)
    ) {
      [currentReactivePlansArray, currentRoutinePlansArray].forEach((plansArray: Plan[]) => {
        if (plansArray && plansArray.length) {
          const thePlans = plansArray.map((item: Plan) => {
            let thisItem = extractPlan(item);
            // transform values of this properties if they are null
            const columnsToTransform = ['village', 'canton', 'district', 'province'];
            thisItem = transformValues(thisItem, columnsToTransform);
            return thisItem;
          });
          const locationColumns: Column[] = getLocationColumns(locationHierarchy, true);
          /**  Handle Columns Unique for Routine and Reactive Tables */
          const columnsBasedOnReason = [];
          /** If plan_fi_reason is case-triggered then add currentReactivePlansColumns from settings */
          if (plansArray.every(d => d.plan_fi_reason === CASE_TRIGGERED)) {
            columnsBasedOnReason.push(...currentReactivePlansColumns);
          } else {
            /** Else build routine columns i.e (focusarea, locationcolumns, action and currentRoutinePlansColumn) */
            const focusAreaColumn = jsxColumns('focusarea');
            columnsBasedOnReason.push(
              ...locationColumns,
              ...focusAreaColumn,
              ...currentRoutinePlansColumn,
              ...jsxColumns('action')
            );
          }
          /** Handle all Columns i.e columns unique for reactive and routine (once handled above) plus columns common on both (name)  */
          const allColumns: Column[] = [
            ...jsxColumns('name'),
            ...statusColumn,
            ...columnsBasedOnReason,
          ];
          /** Contains columns and data that will build the table */
          const tableProps = {
            ...defaultTableProps,
            columns: allColumns,
            data: thePlans,
          };
          /** Push current tables and respective headers with data to be rendered */
          currentRoutineReactivePlans.push(
            <div key={thePlans[0].id}>
              <TableHeader plansArray={plansArray} />
              <DrillDownTable {...tableProps} />
            </div>
          );
        }
      });
    }
    /** if current reactive plans array is empty build table with no data  */
    if (!currentReactivePlansArray.length) {
      const tableProps = {
        ...defaultTableProps,
        columns: emptyCurrentReactivePlans,
      };
      currentRoutineReactivePlans.push(
        <NullDataTable
          key={`${'current'}-${REACTIVE}`}
          tableProps={tableProps}
          reasonType={REACTIVE}
        />
      );
    }
    /** if current routine plans array is empty build table with no data  */
    if (!currentRoutinePlansArray.length) {
      const tableProps = {
        ...defaultTableProps,
        columns: emptyCurrentRoutinePlans,
      };
      currentRoutineReactivePlans.push(
        <NullDataTable
          key={`${'current'}-${ROUTINE}`}
          tableProps={tableProps}
          reasonType={ROUTINE}
        />
      );
    }

    /** Check if either completeReactivePlansArray or completeRoutinePlansArray length is greater than  zero
     * to build complete section tables i.e (routine & reactive) with data
     */
    if (
      (completeReactivePlansArray && completeReactivePlansArray.length > 0) ||
      (completeRoutinePlansArray && completeRoutinePlansArray.length > 0)
    ) {
      [completeReactivePlansArray, completeRoutinePlansArray].forEach((plansArray: Plan[]) => {
        if (plansArray && plansArray.length) {
          const thePlans = plansArray.map((item: Plan) => {
            let thisItem = extractPlan(item);
            // transform values of this properties if they are null
            const columnsToTransform = ['village', 'canton', 'district', 'province'];
            thisItem = transformValues(thisItem, columnsToTransform);
            return thisItem;
          });
          /**  Handle Columns Unique for Routine and Reactive Tables */
          const columnsBasedOnReason = [];
          plansArray.every(d => d.plan_fi_reason === CASE_TRIGGERED)
            ? columnsBasedOnReason.push(...completeReactivePlansColumn)
            : columnsBasedOnReason.push(...completeRoutinePlansColumn);
          /** Handle all Columns i.e columns unique for reactive and routine (once handled above) plus columns common on both (name)  */
          const allColumns: Column[] = [
            ...jsxColumns('name'),
            ...dateCompletedColumn,
            ...columnsBasedOnReason,
          ];
          /** Contains columns and data that will build the table */
          const tableProps = {
            ...defaultTableProps,
            columns: allColumns,
            data: thePlans,
          };
          /** Push complete tables and respective headers with data to be rendered */
          completeRoutineReactivePlans.push(
            <div key={thePlans[0].id}>
              <TableHeader plansArray={plansArray} />
              <DrillDownTable {...tableProps} />
            </div>
          );
        }
      });
    }
    /** if complete reactive plans array is empty build table with no data  */
    if (!completeReactivePlansArray.length) {
      const tableProps = {
        ...defaultTableProps,
        columns: emptyCompleteReactivePlans,
      };
      completeRoutineReactivePlans.push(
        <NullDataTable
          key={`${'complete'}-${REACTIVE}`}
          tableProps={tableProps}
          reasonType={REACTIVE}
        />
      );
    }
    /** if complete routine plans array is empty build table with no data  */
    if (!completeRoutinePlansArray.length) {
      const tableProps = {
        ...defaultTableProps,
        columns: emptyCompleteRoutinePlans,
      };
      completeRoutineReactivePlans.push(
        <NullDataTable
          key={`${'complete'}-${ROUTINE}`}
          tableProps={tableProps}
          reasonType={ROUTINE}
        />
      );
    }
    return (
      <div className="mb-5">
        <Helmet>
          <title>{`${FOCUS_INVESTIGATIONS} ${IN} ${theObject.focusArea}`}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title mt-4 mb-5">
          {FOCUS_INVESTIGATIONS} {IN} {theObject.focusArea}
        </h2>
        <Row>
          <Col className="col-6">
            <h4 className="mb-4">{FOCUS_AREA_INFO}</h4>
            {theObject.jurisdiction_id && (
              <div className="map-area">
                <GisidaWrapper geoData={jurisdiction} minHeight="200px" />
              </div>
            )}
          </Col>
          <Col className="col-6">
            <dl className="row mt-3">
              <dt className="col-4">{PROVINCE}</dt>
              <dd className="col-8">{theObject.province}</dd>
              <dt className="col-4">{DISTRICT}</dt>
              <dd className="col-8">{theObject.district}</dd>
              <dt className="col-4">{CANTON}</dt>
              <dd className="col-8">{theObject.canton}</dd>
              <dt className="col-4">{FI_STATUS}</dt>
              <dd className="col-8">{theObject.status}</dd>
              <dt className="col-4">{FI_REASON}</dt>
              <dd className="col-8">{theObject.reason}</dd>
            </dl>
          </Col>
        </Row>
        <hr />
        <Form inline={true} onSubmit={this.handleSubmit}>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Input
              type="text"
              name="search"
              id="exampleEmail"
              placeholder="Search active focus investigations"
            />
          </FormGroup>
          <Button outline={true} color="success">
            Search
          </Button>
        </Form>
        <h4 className="mb-4">{CURRENT_FOCUS_INVESTIGATION}</h4>
        <hr />
        {currentRoutineReactivePlans}
        <h4 className="mb-4 complete">{COMPLETE_FOCUS_INVESTIGATION}</h4>
        <hr />
        {completeRoutineReactivePlans}
      </div>
    );
  }
}

export { SingleFI };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  completeReactivePlansArray: Plan[] | [];
  completeRoutinePlansArray: Plan[] | [];
  currentReactivePlansArray: Plan[] | [];
  currentRoutinePlansArray: Plan[] | [];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const plan = getPlanById(state, ownProps.match.params.id);
  let goalsArray = null;
  let jurisdiction = null;
  if (plan) {
    goalsArray = getGoalsByPlanAndJurisdiction(state, plan.plan_id, plan.jurisdiction_id);
    jurisdiction = getJurisdictionById(state, plan.jurisdiction_id);
  }
  const result = {
    completeReactivePlansArray: getPlansArray(
      state,
      InterventionType.FI,
      [PlanStatus.COMPLETE],
      CASE_TRIGGERED
    ),
    completeRoutinePlansArray: getPlansArray(
      state,
      InterventionType.FI,
      [PlanStatus.COMPLETE],
      ROUTINE
    ),
    currentReactivePlansArray: getPlansArray(
      state,
      InterventionType.FI,
      [PlanStatus.ACTIVE, PlanStatus.DRAFT],
      CASE_TRIGGERED
    ),
    currentRoutinePlansArray: getPlansArray(
      state,
      InterventionType.FI,
      [PlanStatus.ACTIVE, PlanStatus.DRAFT],
      ROUTINE
    ),
    goalsArray,
    jurisdiction,
    planById: plan,
    plansIdArray: getPlansIdArray(state, InterventionType.FI, [], null),
  };
  return result;
};

const mapDispatchToProps = {
  fetchGoalsActionCreator: fetchGoals,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  fetchPlansActionCreator: fetchPlans,
};

/** create connected component */

/** Connected SingleFI component */
const ConnectedSingleFI = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleFI);

export default ConnectedSingleFI;
