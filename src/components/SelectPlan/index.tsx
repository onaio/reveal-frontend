import * as React from 'react';
import Select from 'react-select';
import { Plan } from '../../store/ducks/plans';

export interface SelectPlanProps {
  plansArray: Plan[];
}
class SelectPlan extends React.Component<SelectPlanProps, {}> {
  constructor(props: SelectPlanProps) {
    super(props);
  }
  public render() {
    const { plansArray } = this.props;
    /** Sort plans by plan_date and build value label key value pairs to populate the select */
    let options;
    options = plansArray.sort((a, b) => {
      return a.plan_date === b.plan_date ? 0 : +(a.plan_date < b.plan_date) || -1;
    });
    options = options.map(element => {
      return { value: element.plan_id, label: element.plan_title };
    });
    return <Select defaultOptions={true} options={options} />;
  }
}

export default SelectPlan;
