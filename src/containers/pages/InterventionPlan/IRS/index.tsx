// this is the IRS LIST view page component
import * as React from 'react';

import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../constants';

import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

class IrsPlans extends React.Component<{}, {}> {
  constructor(props: {}) {
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

export default IrsPlans;
