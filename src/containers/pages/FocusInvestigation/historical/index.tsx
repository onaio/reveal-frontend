// this is the FocusInvestigation page component
import * as React from 'react';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';

/** Historical data reporting for Focus Investigation */
class HistoricalFocusInvestigation extends React.Component<{}, {}> {
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

export default HistoricalFocusInvestigation;
