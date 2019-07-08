// this is the IRS LIST view page component
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';

import reducerRegistry from '@onaio/redux-reducer-registry';

import { SUPERSET_PLANS_SLICE } from '../../../../configs/env';
import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../constants';

import { RouteParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import plansReducer, {
  fetchPlans,
  getPlansArray,
  InterventionType,
  Plan,
  reducerName as plansReducerName,
} from '../../../../store/ducks/plans';

import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

export interface IrsPlansProps {
  fetchPlansActionCreator: typeof fetchPlans;
  plansArray: Plan[];
  supersetService: typeof supersetFetch;
}

export const defaultIrsPlansProps: IrsPlansProps = {
  fetchPlansActionCreator: fetchPlans,
  plansArray: [],
  supersetService: supersetFetch,
};

class IrsPlans extends React.Component<IrsPlansProps & RouteComponentProps<RouteParams>, {}> {
  public static defaultProps: IrsPlansProps = defaultIrsPlansProps;
  constructor(props: RouteComponentProps<RouteParams> & IrsPlansProps) {
    super(props);
  }

  public componentDidMount() {
    const { fetchPlansActionCreator, supersetService } = this.props;
    supersetService(SUPERSET_PLANS_SLICE).then((result: Plan[]) => fetchPlansActionCreator(result));
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

    return (
      <div className="mb-5">
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">IRS Plans</h2>
      </div>
    );
  }
}

export { IrsPlans };

interface DispatchedStateProps {
  plansArray: Plan[];
}

const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const props = {
    plansArray: [],
    ...ownProps,
  };

  if (state) {
    props.plansArray = getPlansArray(state, InterventionType.IRS);
  }
  return props;
};

const mapDispatchToProps = { fetchPlansActionCreator: fetchPlans };

const ConnectedIrsPlans = connect(
  mapStateToProps,
  mapDispatchToProps
)(IrsPlans);

export default ConnectedIrsPlans;
