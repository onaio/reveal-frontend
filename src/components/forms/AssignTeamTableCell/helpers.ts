/** geting the button id for the AssignTeamButton
 * @param {string} jurisdictionId the id of the jurisdiction relevant to the table row
 * @returns {string} the id of the TeamAssignmentButton and target of the TeamAssignmentPopover
 */
export const getButtonId = (jurisdictionId: string): string => `plan-assignment-${jurisdictionId}`;

/** geting the button id of the Team Assignment form
 * @param {string} jurisdictionId the id of the jurisdiction relevant to the table row
 * @returns {string} the name of the form containing the OrganizationSelect component
 */
export const getFormName = (jurisdictionId: string): string =>
  `plan-assignment-form-${jurisdictionId}`;
