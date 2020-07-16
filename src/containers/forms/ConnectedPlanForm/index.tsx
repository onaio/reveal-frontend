import React from 'react';
import { connect } from 'react-redux';
import PlanForm, {
  defaultProps as defaultPlanFormProps,
  PlanFormProps,
} from '../../../components/forms/PlanForm';
import { PlanDefinition } from '../../../configs/settings';
import { addPlanDefinition } from '../../../store/ducks/opensrp/PlanDefinition';

/** interface for ConnectedPlanForm props */
export interface ConnectedPlanFormProps extends PlanFormProps {
  addPlan: typeof addPlanDefinition;
}

/** Interface for method addPlanOnFormSuccess */
export type AddPlanOnFormSuccess = (payload: PlanDefinition) => void;

/** ConnectedPlanForm container */
const ConnectedPlanForm = (props: ConnectedPlanFormProps) => {
  const { addPlan } = props;

  const addPlanOnFormSuccess: AddPlanOnFormSuccess = (payload: PlanDefinition) => {
    addPlan(payload);
  };

  return <PlanForm {...props} addPlanOnFormSuccess={addPlanOnFormSuccess} />;
};

export const defaultProps: ConnectedPlanFormProps = {
  addPlan: addPlanDefinition,
  ...defaultPlanFormProps,
};

ConnectedPlanForm.defaultProps = defaultProps;

/** map dispatch to props */
const mapDispatchToProps = { addPlan: addPlanDefinition };

export default connect(null, mapDispatchToProps)(ConnectedPlanForm);
