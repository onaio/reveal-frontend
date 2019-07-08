// this is the IRS Plan page component
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';

import { SUPERSET_PLANS_SLICE } from '../../../../../configs/env';
import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';

import supersetFetch from '../../../../../services/superset';

import plansReducer, {
  fetchPlans,
  getPlanById,
  Plan,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

export interface IrsPlanProps {
  fetchPlansActionCreator: typeof fetchPlans;
  isDraftPlan?: boolean;
  isFinalizedPlan?: boolean;
  isNewPlan?: boolean;
  planById?: Plan | null;
  planId: string | null;
  supersetService: typeof supersetFetch;
}

export const defaultIrsPlanProps: IrsPlanProps = {
  fetchPlansActionCreator: fetchPlans,
  isDraftPlan: false,
  isFinalizedPlan: false,
  isNewPlan: false,
  planById: null,
  planId: null,
  supersetService: supersetFetch,
};

class IrsPlan extends React.Component<RouteComponentProps<RouteParams> & IrsPlanProps, {}> {
  public static defaultProps = defaultIrsPlanProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlanProps) {
    super(props);
  }

  public componentDidMount() {
    const { supersetService, fetchPlansActionCreator } = this.props;
    supersetService(SUPERSET_PLANS_SLICE).then((result: Plan[]) => fetchPlansActionCreator(result));
  }

  public render() {
    const homePage = {
      label: HOME,
      url: HOME_URL,
    };
    const basePage = {
      label: 'IRS',
      url: INTERVENTION_IRS_URL,
    };
    const breadCrumbProps: BreadCrumbProps = {
      currentPage: {
        label: 'New Plan',
        url: `${INTERVENTION_IRS_URL}/new`,
      },
      pages: [homePage, basePage],
    };

    return (
      <div className="mb-5">
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">IRS: New Plan</h2>
      </div>
    );
  }
}

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  planId: string | null;
}

export { IrsPlan };

const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planId = ownProps.match.params.id || null;
  const isNewPlan = planId === null;
  const plan = getPlanById(state, planId);
  const isDraftPlan = plan && plan.plan_status !== 'active';
  const isFinalizedPlan = plan && plan.plan_status === 'active';
  const props = {
    isDraftPlan,
    isFinalizedPlan,
    isNewPlan,
    planById: plan,
    planId,
    ...ownProps,
  };
  return props;
};

const mapDispatchToProps = {
  fetchPlansActionCreator: fetchPlans,
};

const ConnectedIrsPlan = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlan);

export default ConnectedIrsPlan;
