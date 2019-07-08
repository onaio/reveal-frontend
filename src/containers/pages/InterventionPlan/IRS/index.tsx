// this is the IRS LIST view page component
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';

import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../constants';

import { RouteParams } from '../../../../helpers/utils';
import { getPlansArray, getPlansIdArray, Plan } from '../../../../store/ducks/plans';

import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

export interface IrsPlansProps {
  plansArray: Plan[];
  plansIdArray: string[];
}

export const defaultIrsPlansProps: IrsPlansProps = {
  plansArray: [],
  plansIdArray: [],
};

class IrsPlans extends React.Component<RouteComponentProps<RouteParams> & IrsPlansProps, {}> {
  constructor(props: RouteComponentProps<RouteParams> & IrsPlansProps) {
    super(props);
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
  plansIdArray: string[];
}

const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const props = {
    plansArray: [],
    plansIdArray: [],
    ...ownProps,
  };

  if (false) {
    // todo - get plans from store
    props.plansArray = getPlansArray(state);
    props.plansIdArray = getPlansIdArray(state);
  }

  return props;
};

const ConnectedIrsPlans = connect(mapStateToProps)(IrsPlans);

export default ConnectedIrsPlans;
