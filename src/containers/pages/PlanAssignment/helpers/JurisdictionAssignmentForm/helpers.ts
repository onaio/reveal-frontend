import moment from 'moment';
import { OpenSRPJurisdiction } from '../../../../../components/TreeWalker/types';
import { PlanDefinition } from '../../../../../configs/settings';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';

export interface Payload {
  toCreate: Assignment[];
  toUpdate: Assignment[];
}

export const getPayload = (
  selectedOrgs: string[],
  selectedPlan: PlanDefinition,
  selectedJurisdiction: OpenSRPJurisdiction,
  initialOrgs: string[] = []
): Assignment[] => {
  const now = moment(new Date());
  const planStart = moment(selectedPlan.effectivePeriod.start);
  const startDate = planStart > now ? now.format() : planStart.format();
  const endDate = moment(selectedPlan.effectivePeriod.end).format();
  const payload: Assignment[] = [];

  for (const orgId of selectedOrgs) {
    payload.push({
      fromDate: startDate,
      jurisdiction: selectedJurisdiction.id,
      organization: orgId,
      plan: selectedPlan.identifier,
      toDate: endDate,
    });
  }

  for (const retiredOrdId of initialOrgs.filter(orgId => !selectedOrgs.includes(orgId))) {
    payload.push({
      fromDate: startDate,
      jurisdiction: selectedJurisdiction.id,
      organization: retiredOrdId,
      plan: selectedPlan.identifier,
      toDate: moment(now.subtract(1, 'day')).format(),
    });
  }

  return payload;
};
