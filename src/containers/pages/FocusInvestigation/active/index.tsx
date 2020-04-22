// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import 'react-table/react-table.css';
import { Col, Row, Table } from 'reactstrap';
import { Store } from 'redux';
import { format } from 'util';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import { SearchForm } from '../../../../components/forms/Search';
import LinkAsButton from '../../../../components/LinkAsButton';
import NewRecordBadge from '../../../../components/NewRecordBadge';
import HeaderBreadCrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import NullDataTable from '../../../../components/Table/NullDataTable';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import {
  ADD_FOCUS_INVESTIGATION,
  CASE_CLASSIFICATION_HEADER,
  CASE_NOTIF_DATE_HEADER,
  CURRENT_FOCUS_INVESTIGATION,
  DEFINITIONS,
  END_DATE,
  FI_IN_JURISDICTION,
  FI_STATUS,
  FOCUS_AREA_HEADER,
  FOCUS_INVESTIGATIONS,
  HOME,
  NAME,
  NEXT,
  PREVIOUS,
  REACTIVE,
  ROUTINE_TITLE,
  START_DATE,
  STATUS_HEADER,
} from '../../../../configs/lang';
import {
  FIClassifications,
  locationHierarchy,
  planStatusDisplay,
} from '../../../../configs/settings';
import {
  CASE_TRIGGERED,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_URL,
  HOME_URL,
  QUERY_PARAM_TITLE,
  ROUTINE,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { renderClassificationRow } from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import {
  defaultTableProps,
  getFilteredFIPlansURL,
  getQueryParams,
  removeNullJurisdictionPlans,
} from '../../../../helpers/utils';
import { extractPlan, getLocationColumns } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import store from '../../../../store';
import plansReducer, {
  fetchPlans,
  getPlanById,
  InterventionType,
  makePlansArraySelector,
  Plan,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import './../../../../styles/css/drill-down-table.css';
import './style.css';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

export interface RouteParams {
  jurisdiction_parent_id: string;
  plan_id: string;
}

/** interface to describe props for ActiveFI component */
export interface ActiveFIProps {
  caseTriggeredPlans: Plan[] | null;
  fetchPlansActionCreator: typeof fetchPlans;
  routinePlans: Plan[] | null;
  supersetService: typeof supersetFetch;
  plan: Plan | null;
  searchedTitle: string | null;
}

/** default props for ActiveFI component */
export const defaultActiveFIProps: ActiveFIProps = {
  caseTriggeredPlans: null,
  fetchPlansActionCreator: fetchPlans,
  plan: null,
  routinePlans: null,
  searchedTitle: null,
  supersetService: supersetFetch,
};

/** Reporting for Active Focus Investigations */
class ActiveFocusInvestigation extends React.Component<
  ActiveFIProps & RouteComponentProps<RouteParams>,
  {}
> {
  public static defaultProps: ActiveFIProps = defaultActiveFIProps;

  constructor(props: ActiveFIProps & RouteComponentProps<RouteParams>) {
    super(props);
  }

  public componentDidMount() {
    const { fetchPlansActionCreator, supersetService } = this.props;
    const supersetParams = superset.getFormData(2000, [
      { comparator: InterventionType.FI, operator: '==', subject: 'plan_intervention_type' },
    ]);
    supersetService(SUPERSET_PLANS_SLICE, supersetParams)
      .then((result: Plan[]) => fetchPlansActionCreator(result))
      .catch(err => displayError(err));
  }

  public render() {
    const breadcrumbProps: BreadCrumbProps = {
      currentPage: {
        label: `${FOCUS_INVESTIGATIONS}`,
        url: `${FI_URL}`,
      },
      pages: [],
    };

    const basePage = {
      label: FOCUS_INVESTIGATIONS,
      url: FI_URL,
    };
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };

    const { caseTriggeredPlans, routinePlans, plan, searchedTitle } = this.props;
    // We need to initialize jurisdictionName to a falsy value
    let jurisdictionName = null;

    // get the current page index
    if (plan) {
      const currentPageIndex: number = plan.jurisdiction_path.indexOf(
        this.props.match.params.jurisdiction_parent_id
      );
      breadcrumbProps.currentPage = {
        label: plan.jurisdiction_name_path[currentPageIndex],
        url: '',
      };
      jurisdictionName = plan.jurisdiction_name_path[currentPageIndex];
      const labels = plan.jurisdiction_name_path.slice(0, currentPageIndex);
      breadcrumbProps.pages = labels.map((label, i) => {
        return {
          label,
          url: getFilteredFIPlansURL(plan.jurisdiction_path[i], plan.id),
        };
      });
      breadcrumbProps.pages = [homePage, basePage, ...breadcrumbProps.pages];
    } else {
      breadcrumbProps.pages = [homePage];
    }

    if (
      caseTriggeredPlans &&
      caseTriggeredPlans.length === 0 &&
      routinePlans &&
      routinePlans.length === 0 &&
      searchedTitle === null
    ) {
      return <Loading />;
    }
    const routineReactivePlans: Dictionary[] = [];
    const pageTitle = jurisdictionName
      ? format(FI_IN_JURISDICTION, jurisdictionName)
      : CURRENT_FOCUS_INVESTIGATION;
    return (
      <div>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <HeaderBreadCrumb {...breadcrumbProps} />
        <h2 className="mb-3 mt-5 page-title">{pageTitle}</h2>
        <hr />
        <SearchForm history={this.props.history} location={this.props.location} />
        {[caseTriggeredPlans, routinePlans].forEach((plansArray: Plan[] | null, i) => {
          const locationColumns: Column[] = getLocationColumns(locationHierarchy, true);
          if (plansArray && plansArray.length) {
            const jurisdictionValidPlans = removeNullJurisdictionPlans(plansArray);
            const thePlans = jurisdictionValidPlans.map((item: Plan) => {
              return extractPlan(item);
            });
            /**  Handle Columns Unique for Routine and Reactive Tables */
            const columnsBasedOnReason = [];
            plansArray.every((singlePlan: Plan) => singlePlan.plan_fi_reason === CASE_TRIGGERED)
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
                  }
                );
            const allColumns: Column[] = [
              {
                Header: NAME,
                columns: [
                  {
                    Cell: (cell: CellInfo) => {
                      return (
                        <div>
                          {cell.original.focusArea.trim() && (
                            <Link to={`${FI_SINGLE_MAP_URL}/${cell.original.id}`}>
                              {cell.value}
                            </Link>
                          )}
                          &nbsp;
                          <NewRecordBadge recordDate={cell.original.plan_date} />
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
                    accessor: (d: Plan) => planStatusDisplay[d.plan_status] || d.plan_status,
                    id: 'plan_status',
                    minWidth: 80,
                  },
                ],
              },
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
                            <Link to={`${FI_SINGLE_URL}/${cell.original.jurisdiction_id}`}>
                              <FontAwesomeIcon icon={['fas', 'external-link-square-alt']} />
                            </Link>
                          )}
                        </div>
                      );
                    },
                    Header: '',
                    accessor: 'focusArea',
                    minWidth: 180,
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
              ...columnsBasedOnReason,
            ];
            const tableProps = {
              CellComponent: DrillDownTableLinkedCell,
              columns: allColumns,
              data: thePlans,
              identifierField: 'id',
              linkerField: 'id',
              minRows: 0,
              nextText: NEXT,
              parentIdentifierField: 'parent',
              previousText: PREVIOUS,
              rootParentId: null,
              showPageSizeOptions: false,
              showPagination: thePlans.length > 20,
              useDrillDownTrProps: false,
            };
            const TableHeaderWithOptionalForm = plansArray.every(
              d => d.plan_fi_reason === CASE_TRIGGERED
            ) ? (
              <h3 className="mb-3 mt-5 page-title">{REACTIVE}</h3>
            ) : (
              <div className="routine-heading">
                <Row>
                  <Col xs="6">
                    <h3 className="mb-3 mt-5 page-title">{ROUTINE_TITLE}</h3>
                  </Col>
                  <Col xs="6">
                    <LinkAsButton text={ADD_FOCUS_INVESTIGATION} />
                  </Col>
                </Row>
              </div>
            );
            routineReactivePlans.push(
              <div key={thePlans[0].id}>
                {TableHeaderWithOptionalForm}
                <DrillDownTable {...tableProps} />
              </div>
            );
          } else {
            const header = i ? ROUTINE_TITLE : REACTIVE;
            const emptyPlansColumns = [
              {
                Header: NAME,
                columns: [{ minWidth: 180 }],
              },
              ...locationColumns,
              {
                Header: FOCUS_AREA_HEADER,
                columns: [{ minWidth: 180 }],
              },
              {
                Header: STATUS_HEADER,
                columns: [{ maxWidth: 60 }],
              },

              {
                Header: CASE_NOTIF_DATE_HEADER,
                columns: [{ maxWidth: 90 }],
              },
              {
                Header: CASE_CLASSIFICATION_HEADER,
                columns: [{}],
              },
            ];
            const tableProps = {
              ...defaultTableProps,
              columns: emptyPlansColumns,
            };
            routineReactivePlans.push(
              <NullDataTable tableProps={tableProps} reasonType={header} key={i} />
            );
          }
        })}
        {routineReactivePlans}
        <h5 className="mt-5">{DEFINITIONS}</h5>
        <Table className="definitions">
          <tbody>{FIClassifications.map(el => renderClassificationRow(el))}</tbody>
        </Table>
      </div>
    );
  }
}

export { ActiveFocusInvestigation };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plan: Plan | null;
  caseTriggeredPlans: Plan[] | null;
  routinePlans: Plan[] | null;
  searchedTitle: string;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId =
    ownProps.match.params && ownProps.match.params.plan_id ? ownProps.match.params.plan_id : null;
  const plan = planId ? getPlanById(state, planId) : null;
  const jurisdictionParentId =
    ownProps.match.params && ownProps.match.params.jurisdiction_parent_id
      ? ownProps.match.params.jurisdiction_parent_id
      : null;

  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const caseTriggeredPlans = makePlansArraySelector()(store.getState(), {
    interventionType: InterventionType.FI,
    parentJurisdictionId: jurisdictionParentId,
    reason: CASE_TRIGGERED,
    statusList: [PlanStatus.ACTIVE, PlanStatus.COMPLETE],
    title: searchedTitle,
  });
  const routinePlans = makePlansArraySelector()(store.getState(), {
    interventionType: InterventionType.FI,
    parentJurisdictionId: jurisdictionParentId,
    reason: ROUTINE,
    statusList: [PlanStatus.ACTIVE, PlanStatus.COMPLETE],
    title: searchedTitle,
  });

  return {
    caseTriggeredPlans,
    plan,
    routinePlans,
    searchedTitle,
  };
};

const mapDispatchToProps = { fetchPlansActionCreator: fetchPlans };

/** create connected component */

/** Connected ActiveFI component */
const ConnectedActiveFocusInvestigation = connect(
  mapStateToProps,
  mapDispatchToProps
)(ActiveFocusInvestigation);

export default ConnectedActiveFocusInvestigation;
