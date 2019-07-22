// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import 'react-table/react-table.css';
import { Col, Form, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import Badge from 'reactstrap/lib/Badge';
import Button from 'reactstrap/lib/Button';
import { Store } from 'redux';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import HeaderBreadCrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { FIClassifications, locationHierarchy } from '../../../../configs/settings';
import {
  CASE_TRIGGERED,
  CURRENT_FOCUS_INVESTIGATION,
  FI_ACTIVE_TITLE,
  REACTIVE,
  ROUTINE,
} from '../../../../constants';
import {
  CASE_CLASSIFICATION_HEADER,
  CASE_NOTIF_DATE_HEADER,
  DEFINITIONS,
  END_DATE,
  FI_PLAN_TYPE,
  FI_SINGLE_MAP_URL,
  FI_URL,
  FOCUS_AREA_HEADER,
  FOCUS_INVESTIGATIONS,
  HOME,
  HOME_URL,
  NAME,
  START_DATE,
  STATUS_HEADER,
} from '../../../../constants';
import { renderClassificationRow } from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import {
  extractPlan,
  getLocationColumns,
  RouteParams,
  transformValues,
} from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlans,
  getPlansByReason,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import './style.css';
/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** interface to describe props for ActiveFI component */
export interface ActiveFIProps {
  caseTriggeredPlans: Plan[] | null;
  fetchPlansActionCreator: typeof fetchPlans;
  routinePlans: Plan[] | null;
  supersetService: typeof supersetFetch;
}

/** default props for ActiveFI component */
export const defaultActiveFIProps: ActiveFIProps = {
  caseTriggeredPlans: [],
  fetchPlansActionCreator: fetchPlans,
  routinePlans: [],
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
      { comparator: FI_PLAN_TYPE, operator: '==', subject: 'plan_intervention_type' },
    ]);
    supersetService(SUPERSET_PLANS_SLICE, supersetParams).then((result: Plan[]) =>
      fetchPlansActionCreator(result)
    );
  }

  public render() {
    const breadcrumbProps: BreadCrumbProps = {
      currentPage: {
        label: `${FOCUS_INVESTIGATIONS}`,
        url: `${FI_URL}`,
      },
      pages: [],
    };
    const homePage = {
      label: `${HOME}`,
      url: `${HOME_URL}`,
    };
    breadcrumbProps.pages = [homePage];

    const { caseTriggeredPlans, routinePlans } = this.props;
    if (
      (caseTriggeredPlans && caseTriggeredPlans.length === 0) ||
      (routinePlans && routinePlans.length === 0)
    ) {
      return <Loading />;
    }
    const a: any = [];
    return (
      <div>
        <Helmet>
          <title>{ACTIVE_FOCUS_INVESTIGATION}</title>
        </Helmet>
        <HeaderBreadCrumb {...breadcrumbProps} />
        <h2 className="mb-3 mt-5 page-title">{CURRENT_FOCUS_INVESTIGATION}</h2>
        <hr />
        <Form inline={true}>
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
        {[caseTriggeredPlans, routinePlans].forEach((plansArray: Plan[] | null) => {
          if (plansArray && plansArray.length) {
            const thePlans = plansArray.map((item: Plan) => {
              let thisItem = extractPlan(item);
              // transform values of this properties if they are null
              const propertiesToTransform = ['village', 'canton', 'district', 'province'];
              thisItem = transformValues(thisItem, propertiesToTransform);
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
                          /** 24 hours ago */
                          const oneDayAgo = new Date().getTime() + 1 * 24 * 60 * 60;
                          const newRecordBadge =
                            Date.parse(cell.original.plan_date) >= oneDayAgo ? (
                              <Badge color="warning" pill={true}>
                                Warning
                              </Badge>
                            ) : null;
                          return (
                            <div>
                              {cell.value}
                              {newRecordBadge}
                            </div>
                          );
                        },
                        Header: '',
                        accessor: 'caseNotificationDate',
                        minWidth: 120,
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
                        minWidth: 120,
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
                      return <div>{cell.value}</div>;
                    },
                    Header: '',
                    accessor: 'plan_title',
                    minWidth: 100,
                  },
                ],
              },
              {
                Header: 'FI STATUS',
                columns: [
                  {
                    Header: '',
                    accessor: 'plan_status',
                    minWidth: 100,
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
                            <Link to="#">
                              <FontAwesomeIcon icon={['fas', 'external-link-square-alt']} />
                            </Link>
                          )}
                        </div>
                      );
                    },
                    Header: '',
                    accessor: 'focusArea',
                    minWidth: 120,
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
              {
                Header: 'Actions',
                columns: [
                  {
                    Cell: (cell: CellInfo) => {
                      const actionLink =
                        cell.value === 'active' ? (
                          <Link to={`${FI_SINGLE_MAP_URL}/${cell.original.id}`}>View</Link>
                        ) : (
                          <Link to="#">Edit</Link>
                        );
                      return <div>{actionLink}</div>;
                    },
                    Header: '',
                    accessor: 'plan_status',
                    minWidth: 100,
                  },
                ],
              },
            ];
            // const allColumns: Column[] = locationColumns.concat(otherColumns);
            // thePlans.map(d => delete d.reason && delete d.plan_fi_reason);
            const tableProps = {
              CellComponent: DrillDownTableLinkedCell,
              columns: allColumns,
              data: thePlans,
              identifierField: 'id',
              linkerField: 'id',
              minRows: 0,
              parentIdentifierField: 'parent',
              rootParentId: null,
              showPageSizeOptions: false,
              showPagination: false,
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
            a.push(
              <div key={thePlans[0].id}>
                {TableHeaderWithOptionalForm}
                <DrillDownTable {...tableProps} />
              </div>
            );
          }
        })}
        {a}
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
  caseTriggeredPlans: Plan[] | null;
  routinePlans: Plan[] | null;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
  const caseTriggeredPlans = getPlansByReason(state, CASE_TRIGGERED);
  const routinePlans = getPlansByReason(state, ROUTINE);

  return {
    caseTriggeredPlans,
    routinePlans,
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
