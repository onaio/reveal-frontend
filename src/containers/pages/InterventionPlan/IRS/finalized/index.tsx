// this is the IRS FINALIZED PLAN view page component
import * as React from 'react';

class IrsFinalizedPlan extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return (
      <div>
        <h2 className="page-title">{`IRS Plan: {plan.id}`}</h2>
      </div>
    );
  }
}

export default IrsFinalizedPlan;
