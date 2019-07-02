// this is the IRS DRAFT view page component
import * as React from 'react';

class IrsDraftPlan extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return (
      <div>
        <h2 className="page-title">IRS: Draft Plan</h2>
      </div>
    );
  }
}

export default IrsDraftPlan;
