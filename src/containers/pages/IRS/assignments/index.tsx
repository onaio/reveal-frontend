import { DrillDownColumn, DrillDownTable, DrillDownTableProps } from '@onaio/drill-down-table';
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils/';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Cell } from 'react-table';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import {
  ASSIGN_PLANS,
  END_DATE,
  HOME,
  INTERVENTION,
  PLAN_STATUS,
  START_DATE,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import {
  ASSIGN_PLAN_URL,
  HOME_URL,
  OPENSRP_PLANS,
  PLAN_RECORD_BY_ID,
  QUERY_PARAM_TITLE,
  REPORT_IRS_PLAN_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import {
  extractPlanRecordResponseFromPlanPayload,
  getQueryParams,
} from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import IRSPlansReducer, {
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';
import {
  fetchPlanRecords,
  makePlansArraySelector,
  PlanRecord,
  PlanRecordResponse,
  PlanStatus,
} from '../../../../store/ducks/plans';

/** register the plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

/** Plans filter selector */
const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID, 'plan_date');

/** interface for PlanAssignmentsListProps props */
interface PlanAssignmentsListProps {
  fetchPlans: typeof fetchPlanRecords;
  plans: PlanRecord[];
  serviceClass: typeof OpenSRPService;
}

export type PlanAssignmentWithRouteProps = PlanAssignmentsListProps & RouteComponentProps;

/** Simple component that loads plans and allows you to manage plan-jurisdiciton-organization assignments */
const IRSAssignmentPlansList = (props: PlanAssignmentWithRouteProps) => {
  const { fetchPlans, plans } = props;
  const [loading, setLoading] = useState<boolean>(plans.length < 1);

  const pageTitle: string = `${ASSIGN_PLANS}`;

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: REPORT_IRS_PLAN_URL,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  /** async function to load the data */
  async function loadData() {
    const OpenSrpPlanService = new props.serviceClass(OPENSRP_PLANS);

    try {
      setLoading(plans.length < 1); // only set loading when there are no plans
      await OpenSrpPlanService.list()
        .then(planResults => {
          if (planResults) {
            const planRecords: PlanRecordResponse[] =
              planResults.map(extractPlanRecordResponseFromPlanPayload) || [];
            return fetchPlans(planRecords);
          }
        })
        .catch(err => {
          displayError(err);
        });
      setLoading(false);
    } catch (e) {
      displayError(e);
    }
  }

  useEffect(() => {
    loadData().catch(error => displayError(error));
  }, []);

  const tableColumns: Array<DrillDownColumn<PlanRecord>> = [
    {
      Cell: (cell: Cell<PlanRecord>) => {
        const original = cell.row.original as Dictionary;
        return (
          <Link to={`${ASSIGN_PLAN_URL}/${original.plan_id}`} key={original.plan_id}>
            {cell.value}
          </Link>
        );
      },
      Header: TITLE,
      accessor: 'plan_title',
    },
    {
      Header: INTERVENTION,
      accessor: 'plan_intervention_type',
      maxWidth: 30,
      minWidth: 10,
    },
    {
      Header: START_DATE,
      accessor: 'plan_effective_period_start',
      maxWidth: 30,
      minWidth: 10,
    },
    {
      Header: END_DATE,
      accessor: 'plan_effective_period_end',
      maxWidth: 30,
      minWidth: 10,
    },
    {
      Cell: (cell: Cell<PlanRecord>) => {
        return planStatusDisplay[cell.value] || null;
      },
      Header: PLAN_STATUS,
      accessor: 'plan_status',
      maxWidth: 30,
      minWidth: 10,
    },
  ];

  const tableProps: Pick<
    DrillDownTableProps<PlanRecord>,
    | 'columns'
    | 'data'
    | 'loading'
    | 'loadingComponent'
    | 'renderInBottomFilterBar'
    | 'renderInTopFilterBar'
    | 'useDrillDown'
    | 'renderNullDataComponent'
  > = {
    columns: tableColumns,
    data: plans,
    loading,
    loadingComponent: Loading,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      componentProps: props,
      queryParam: QUERY_PARAM_TITLE,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
    useDrillDown: false,
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{pageTitle}</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <DrillDownTable {...tableProps} />
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for IRSAssignmentPlansList */
const defaultProps: PlanAssignmentsListProps = {
  fetchPlans: fetchPlanRecords,
  plans: [],
  serviceClass: OpenSRPService,
};

IRSAssignmentPlansList.defaultProps = defaultProps;

export { IRSAssignmentPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plans: PlanRecord[];
}

/** map state to props */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: PlanAssignmentWithRouteProps
): DispatchedStateProps => {
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const activePlans = plansArraySelector(state as Registry, {
    statusList: [PlanStatus.ACTIVE],
    title,
  });
  const plans = activePlans.sort(
    (a: PlanRecord, b: PlanRecord) => Date.parse(b.plan_date) - Date.parse(a.plan_date)
  );
  return {
    plans,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchPlanRecords };

/** Connected ConnectedIRSAssignmentPlansList component */
const ConnectedIRSAssignmentPlansList = connect(
  mapStateToProps,
  mapDispatchToProps
)(IRSAssignmentPlansList);

export default ConnectedIRSAssignmentPlansList;
