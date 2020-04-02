// this is the IRS LIST view page component
import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry, { Registry } from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import { Button } from 'reactstrap';
import { ActionCreator, Store } from 'redux';

import { Helmet } from 'react-helmet';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  CREATE_NEW_PLAN,
  DATE_CREATED,
  DRAFTS_PARENTHESIS,
  HOME,
  IRS_PLANS,
  IRS_TITLE,
  NAME,
  NEXT,
  PREVIOUS,
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
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { extractPlanRecordResponseFromPlanPayload, RouteParams } from '../../../../helpers/utils';
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
const columns: Column[] = [
  {
    Header: NAME,
    columns: [
      {
        Cell: (cell: CellInfo) => {
          return (
            <div>
              <Link to={`${DRAFT_IRS_PLAN_URL}/${cell.original.id || cell.original.plan_id}`}>
                {cell.value}
              </Link>
            </div>
          );
        },
        Header: '',
        accessor: 'plan_title',
        minWidth: 200,
      },
    ],
  },
  {
    Header: DATE_CREATED,
    columns: [
      {
        Header: '',
        accessor: 'plan_date',
      },
    ],
  },
  {
    Header: STATUS_HEADER,
    columns: [
      {
        Header: '',
        accessor: (d: PlanRecord) => planStatusDisplay[d.plan_status] || d.plan_status,
        id: 'plan_status',
      },
    ],
  },
];

/** fetch plans payload form the opensrp api
 * @param {OpenSRPService} service - openSRPService
 * @param {ActionCreator<FetchPlanRecordsAction>} actionCreator - action creator for fetchPlanRecords
 */
const loadOpenSRPPlans = (
  service: typeof OpenSRPService,
  actionCreator: ActionCreator<FetchPlanRecordsAction>
) => {
  const OpenSrpPlanService = new service(OPENSRP_PLANS);
  OpenSrpPlanService.list()
    .then((plans: PlanPayload[]) => {
      const extractedPlanRecords = plans
        .map(plan => extractPlanRecordResponseFromPlanPayload(plan))
        .filter(plan => !!plan);
      actionCreator(extractedPlanRecords as PlanRecordResponse[]);
    })
    .catch(err => displayError(err));
};

/** IrsPlans presentation component */
export const IrsPlans = (props: IrsPlansProps & RouteComponentProps<RouteParams>) => {
  React.useEffect(() => {
    loadOpenSRPPlans(props.service, props.fetchPlanRecordsActionCreator);
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
  if (plansArray.length === 0) {
    return <Loading />;
  }

  /** tableProps - props for DrillDownTable component */
  const tableProps = {
    CellComponent: DrillDownTableLinkedCell,
    columns,
    data: [...plansArray],
    identifierField: 'id',
    linkerField: 'id',
    minRows: 0,
    nextText: NEXT,
    previousText: PREVIOUS,
    rootParentId: null,
    showPageSizeOptions: false,
    showPagination: plansArray.length > 20,
    useDrillDownTrProps: false,
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
      <Button color="primary" tag={Link} to={`${INTERVENTION_IRS_URL}/${NEW}`}>
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

const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);
  const planStatus = [PlanStatus.DRAFT];
  const plansRecordsArray = plansArraySelector(state as Registry, {
    interventionType: InterventionType.IRS,
    statusList: planStatus,
  });
  const props = {
    plansArray: plansRecordsArray,
  };
  return props;
};

const mapDispatchToProps: MapDispatchToProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
};

const ConnectedIrsPlans = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlans);

export default ConnectedIrsPlans;
