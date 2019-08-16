// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DrillDownTable from '@onaio/drill-down-table';
import { FlexObject } from '@onaio/drill-down-table/dist/types/helpers/utils';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import 'react-table/react-table.css';
import { Button, Col, Form, FormGroup, Input, Row, Table } from 'reactstrap';
import { Store } from 'redux';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import LinkToNewPlans from '../../../../components/LinkToNewPlans';
import NewRecordBadge from '../../../../components/NewRecordBadge';
import HeaderBreadCrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { FIClassifications, locationHierarchy } from '../../../../configs/settings';
import {
  CASE_CLASSIFICATION_HEADER,
  CASE_NOTIF_DATE_HEADER,
  CASE_TRIGGERED,
  CURRENT_FOCUS_INVESTIGATION,
  DEFINITIONS,
  END_DATE,
  FI_PLAN_TYPE,
  FI_SINGLE_MAP_URL,
  FI_SINGLE_URL,
  FI_STATUS,
  FI_URL,
  FOCUS_AREA_HEADER,
  FOCUS_INVESTIGATIONS,
  HOME,
  HOME_URL,
  NAME,
  NEW_PLAN_URL,
  REACTIVE,
  ROUTINE,
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
  getPlansArray,
  InterventionType,
  Plan,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import './../../../../styles/css/drill-down-table.css';
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
  caseTriggeredPlans: null,
  fetchPlansActionCreator: fetchPlans,
  routinePlans: null,
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
  public handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    const routineReactivePlans: FlexObject[] = [];
    return (
      <div>
        <Helmet>
          <title>{CURRENT_FOCUS_INVESTIGATION}</title>
        </Helmet>
        <HeaderBreadCrumb {...breadcrumbProps} />
        <h2 className="mb-3 mt-5 page-title">{CURRENT_FOCUS_INVESTIGATION}</h2>
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
                    accessor: 'plan_status',
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
                            <Link to={`${FI_SINGLE_URL}/${cell.original.id}`}>
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
              parentIdentifierField: 'parent',
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
                    <h3 className="mb-3 mt-5 page-title">{ROUTINE}</h3>
                  </Col>
                  <Col xs="6">
                    <LinkToNewPlans />
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
  caseTriggeredPlans: Plan[] | null;
  routinePlans: Plan[] | null;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
  const caseTriggeredPlans = getPlansArray(
    state,
    InterventionType.FI,
    [PlanStatus.ACTIVE, PlanStatus.DRAFT],
    CASE_TRIGGERED
  );
  const routinePlans = getPlansArray(
    state,
    InterventionType.FI,
    [PlanStatus.ACTIVE, PlanStatus.DRAFT],
    ROUTINE
  );
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
