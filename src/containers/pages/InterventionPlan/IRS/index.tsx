// this is the IRS LIST view page component
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import { Button } from 'reactstrap';
import { ActionCreator, Store } from 'redux';

import { DrillDownColumn, DrillDownTable, DrillDownTableProps } from '@onaio/drill-down-table-v7';
import { Helmet } from 'react-helmet';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import {
  CREATE_NEW_PLAN,
  DATE_CREATED,
  DRAFTS_PARENTHESIS,
  HOME,
  IRS_PLANS,
  IRS_TITLE,
  NAME,
  STATUS_HEADER,
} from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import {
  DRAFT_IRS_PLAN_URL,
  HOME_URL,
  INTERVENTION_IRS_DRAFTS_URL,
  INTERVENTION_IRS_URL,
  NEW,
  OPENSRP_PLANS,
  PLAN_RECORD_BY_ID,
  QUERY_PARAM_TITLE,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import {
  extractPlanRecordResponseFromPlanPayload,
  getQueryParams,
  RouteParams,
} from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import plansReducer, {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  InterventionType,
  makePlansArraySelector,
  PlanPayload,
  PlanRecord,
  PlanRecordResponse,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';
import './../../../../styles/css/drill-down-table.css';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** initialize OpenSRP API services */

/** IrsPlansProps - interface for IRS Plans page */
export interface IrsPlansProps {
  fetchPlanRecordsActionCreator: typeof fetchPlanRecords;
  service: typeof OpenSRPService;
  plansArray: PlanRecord[];
}

/** defaultIrsPlansProps - default props for IRS Plans page */
export const defaultIrsPlansProps: IrsPlansProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
  plansArray: [],
  service: OpenSRPService,
};

/** Columns definition for IRS drafts page table */
const columns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Cell: (cell: Cell<PlanRecord>) => {
      const original = cell.row.original;
      return (
        <div>
          <Link to={`${DRAFT_IRS_PLAN_URL}/${original.id || original.plan_id}`}>{cell.value}</Link>
        </div>
      );
    },
    Header: NAME,
    accessor: 'plan_title',
    minWidth: 200,
  },
  {
    Header: DATE_CREATED,
    accessor: 'plan_date',
  },
  {
    Header: STATUS_HEADER,
    accessor: (d: PlanRecord) => planStatusDisplay[d.plan_status] || d.plan_status,
    id: 'plan_status',
  },
];

/** fetch plans payload form the opensrp api
 * @param {OpenSRPService} service - openSRPService
 * @param {ActionCreator<FetchPlanRecordsAction>} actionCreator - action creator for fetchPlanRecords
 * @param {Dispatch<SetStateAction<boolean>>} - setState function
 */
const loadOpenSRPPlans = (
  service: typeof OpenSRPService,
  actionCreator: ActionCreator<FetchPlanRecordsAction>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const OpenSrpPlanService = new service(OPENSRP_PLANS);
  OpenSrpPlanService.list()
    .then((plans: PlanPayload[]) => {
      const extractedPlanRecords = plans
        .map(plan => extractPlanRecordResponseFromPlanPayload(plan))
        .filter(plan => !!plan);
      actionCreator(extractedPlanRecords as PlanRecordResponse[]);
      setLoading(false);
    })
    .catch(err => {
      setLoading(false);
      displayError(err);
    });
};

/** IrsPlans presentation component */
export const IrsPlans = (props: IrsPlansProps & RouteComponentProps<RouteParams>) => {
  const [loading, setLoading] = React.useState<boolean>(props.plansArray.length === 0);
  React.useEffect(() => {
    loadOpenSRPPlans(props.service, props.fetchPlanRecordsActionCreator, setLoading);
  }, []);

  const pageTitle = `${IRS_PLANS}${DRAFTS_PARENTHESIS}`;
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: pageTitle,
      url: INTERVENTION_IRS_DRAFTS_URL,
    },
    pages: [homePage],
  };

  const { plansArray } = props;

  /** tableProps - props for DrillDownTable component */
  const tableProps: Pick<
    DrillDownTableProps<PlanRecord>,
    | 'columns'
    | 'data'
    | 'loading'
    | 'loadingComponent'
    | 'renderInBottomFilterBar'
    | 'renderInTopFilterBar'
    | 'useDrillDown'
  > = {
    columns,
    data: plansArray,
    loading,
    loadingComponent: Loading,
    renderInBottomFilterBar: renderInFilterFactory({
      history: props.history,
      location: props.location,
      showColumnHider: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      history: props.history,
      location: props.location,
      ...defaultOptions,
    }),
    useDrillDown: false,
  };

  return (
    <div className="mb-5">
      <Helmet>
        <title>{pageTitle.length ? pageTitle : IRS_TITLE}</title>
      </Helmet>
      <HeaderBreadcrumbs {...breadCrumbProps} />
      <h2 className="page-title">{pageTitle}</h2>
      <DrillDownTable {...tableProps} />
      <br />
      <Button
        className="create-plan"
        color="primary"
        tag={Link}
        to={`${INTERVENTION_IRS_URL}/${NEW}`}
      >
        {CREATE_NEW_PLAN}
      </Button>
    </div>
  );
};

IrsPlans.defaultProps = defaultIrsPlansProps;

/** describes props returned by mapStateToProps */
type DispatchedStateProps = Pick<IrsPlansProps, 'plansArray'>;
/** describe mapDispatchToProps object */
type MapDispatchToProps = Pick<IrsPlansProps, 'fetchPlanRecordsActionCreator'>;

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps
): DispatchedStateProps => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const planStatus = [PlanStatus.DRAFT];
  const plansRecordsArray = plansArraySelector(state as Registry, {
    interventionType: InterventionType.IRS,
    statusList: planStatus,
    title,
  });
  const props = {
    plansArray: plansRecordsArray,
  };
  return props;
};

const mapDispatchToProps: MapDispatchToProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
};

const ConnectedIrsPlans = connect(mapStateToProps, mapDispatchToProps)(IrsPlans);

export default ConnectedIrsPlans;
