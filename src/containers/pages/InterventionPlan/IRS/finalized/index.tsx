// this is the IRS FINALIZED PLAN view page component
import * as React from 'react';

import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../../constants';

import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

class IrsFinalizedPlan extends React.Component<{}, {}> {
  constructor(props: {}) {
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
        label: 'Plan: {plan.id}',
        url: `${INTERVENTION_IRS_URL}/plan`,
      },
      pages: [homePage, basePage],
    };

    return (
      <div className="mb-5">
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">{`IRS Plan: {plan.id}`}</h2>
      </div>
    );
  }
}

export default IrsFinalizedPlan;
