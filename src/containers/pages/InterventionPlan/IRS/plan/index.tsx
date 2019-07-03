// this is the IRS Plan page component
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';

import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';

import { getPlanById, Plan } from '../../../../../store/ducks/plans';

import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

export interface IrsPlanProps {
  planId: string | null;
  plan: Plan | null;
  isNewPlan: boolean;
  isDraftPlan: boolean;
  isFinalizedPlan: boolean;
}

export const defaultIrsPlanProps: IrsPlanProps = {
  isDraftPlan: false,
  isFinalizedPlan: false,
  isNewPlan: false,
  plan: null,
  planId: null,
};

class IrsPlan extends React.Component<RouteComponentProps<RouteParams> & IrsPlanProps, {}> {
  constructor(props: RouteComponentProps<RouteParams> & IrsPlanProps) {
    super(props);
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
  const props = {
    isNewPlan: planId === null,
    planId,
    ...ownProps,
  };
  if (planId) {
    props.plan = getPlanById(state, planId);
  }
  return props;
};

const ConnectedIrsPlan = connect(mapStateToProps)(IrsPlan);

export default ConnectedIrsPlan;
