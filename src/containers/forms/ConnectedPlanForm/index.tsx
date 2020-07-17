import React from 'react';
import { connect } from 'react-redux';
import PlanForm, {
  defaultProps as defaultPlanFormProps,
  PlanFormProps,
} from '../../../components/forms/PlanForm';
import { PlanDefinition } from '../../../configs/settings';
import { addPlanDefinition } from '../../../store/ducks/opensrp/PlanDefinition';

type Modify<T, R> = Omit<T, keyof R> & R;

/** Interface for ConnectedPlan props */
export type ConnectedPlanFormProps = Modify<
  PlanFormProps,
  {
    addPlan: typeof addPlanDefinition;
  }
>;

/** Interface for method addPlanOnFormSuccess */
export type AddPlanOnFormSuccess = (payload: PlanDefinition) => void;

/** ConnectedPlanForm container */
const ConnectedPlanForm = (props: ConnectedPlanFormProps) => {
  const { addPlan } = props;

  const addPlanOnFormSuccess: AddPlanOnFormSuccess = (payload: PlanDefinition) => {
    addPlan(payload);
  };

  return <PlanForm {...props} addPlan={addPlanOnFormSuccess} />;
};

export const defaultProps: ConnectedPlanFormProps = {
  addPlan: addPlanDefinition,
  ...defaultPlanFormProps,
} as ConnectedPlanFormProps;

ConnectedPlanForm.defaultProps = defaultProps;

/** map dispatch to props */
const mapDispatchToProps = { addPlan: addPlanDefinition };

export default connect(null, mapDispatchToProps)(ConnectedPlanForm);
