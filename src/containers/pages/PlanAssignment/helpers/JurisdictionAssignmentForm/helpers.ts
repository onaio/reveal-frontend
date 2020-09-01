import { get, keyBy } from 'lodash';
import moment from 'moment';
import { PlanDefinition } from '../../../../../configs/settings';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';
import { TreeNode } from '../../../../../store/ducks/opensrp/hierarchies/types';

/**
 * Get assignments payload
 *
 * Takes values from the JurisdictionAssignmentForm component and generates a payload
 * of assignments ready to be sent to the OpenSRP API.
 *
 * @param selectedOrgs - an array of the selected organization ids
 * @param selectedPlan - the selected plan definition object
 * @param selectedJurisdiction - the selected OpenSRP jurisdiction
 * @param initialOrgs - an array of initial (existing) organization ids
 * @param existingAssignments - an array of Assignment objects that exist for this plan/jurisdiction
 */
export const getPayload = (
  selectedOrgs: string[],
  selectedPlan: PlanDefinition,
  selectedJurisdiction: TreeNode,
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
        jurisdiction: selectedJurisdiction.model.id,
        organization: orgId,
        plan: selectedPlan.identifier,
        toDate: endDate,
      });
    }
  }

  // turns out if you put it in the loop it keeps subtracting a day for every iteration
  const retireDate = now.format();

  for (const retiredOrgId of initialOrgs.filter(orgId => !selectedOrgs.includes(orgId))) {
    if (!payload.map(obj => obj.organization).includes(retiredOrgId)) {
      // we should not change the fromDate, ever (the API will reject it)
      const thisAssignment = get(assignmentsByOrgId, retiredOrgId);
      if (thisAssignment) {
        startDate = thisAssignment.fromDate;
      }
      payload.push({
        fromDate: startDate,
        jurisdiction: selectedJurisdiction.model.id,
        organization: retiredOrgId,
        plan: selectedPlan.identifier,
        toDate: retireDate,
      });
    }
  }

  return payload;
};
