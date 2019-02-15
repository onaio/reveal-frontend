// this is the FocusInvestigation page component
import * as React from 'react';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

class FocusInvestigation extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return (
      <div>
        <HeaderBreadcrumb />
        <div>Focus Investigation</div>
      </div>
    );
  }
}

export default FocusInvestigation;
