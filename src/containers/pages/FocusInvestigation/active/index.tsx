// this is the FocusInvestigation "active" page component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Cell, Column } from 'react-table';
import 'react-table-v6/react-table.css';
import { Col, Row, Table } from 'reactstrap';
import { Store } from 'redux';
import { format } from 'util';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import { RowHeightFilter } from '../../../../components/forms/FilterForm/RowHeightFilter';
import SearchForm from '../../../../components/forms/Search';
import LinkAsButton from '../../../../components/LinkAsButton';
import NewRecordBadge from '../../../../components/NewRecordBadge';
import HeaderBreadCrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { DrillDownTablev7 } from '../../../../components/Table/DrillDown';
import { RenderFiltersInBarOptions } from '../../../../components/Table/DrillDown/TableJSX';
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
  REACTIVE,
  ROUTINE_TITLE,
  SEARCH,
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
  REACTIVE_QUERY_PARAM,
  ROUTINE,
  ROUTINE_QUERY_PARAM,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { renderClassificationRow } from '../../../../helpers/indicators';
import '../../../../helpers/tables.css';
import {
  getFilteredFIPlansURL,
  getQueryParams,
  removeNullJurisdictionPlans,
} from '../../../../helpers/utils';
import { extractPlan, getLocationColumns } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
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
}

/** default props for ActiveFI component */
export const defaultActiveFIProps: ActiveFIProps = {
  caseTriggeredPlans: null,
  fetchPlansActionCreator: fetchPlans,
  plan: null,
  routinePlans: null,
  supersetService: supersetFetch,
};

interface ActiveFIState {
  loading: boolean;
}

/** Reporting for Active Focus Investigations */
class ActiveFocusInvestigation extends React.Component<
  ActiveFIProps & RouteComponentProps<RouteParams>,
  ActiveFIState
> {
  public static defaultProps: ActiveFIProps = defaultActiveFIProps;

  constructor(props: ActiveFIProps & RouteComponentProps<RouteParams>) {
    super(props);
    const { caseTriggeredPlans, routinePlans } = props;
    const thereIsntData: boolean =
      (caseTriggeredPlans &&
        caseTriggeredPlans.length === 0 &&
        routinePlans &&
        routinePlans.length === 0) ||
      true;
    this.state = {
      loading: thereIsntData,
    };
  }

  public componentDidMount() {
    const { fetchPlansActionCreator, supersetService } = this.props;
    const supersetParams = superset.getFormData(2000, [
      { comparator: InterventionType.FI, operator: '==', subject: 'plan_intervention_type' },
    ]);
    supersetService(SUPERSET_PLANS_SLICE, supersetParams)
      .then((result: Plan[]) => {
        fetchPlansActionCreator(result);
        this.setState({
          loading: false,
        });
      })
      .catch(err => {
        displayError(err);
        this.setState({
          loading: false,
        });
      });
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

    const { caseTriggeredPlans, routinePlans, plan } = this.props;
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

    if (this.state.loading) {
      return <Loading />;
    }

    const pageTitle = jurisdictionName
      ? format(FI_IN_JURISDICTION, jurisdictionName)
      : CURRENT_FOCUS_INVESTIGATION;

    const locationColumns: Array<Column<Dictionary>> = getLocationColumns(locationHierarchy);
    const commonColumns: Array<Column<Dictionary>> = [
      {
        Cell: (cell: Cell<Dictionary>) => {
          const original = cell.row.original;
          return (
            <div>
              {original.focusArea.trim() && (
                <Link to={`${FI_SINGLE_MAP_URL}/${original.id}`}>{cell.value}</Link>
              )}
              &nbsp;
              <NewRecordBadge recordDate={original.plan_date} />
            </div>
          );
        },
        Header: NAME,
        accessor: 'plan_title',
        minWidth: 180,
      },
      {
        Header: FI_STATUS,
        accessor: (d: Dictionary) => planStatusDisplay[d.plan_status] || d.plan_status,
        id: 'plan_status',
        minWidth: 80,
      },
      ...locationColumns,
      {
        Cell: (cell: Cell<Dictionary>) => {
          const original = cell.row.original;
          return (
            <div>
              {original.focusArea.trim() && cell.value}
              &nbsp;&nbsp;
              {original.focusArea.trim() && (
                <Link to={`${FI_SINGLE_URL}/${original.jurisdiction_id}`}>
                  <FontAwesomeIcon icon={['fas', 'external-link-square-alt']} />
                </Link>
              )}
            </div>
          );
        },
        Header: FOCUS_AREA_HEADER,
        accessor: 'focusArea',
        minWidth: 180,
      },
      {
        Header: STATUS_HEADER,
        accessor: 'status',
        maxWidth: 60,
      },
    ];

    const caseTriggeredColumns = [
      ...commonColumns,
      {
        Cell: ({ value }: Cell<Dictionary>) => {
          return <div>{value}</div>;
        },
        Header: CASE_NOTIF_DATE_HEADER,
        accessor: 'caseNotificationDate',
        minWidth: 90,
      },
      {
        Header: CASE_CLASSIFICATION_HEADER,
        accessor: 'caseClassification',
      },
    ];
    const RoutineColumns = [
      ...commonColumns,
      {
        Cell: ({ value }: Cell<Dictionary>) => {
          return <div>{value}</div>;
        },
        Header: START_DATE,
        accessor: 'plan_effective_period_start',
        minWidth: 80,
      },
      {
        Header: END_DATE,
        accessor: 'plan_effective_period_end',
      },
    ];

    const createTableProps = <D extends object>(
      columns: Array<Column<D>>,
      data: Plan[] | null,
      queryParam: string
    ) => {
      const cleanedData = data !== null ? data : [];
      const jurisdictionValidPlans = removeNullJurisdictionPlans(cleanedData);
      const thePlans = jurisdictionValidPlans.map(extractPlan);

      return {
        CellComponent: DrillDownTableLinkedCell,
        columns,
        data: thePlans,
        renderInFilterBar: (options: RenderFiltersInBarOptions) => {
          const changeHandler = (value: string) => options.setRowHeight(value);
          return (
            <>
              <SearchForm placeholder={SEARCH} queryParam={queryParam} />
              <RowHeightFilter changeHandler={changeHandler} />
            </>
          );
        },
        useDrillDown: false,
      };
    };
    return (
      <div>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <HeaderBreadCrumb {...breadcrumbProps} />
        <h2 className="mb-3 mt-5 page-title">{pageTitle}</h2>
        <hr />
        <h3 className="mb-3 mt-5 page-title">{REACTIVE}</h3>
        <div>
          <DrillDownTablev7
            {...createTableProps(caseTriggeredColumns, caseTriggeredPlans, REACTIVE_QUERY_PARAM)}
          />
        </div>
        <div className="routine-heading">
          <Row className="mb-2">
            <Col xs="6">
              <h3 className="mb-3 mt-5 page-title">{ROUTINE_TITLE}</h3>
            </Col>
            <Col xs="6">
              <LinkAsButton text={ADD_FOCUS_INVESTIGATION} />
            </Col>
          </Row>
        </div>
        <div>
          <DrillDownTablev7
            {...createTableProps(RoutineColumns, routinePlans, ROUTINE_QUERY_PARAM)}
          />
        </div>
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

  const reactiveSearchString = getQueryParams(ownProps.location)[REACTIVE_QUERY_PARAM] as string;
  const routineSearchString = getQueryParams(ownProps.location)[ROUTINE_QUERY_PARAM] as string;
  const caseTriggeredPlans = makePlansArraySelector()(state, {
    interventionType: InterventionType.FI,
    parentJurisdictionId: jurisdictionParentId,
    reason: CASE_TRIGGERED,
    statusList: [PlanStatus.ACTIVE, PlanStatus.COMPLETE],
    title: reactiveSearchString,
  });
  const routinePlans = makePlansArraySelector()(state, {
    interventionType: InterventionType.FI,
    parentJurisdictionId: jurisdictionParentId,
    reason: ROUTINE,
    statusList: [PlanStatus.ACTIVE, PlanStatus.COMPLETE],
    title: routineSearchString,
  });

  return {
    caseTriggeredPlans,
    plan,
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
