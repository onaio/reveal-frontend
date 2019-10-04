// this is the IRS LIST view page component
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { CellInfo, Column } from 'react-table';
import { Button } from 'reactstrap';
import { Store } from 'redux';

import DrillDownTable from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';

import {
  CREATE_NEW_PLAN,
  DRAFT,
  DRAFTS_PARENTHESIS,
  HOME,
  HOME_URL,
  INTERVENTION_IRS_DRAFTS_URL,
  INTERVENTION_IRS_URL,
  IRS_PLAN_TYPE,
  NEW,
  PLAN,
  REPORT,
} from '../../../../constants';

import { RouteParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import plansReducer, {
  extractPlanRecordResponseFromPlanPayload,
  fetchPlanRecords,
  fetchPlans,
  getPlanRecordsArray,
  getPlansArray,
  getPlansById,
  InterventionType,
  Plan,
  PlanPayload,
  PlanRecord,
  PlanRecordResponse,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';

import { Helmet } from 'react-helmet';
import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import { useContextCodes } from '../../../../configs/settings';
import { IRS_PLANS, IRS_TITLE } from '../../../../constants';
import supersetFetch from '../../../../services/superset';
import './../../../../styles/css/drill-down-table.css';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** initialize OpenSRP API services */
const OpenSrpPlanService = new OpenSRPService('plans');

/** IrsPlansProps - interface for IRS Plans page */
export interface IrsPlansProps {
  fetchPlanRecordsActionCreator: typeof fetchPlanRecords;
  fetchPlansActionCreator: typeof fetchPlans;
  isReporting: boolean;
  pageTitle: string;
  plansArray: PlanRecord[];
}

/** defaultIrsPlansProps - default props for IRS Plans page */
export const defaultIrsPlansProps: IrsPlansProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
  fetchPlansActionCreator: fetchPlans,
  isReporting: false,
  pageTitle: '',
  plansArray: [],
};

/** IrsPlans - component for IRS Plans page */
class IrsPlans extends React.Component<IrsPlansProps & RouteComponentProps<RouteParams>, {}> {
  public static defaultProps: IrsPlansProps = defaultIrsPlansProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlansProps) {
    super(props);
  }

  public async componentDidMount() {
    const { isReporting, fetchPlanRecordsActionCreator, fetchPlansActionCreator } = this.props;

    /** define superset filter params for jurisdictions */
    const plansParams = superset.getFormData(3000, [
      { comparator: 'IRS', operator: '==', subject: 'plan_intervention_type' },
    ]);
    if (isReporting) {
      // use superset enpoint in reporting
      const plansArray = await supersetFetch(SUPERSET_IRS_REPORTING_PLANS_SLICE, plansParams).then(
        (plans: Plan[]) => plans
      );
      fetchPlansActionCreator(plansArray);
    } else {
      // Use openSRP endpoint in planning
      OpenSrpPlanService.list()
        .then(plans => {
          // filter for IRS plans
          const irsPlans = plans.filter((p: PlanPayload) => {
            for (const u of p.useContext) {
              if (u.code === useContextCodes[0]) {
                if (u.valueCodableConcept === IRS_PLAN_TYPE) {
                  return true;
                } else {
                  return false;
                }
              }
            }
            return false;
          });
          const irsPlanRecords: PlanRecordResponse[] = irsPlans.map(
            extractPlanRecordResponseFromPlanPayload
          );
          return fetchPlanRecordsActionCreator(irsPlanRecords);
        })
        .catch(err => {
          // console.log('ERR', err)
        });
    }
  }

  public render() {
    const { isReporting, pageTitle } = this.props;
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: pageTitle,
        url: INTERVENTION_IRS_URL,
      },
      pages: [homePage],
    };

    const { plansArray } = this.props;
    if (plansArray.length === 0) {
      return <Loading />;
    }

    const columns: Column[] = [
      {
        Header: 'Name',
        columns: [
          {
            Cell: (cell: CellInfo) => {
              const path = isReporting
                ? REPORT
                : cell.original.plan_status === DRAFT
                ? DRAFT
                : PLAN;
              return (
                <div>
                  <Link
                    to={`${INTERVENTION_IRS_URL}/${path}/${cell.original.id ||
                      cell.original.plan_id}`}
                  >
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
        Header: 'Date Created',
        columns: [
          {
            Header: '',
            accessor: 'plan_date',
          },
        ],
      },
      {
        Header: 'Status',
        columns: [
          {
            Header: '',
            accessor: 'plan_status',
          },
        ],
      },
    ];

    /** tableProps - props for DrillDownTable component */
    const tableProps = {
      CellComponent: DrillDownTableLinkedCell,
      columns,
      data: [...plansArray],
      identifierField: 'id',
      linkerField: 'id',
      minRows: 0,
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
  }
}

export { IrsPlans };

interface DispatchedStateProps {
  plansArray: PlanRecord[];
}

const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const isDraftsList = ownProps.path === INTERVENTION_IRS_DRAFTS_URL;
  const planStatus = isDraftsList ? [PlanStatus.DRAFT] : [PlanStatus.ACTIVE];
  const pageTitle = `${IRS_PLANS}${isDraftsList ? ` ${DRAFTS_PARENTHESIS}` : ''}`;
  const plansRecordsArray = getPlanRecordsArray(state, InterventionType.IRS, planStatus);
  const plansArray = getPlansArray(state, InterventionType.IRS, planStatus);

  const props = {
    isReporting: !isDraftsList,
    pageTitle,
    plansArray: plansRecordsArray.length ? plansRecordsArray : plansArray,
    ...ownProps,
  };
  return props;
};

const mapDispatchToProps = {
  fetchPlanRecordsActionCreator: fetchPlanRecords,
  fetchPlansActionCreator: fetchPlans,
};

const ConnectedIrsPlans = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlans);

export default ConnectedIrsPlans;
