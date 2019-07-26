// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { Actions } from 'gisida';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import { Badge, Button, Col, Form, FormGroup, Input, Row } from 'reactstrap';
import { Store } from 'redux';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import GisidaWrapper from '../../../../components/GisidaWrapper';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_PLANS_SLICE,
} from '../../../../configs/env';
import { defaultTableProps, locationHierarchy } from '../../../../configs/settings';
import {
  ACTIVE_INVESTIGATION,
  CANTON,
  CASE_CLASSIFICATION_HEADER,
  CASE_NOTIF_DATE_HEADER,
  CASE_TRIGGERED,
  COMPLETE,
  COMPLETE_FOCUS_INVESTIGATION,
  CURRENT_FOCUS_INVESTIGATION,
  DISTRICT,
  END_DATE,
  FI_PLAN_TYPE,
  FI_REASON,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_STATUS,
  FI_URL,
  FOCUS_AREA_HEADER,
  FOCUS_AREA_INFO,
  FOCUS_INVESTIGATIONS,
  HOME,
  HOME_URL,
  IN,
  MARK_AS_COMPLETE,
  MEASURE,
  NAME,
  NO,
  OF,
  PROGRESS,
  PROVINCE,
  REACTIVE,
  RESPONSE,
  ROUTINE,
  START_DATE,
  STATUS_HEADER,
} from '../../../../constants';
import { getGoalReport } from '../../../../helpers/indicators';
import ProgressBar from '../../../../helpers/ProgressBar';
import {
  extractPlan,
  FlexObject,
  getLocationColumns,
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
  completeReactivePlansArray: Plan[];
  completeRoutinePlansArray: Plan[];
  currentReactivePlansArray: Plan[];
  currentRoutinePlansArray: Plan[];
  fetchGoalsActionCreator: typeof fetchGoals;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  fetchPlansActionCreator: typeof fetchPlans;
  goalsArray: Goal[];
  jurisdiction: Jurisdiction | null;
  planById: Plan | null;
  plansArray: Plan[];
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
  plansArray: [],
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
      const plansParams = superset.getFormData(2000, [
        { comparator: FI_PLAN_TYPE, operator: '==', subject: 'plan_intervention_type' },
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
      await supersetService(SUPERSET_PLANS_SLICE, plansParams).then((result: Plan[]) =>
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
    const currentRoutineReactivePlans: FlexObject[] = [];
    const completeRoutineReactivePlans: FlexObject[] = [];
    const defaultHeaders: Column[] = [];
    if (!currentReactivePlansArray.length) {
      defaultHeaders.push(
        {
          Header: NAME,
          columns: [{}],
        },
        {
          Header: FI_STATUS,
          columns: [{}],
        },
        {
          Header: CASE_NOTIF_DATE_HEADER,
          columns: [{}],
        },
        {
          Header: CASE_CLASSIFICATION_HEADER,
          columns: [{}],
        }
      );
    }
    if (!currentRoutinePlansArray.length) {
      defaultHeaders.push(
        {
          Header: NAME,
          columns: [{}],
        },
        {
          Header: FI_STATUS,
          columns: [{}],
        },
        {
          Header: PROVINCE,
          columns: [{}],
        },
        {
          Header: DISTRICT,
          columns: [{}],
        },
        {
          Header: CANTON,
          columns: [{}],
        },
        {
          Header: 'Village',
          columns: [{}],
        },
        {
          Header: FOCUS_AREA_HEADER,
          columns: [{}],
        },
        {
          Header: STATUS_HEADER,
          columns: [{}],
        },
        {
          Header: START_DATE,
          columns: [{}],
        },
        {
          Header: END_DATE,
          columns: [{}],
        },
        {
          Header: Actions,
          columns: [{}],
        }
      );
    }
    if (
      (currentReactivePlansArray && currentReactivePlansArray.length > 0) ||
      (currentRoutinePlansArray && currentRoutinePlansArray.length > 0)
    ) {
      [currentReactivePlansArray, currentRoutinePlansArray].forEach((plansArray: Plan[] | null) => {
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
          plansArray.every(d => d.plan_fi_reason === CASE_TRIGGERED)
            ? columnsBasedOnReason.push(
                {
                  Header: CASE_NOTIF_DATE_HEADER,
                  columns: [
                    {
                      Cell: (cell: CellInfo) => {
                        return <div>{cell.value}</div>;
                      },
                      Header: '',
                      accessor: 'caseNotificationDate',
                      minWidth: 90,
                    },
                  ],
                },
                {
                  Header: CASE_CLASSIFICATION_HEADER,
                  columns: [
                    {
                      Header: '',
                      accessor: 'caseClassification',
                    },
                  ],
                }
              )
            : columnsBasedOnReason.push(
                ...locationColumns,
                {
                  Header: FOCUS_AREA_HEADER,
                  columns: [
                    {
                      Cell: (cell: CellInfo) => {
                        return (
                          <div>
                            {cell.original.focusArea.trim() && cell.value}
                            &nbsp;&nbsp;
                            {cell.original.focusArea.trim() && (
                              <Link to={`${FI_SINGLE_URL}/${cell.original.id}`}>
                                <FontAwesomeIcon icon={['fas', 'external-link-square-alt']} />
                              </Link>
                            )}
                          </div>
                        );
                      },
                      Header: '',
                      accessor: 'focusArea',
                      minWidth: 160,
                    },
                  ],
                },
                {
                  Header: STATUS_HEADER,
                  columns: [
                    {
                      Header: '',
                      accessor: 'status',
                      maxWidth: 60,
                    },
                  ],
                },
                {
                  Header: START_DATE,
                  columns: [
                    {
                      Cell: (cell: CellInfo) => {
                        return <div>{cell.value}</div>;
                      },
                      Header: '',
                      accessor: 'plan_effective_period_start',
                      minWidth: 80,
                    },
                  ],
                },
                {
                  Header: END_DATE,
                  columns: [
                    {
                      Header: '',
                      accessor: 'plan_effective_period_end',
                    },
                  ],
                },
                {
                  Header: 'Action',
                  columns: [
                    {
                      Cell: (cell: CellInfo) => {
                        return null;
                      },
                      Header: '',
                      accessor: 'plan_status',
                      minWidth: 70,
                    },
                  ],
                }
              );
          const allColumns: Column[] = [
            {
              Header: NAME,
              columns: [
                {
                  Cell: (cell: CellInfo) => {
                    /** if 24 hours ago show badge */
                    const oneDayAgo = new Date().getTime() + 1 * 24 * 60 * 60;
                    const newRecordBadge =
                      Date.parse(cell.original.plan_date) >= oneDayAgo ? (
                        <Badge color="warning" pill={true}>
                          Warning
                        </Badge>
                      ) : null;
                    return (
                      <div>
                        {cell.original.focusArea.trim() && (
                          <Link to={`${FI_SINGLE_MAP_URL}/${cell.original.id}`}>{cell.value}</Link>
                        )}
                        &nbsp;
                        {newRecordBadge}
                      </div>
                    );
                  },
                  Header: '',
                  accessor: 'plan_title',
                  minWidth: 160,
                },
              ],
            },
            {
              Header: FI_STATUS,
              columns: [
                {
                  Header: '',
                  accessor: 'plan_status',
                  minWidth: 80,
                },
              ],
            },
            ...columnsBasedOnReason,
          ];
          const tableProps = {
            ...defaultTableProps,
            columns: allColumns,
            data: thePlans,
          };
          const TableHeaderWithOptionalForm = plansArray.every(
            d => d.plan_fi_reason === CASE_TRIGGERED
          ) ? (
            <h3 className="mb-3 mt-5 page-title">{REACTIVE}</h3>
          ) : (
            <div className="routine-heading">
              <Row>
                <Col xs="6">
                  <h3 className="mb-3 mt-5 page-title">{ROUTINE}</h3>
                </Col>
                <Col xs="6">
                  <Button className="focus-investigation" color="primary">
                    Add Focus Investigation
                  </Button>
                </Col>
              </Row>
            </div>
          );
          currentRoutineReactivePlans.push(
            <div key={thePlans[0].id}>
              {TableHeaderWithOptionalForm}
              <DrillDownTable {...tableProps} />
            </div>
          );
        }
      });
    }
    if (!completeReactivePlansArray.length) {
      const emptyCompleteReactivePlans: Column[] = [];
      emptyCompleteReactivePlans.push(
        {
          Header: NAME,
          columns: [{}],
        },
        {
          Header: 'Date Completed',
          columns: [{}],
        },
        {
          Header: CASE_NOTIF_DATE_HEADER,
          columns: [{}],
        },
        {
          Header: CASE_CLASSIFICATION_HEADER,
          columns: [{}],
        }
      );
      const tableProps = {
        ...defaultTableProps,
        columns: emptyCompleteReactivePlans,
      };
      completeRoutineReactivePlans.push(
        <div key="no-reactive">
          <h4>Reactive </h4>
          <DrillDownTable {...tableProps} NoDataComponent={(() => null) as any} />
          <h3 className="text-muted">No Investigations Found</h3>
          <hr />
        </div>
      );
    }
    if (!completeRoutinePlansArray.length) {
      const emptyCompleteRoutinePlans: Column[] = [];
      emptyCompleteRoutinePlans.push(
        {
          Header: NAME,
          columns: [{}],
        },
        {
          Header: START_DATE,
          columns: [{}],
        },
        {
          Header: END_DATE,
          columns: [{}],
        },
        {
          Header: 'Date Completed',
          columns: [{}],
        }
      );
      const tableProps = {
        ...defaultTableProps,
        columns: emptyCompleteRoutinePlans,
      };
      completeRoutineReactivePlans.push(
        <div key="no-routine">
          <h4>Routine </h4>
          <DrillDownTable {...tableProps} NoDataComponent={(() => null) as any} />
          <h3 className="text-muted">No Investigations Found</h3>
          <hr />
        </div>
      );
    }
    if (
      (completeReactivePlansArray && completeReactivePlansArray.length > 0) ||
      (completeRoutinePlansArray && completeRoutinePlansArray.length > 0)
    ) {
      [completeReactivePlansArray, completeRoutinePlansArray].forEach(
        (plansArray: Plan[] | null) => {
          if (plansArray && plansArray.length) {
            const thePlans = plansArray.map((item: Plan) => {
              let thisItem = extractPlan(item);
              // transform values of this properties if they are null
              const columnsToTransform = ['village', 'canton', 'district', 'province'];
              thisItem = transformValues(thisItem, columnsToTransform);
              return thisItem;
            });
            const columnsBasedOnReason = [];
            plansArray.every(d => d.plan_fi_reason === CASE_TRIGGERED)
              ? columnsBasedOnReason.push(
                  {
                    Header: END_DATE,
                    columns: [
                      {
                        Cell: (cell: CellInfo) => {
                          return cell.value;
                        },
                        Header: '',
                        accessor: 'plan_effective_period_end',
                      },
                    ],
                  },
                  {
                    Header: CASE_NOTIF_DATE_HEADER,
                    columns: [
                      {
                        Cell: (cell: CellInfo) => {
                          return <div>{cell.value}</div>;
                        },
                        Header: '',
                        accessor: 'caseNotificationDate',
                        minWidth: 90,
                      },
                    ],
                  },
                  {
                    Header: CASE_CLASSIFICATION_HEADER,
                    columns: [
                      {
                        Header: '',
                        accessor: 'caseClassification',
                      },
                    ],
                  }
                )
              : columnsBasedOnReason.push(
                  {
                    Header: START_DATE,
                    columns: [
                      {
                        Cell: (cell: CellInfo) => {
                          return <div>{cell.value}</div>;
                        },
                        Header: '',
                        accessor: 'plan_effective_period_start',
                        minWidth: 80,
                      },
                    ],
                  },
                  {
                    Header: END_DATE,
                    columns: [
                      {
                        Header: '',
                        accessor: 'plan_effective_period_end',
                      },
                    ],
                  },
                  {
                    Header: 'Date Completed',
                    columns: [
                      {
                        Cell: (cell: CellInfo) => {
                          return cell.value;
                        },
                        Header: '',
                        accessor: 'plan_effective_period_end',
                      },
                    ],
                  }
                );
            const allColumns: Column[] = [
              {
                Header: NAME,
                columns: [
                  {
                    Cell: (cell: CellInfo) => {
                      /** if 24 hours ago show badge */
                      const oneDayAgo = new Date().getTime() + 1 * 24 * 60 * 60;
                      const newRecordBadge =
                        Date.parse(cell.original.plan_date) >= oneDayAgo ? (
                          <Badge color="warning" pill={true}>
                            Warning
                          </Badge>
                        ) : null;
                      return (
                        <div>
                          {cell.original.focusArea.trim() && (
                            <Link to={`${FI_SINGLE_MAP_URL}/${cell.original.id}`}>
                              {cell.value}
                            </Link>
                          )}
                          &nbsp;
                          {newRecordBadge}
                        </div>
                      );
                    },
                    Header: '',
                    accessor: 'plan_title',
                    minWidth: 180,
                  },
                ],
              },
              {
                Header: FI_STATUS,
                columns: [
                  {
                    Header: '',
                    accessor: 'plan_status',
                    minWidth: 80,
                  },
                ],
              },
              ...columnsBasedOnReason,
            ];
            const tableProps = {
              ...defaultTableProps,
              columns: allColumns,
              data: thePlans,
            };
            const TableHeaderWithOptionalForm = plansArray.every(
              d => d.plan_fi_reason === CASE_TRIGGERED
            ) ? (
              <h3 className="mb-3 mt-5 page-title">{REACTIVE}</h3>
            ) : (
              <div className="routine-heading">
                <Row>
                  <Col xs="6">
                    <h3 className="mb-3 mt-5 page-title">{ROUTINE}</h3>
                  </Col>
                  <Col xs="6">
                    <Button className="focus-investigation" color="primary">
                      Add Focus Investigation
                    </Button>
                  </Col>
                </Row>
              </div>
            );
            completeRoutineReactivePlans.push(
              <div key={thePlans[0].id}>
                {TableHeaderWithOptionalForm}
                <DrillDownTable {...tableProps} />
              </div>
            );
          }
        }
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
        <hr />
        <h4 className="mb-4">{COMPLETE_FOCUS_INVESTIGATION}</h4>
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
  plansArray: Plan[];
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
    plansArray: getPlansArray(state, InterventionType.FI, [], null),
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
