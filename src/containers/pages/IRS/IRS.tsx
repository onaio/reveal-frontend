// this is the IRS page component
import * as React from 'react';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

class IRS extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return (
      <div>
        <HeaderBreadcrumb />
        <div>IRS</div>
      </div>
    );
  }
}

export default IRS;
