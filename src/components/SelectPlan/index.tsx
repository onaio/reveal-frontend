import * as React from 'react';
import Select from 'react-select';

class SelectPlan extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return <Select placeholder="Other area Investigations" />;
  }
}

export default SelectPlan;
