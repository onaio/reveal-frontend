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

import { HOME, HOME_URL, INTERVENTION_IRS_URL, IRS_PLAN_TYPE } from '../../../../constants';

import { RouteParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import plansReducer, {
  extractPlanRecordResponseFromPlanPayload,
  fetchPlanRecords,
  getPlanRecordsArray,
  InterventionType,
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
import { useContextCodes } from '../../../../configs/settings';
import { IRS_PLANS, IRS_TITLE } from '../../../../constants';
import './../../../../styles/css/drill-down-table.css';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** initialize OpenSRP API services */
const OpenSrpPlanService = new OpenSRPService('plans');

/** IrsPlansProps - interface for IRS Plans page */
export interface IrsPlansProps {
  fetchPlansActionCreator: typeof fetchPlanRecords;
  plansArray: PlanRecord[];
}

/** defaultIrsPlansProps - default props for IRS Plans page */
export const defaultIrsPlansProps: IrsPlansProps = {
  fetchPlansActionCreator: fetchPlanRecords,
  plansArray: [],
};

/** IrsPlans - component for IRS Plans page */
class IrsPlans extends React.Component<IrsPlansProps & RouteComponentProps<RouteParams>, {}> {
  public static defaultProps: IrsPlansProps = defaultIrsPlansProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlansProps) {
    super(props);
  }

  public componentDidMount() {
    const { fetchPlansActionCreator } = this.props;

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

        return fetchPlansActionCreator(irsPlanRecords);
      })
      .catch(err => {
        // console.log('ERR', err)
      });
  }

  public render() {
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: 'IRS',
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
              const path = cell.original.plan_status === 'draft' ? 'draft' : 'plan';
              return (
                <div>
                  <Link to={`${INTERVENTION_IRS_URL}/${path}/${cell.original.id}`}>
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
          <title>{IRS_TITLE}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">{IRS_PLANS}</h2>
        <DrillDownTable {...tableProps} />
        <br />
        <Button color="primary" tag={Link} to={`${INTERVENTION_IRS_URL}/new`}>
          Create new plan
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
  const props = {
    plansArray: getPlanRecordsArray(state, InterventionType.IRS, [
      PlanStatus.ACTIVE,
      PlanStatus.DRAFT,
    ]),
    ...ownProps,
  };
  return props;
};

const mapDispatchToProps = { fetchPlansActionCreator: fetchPlanRecords };

const ConnectedIrsPlans = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlans);

export default ConnectedIrsPlans;
