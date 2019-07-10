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

import { SUPERSET_PLANS_TABLE_SLICE } from '../../../../configs/env';
import { HOME, HOME_URL, INTERVENTION_IRS_URL, IRS_PLAN_TYPE } from '../../../../constants';

import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlanRecords,
  getPlanRecordsArray,
  InterventionType,
  PlanRecord,
  PlanRecordResponse,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';

import DrillDownTableLinkedCell from '../../../../components/DrillDownTableLinkedCell';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

/** IrsPlansProps - interface for IRS Plans page */
export interface IrsPlansProps {
  fetchPlansActionCreator: typeof fetchPlanRecords;
  plansArray: PlanRecord[];
  supersetService: typeof supersetFetch;
}

/** defaultIrsPlansProps - default props for IRS Plans page */
export const defaultIrsPlansProps: IrsPlansProps = {
  fetchPlansActionCreator: fetchPlanRecords,
  plansArray: [],
  supersetService: supersetFetch,
};

/** IrsPlans - component for IRS Plans page */
class IrsPlans extends React.Component<IrsPlansProps & RouteComponentProps<RouteParams>, {}> {
  public static defaultProps: IrsPlansProps = defaultIrsPlansProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlansProps) {
    super(props);
  }

  public componentDidMount() {
    const { fetchPlansActionCreator, supersetService } = this.props;
    const supersetParams = superset.getFormData(1000, [
      { comparator: IRS_PLAN_TYPE, operator: '==', subject: 'intervention_type' },
    ]);
    supersetService(SUPERSET_PLANS_TABLE_SLICE, supersetParams).then(
      (result: PlanRecordResponse[]) => fetchPlansActionCreator(result)
    );
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
              return (
                <div>
                  <Link to={`${INTERVENTION_IRS_URL}/plan/${cell.original.id}`}>{cell.value}</Link>
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
      showPagination: false,
      useDrillDownTrProps: false,
    };

    return (
      <div className="mb-5">
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">IRS Plans</h2>
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
    plansArray: getPlanRecordsArray(state, InterventionType.IRS),
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
