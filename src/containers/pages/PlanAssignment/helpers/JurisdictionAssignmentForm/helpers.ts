import moment from 'moment';
import { OpenSRPJurisdiction } from '../../../../../components/TreeWalker/types';
import { PlanDefinition } from '../../../../../configs/settings';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';

export const getPayload = (
  selectedOrgs: string[],
  selectedPlan: PlanDefinition,
  selectedJurisdiction: OpenSRPJurisdiction,
  initialOrgs: string[] = []
): Assignment[] => {
  let currentAssignments: Assignment[] = [];
  let retiredAssignments: Assignment[] = [];

  if (selectedOrgs.length > 0) {
    currentAssignments = selectedOrgs.map(orgId => {
      const now = moment(new Date());
      const planStart = moment(selectedPlan.effectivePeriod.start);
      return {
        fromDate: planStart > now ? now.format() : planStart.format(),
        jurisdiction: selectedJurisdiction.id,
        organization: orgId,
        plan: selectedPlan.identifier,
        toDate: moment(selectedPlan.effectivePeriod.end).format(),
      };
    });
  }

  if (initialOrgs.length > 0) {
    const retiredOrgIds = initialOrgs.filter(orgId => {
      const currentOrgIds = currentAssignments.map(org => org.organization);
      return !currentOrgIds.includes(orgId);
    });

    if (retiredOrgIds.length > 0) {
      retiredAssignments = retiredOrgIds.map(orgId => {
        return {
          fromDate: moment(selectedPlan.effectivePeriod.start).format(),
          jurisdiction: selectedJurisdiction.id,
          organization: orgId,
          plan: selectedPlan.identifier,
          toDate: moment(moment().subtract(1, 'day')).format(),
        };
      });
    }
  }

  return currentAssignments.concat(retiredAssignments);
};
