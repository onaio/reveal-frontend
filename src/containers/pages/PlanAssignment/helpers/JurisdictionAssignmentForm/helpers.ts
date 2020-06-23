import { get, keyBy } from 'lodash';
import moment from 'moment';
import { OpenSRPJurisdiction } from '../../../../../components/TreeWalker/types';
import { PlanDefinition } from '../../../../../configs/settings';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';

export const getPayload = (
  selectedOrgs: string[],
  selectedPlan: PlanDefinition,
  selectedJurisdiction: OpenSRPJurisdiction,
  initialOrgs: string[] = [],
  existingAssignments: Assignment[] = []
): Assignment[] => {
  const now = moment(new Date());
  let startDate = now.format();
  const endDate = moment(selectedPlan.effectivePeriod.end).format();

  const payload: Assignment[] = [];
  const assignmentsByOrgId = keyBy(existingAssignments, 'organization');

  for (const orgId of selectedOrgs) {
    if (!payload.map(obj => obj.organization).includes(orgId)) {
      if (initialOrgs.includes(orgId)) {
        // we should not change the fromDate, ever (the API will reject it)
        const thisAssignment = get(assignmentsByOrgId, orgId);
        if (thisAssignment) {
          startDate = thisAssignment.fromDate;
        }
      }
      payload.push({
        fromDate: startDate,
        jurisdiction: selectedJurisdiction.id,
        organization: orgId,
        plan: selectedPlan.identifier,
        toDate: endDate,
      });
    }
  }

  // turns out if you put it in the loop it keeps subtracting a day for every iteration
  const retireDate = now.subtract(1, 'day').format();

  for (const retiredOrgId of initialOrgs.filter(orgId => !selectedOrgs.includes(orgId))) {
    if (!payload.map(obj => obj.organization).includes(retiredOrgId)) {
      // we should not change the fromDate, ever (the API will reject it)
      const thisAssignment = get(assignmentsByOrgId, retiredOrgId);
      if (thisAssignment) {
        startDate = thisAssignment.fromDate;
      }
      payload.push({
        fromDate: startDate,
        jurisdiction: selectedJurisdiction.id,
        organization: retiredOrgId,
        plan: selectedPlan.identifier,
        toDate: retireDate,
      });
    }
  }

  return payload;
};
