import { Dictionary } from '@onaio/utils/dist/types/types';
import {
  COMPLETE_PLAN_MESSAGE,
  FAILED_TO_GET_EVENT_ID,
  PLAN_CHANGES_HAVE_NOT_BEEN_SAVED,
} from '../../../../configs/lang';
import { PlanDefinition, UseContext } from '../../../../configs/settings';
import { displayError } from '../../../../helpers/errors';
import { infoGrowl } from '../../../../helpers/utils';
import { PlanStatus } from '../../../../store/ducks/plans';

/** util function to get the event id for case triggered plans
 * @params {PlanDefinition | null} aPlan - the plan to get the eventId from
 * @returns {string| null} The event id if present, null otherwise
 */
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

/** Util function to check if a plan was case Triggered or is just routine
 * @params {PlanDefinition} aPlan - the plan under inspection
 * @returns {boolean} - if the plan is reactive
 */
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

/** factory function for planform's beforeSubmit callback
 * @param originalPlan - plan before modifications
 * @returns {BeforeSubmit} callback function
 */
export const beforeSubmitFactory = (originalPlan: PlanDefinition) => (payload: PlanDefinition) => {
  const planStatusChanged = originalPlan.status !== payload.status;
  const interestingStatusChange =
    planStatusChanged && [PlanStatus.COMPLETE].includes(payload.status as PlanStatus);
  const messageLookup: Dictionary<string> = {
    [PlanStatus.COMPLETE]: COMPLETE_PLAN_MESSAGE,
  };

  if (interestingStatusChange) {
    const res = window.confirm(messageLookup[payload.status]);
    if (!res) {
      infoGrowl(PLAN_CHANGES_HAVE_NOT_BEEN_SAVED);
    }
    return res;
  }
  return true;
};
