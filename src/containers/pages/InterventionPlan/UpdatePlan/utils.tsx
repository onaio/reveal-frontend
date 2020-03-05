import { FAILED_TO_GET_EVENT_ID } from '../../../../configs/lang';
import { PlanDefinition, UseContext } from '../../../../configs/settings';
import { displayError } from '../../../../helpers/errors';

export const getEventId = (aPlan: PlanDefinition | null): string | null => {
  if (!aPlan) {
    return null;
  }
  const contextOfInterest = aPlan.useContext.filter((context: UseContext) => {
    return context.code === 'opensrpEventId';
  });

  if (contextOfInterest.length !== 1) {
    displayError(new Error(FAILED_TO_GET_EVENT_ID));
    return null;
  }
  return contextOfInterest[0].valueCodableConcept;
};

export const planIsReactive = (aPlan: PlanDefinition | null): boolean => {
  if (aPlan === null) {
    return false;
  }
  const contexts = aPlan.useContext;
  for (const context of contexts) {
    if (context.code === 'fiReason' && context.valueCodableConcept === 'Case Triggered') {
      return true;
    }
  }

  return false;
};
