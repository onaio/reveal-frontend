// this is the IRS NEW view page component
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, HOME_URL, INTERVENTION_IRS_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';

export interface IrsPlanProps {
  id: string | null;
}

export const defaultIrsPlanProps: IrsPlanProps = {
  id: null,
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

export default IrsPlan;
