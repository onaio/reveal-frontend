// this is the IRS page component
import * as React from 'react';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

class IRS extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    const breadcrumbProps = {
      currentPage: {
        label: 'IRS',
        url: '/irs',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    };
    return (
      <div>
        <HeaderBreadcrumb {...breadcrumbProps} />
        <div>IRS</div>
      </div>
    );
  }
}

export default IRS;
