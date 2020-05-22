import React, { MouseEvent } from 'react';
import { Button, Form, FormGroup, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import { CLEAR, NO_TEAMS_LOADED_MESSAGE, SAVE, SELECT_TEAMS_TO_ASSIGN } from '../../configs/lang';
import { stopPropagationAndPreventDefault } from '../../helpers/utils';
import { Organization } from '../../store/ducks/opensrp/organizations';
import OrganizationSelect from '../forms/OrganizationSelect';

/** Interface for AssignTeamPopover */
export interface AssignTeamPopoverProps {
  formName: string; // id of the continer form element for the nested ReactSelect el
  isActive: boolean; // whether or not the popover should be visible
  jurisdictionId: string; // the id of the relevant Jurisdiction
  onClearAssignmentsButtonClick: (e: MouseEvent) => void; // what to do when clicking 'Clear'
  onSaveAssignmentsButtonClick: (e: MouseEvent) => void; // what to do when clicking 'Save'
  onToggle: () => void; // what to do when the popover toggles
  organizationsById: { [key: string]: Organization } | null; // all the organizations
  planId: string; // the id of the current Plan
  target: string; // the id of the adjacent button which toggles the popup
  parentIds?: string[];
  parentAssignments?: string[];
}

/** default Component for AssignTeamPopover */
const AssignTeamPopover = (props: AssignTeamPopoverProps) => {
  const {
    formName,
    isActive,
    jurisdictionId,
    onClearAssignmentsButtonClick,
    onSaveAssignmentsButtonClick,
    onToggle,
    organizationsById,
    planId,
    target,
    parentIds,
    parentAssignments,
  } = props;

  // define props for the child Organization Select component
  const organizationSelectProps = {
    jurisdictionId,
    name: formName,
    parentAssignments,
    parentIds,
    planId,
  };

  // define props for the actual popover component
  const popoverProps = {
    isOpen: isActive,
    onClick: (e: React.MouseEvent) => stopPropagationAndPreventDefault(e),
    target,
    toggle: () => onToggle(),
  };

  // hide clear all button if we have parent assignments
  const hasParentAssignments = parentAssignments ? parentAssignments.length > 0 : false;

  return (
    <Popover {...popoverProps} style={{ minWidth: '16rem' }}>
      <PopoverHeader>{SELECT_TEAMS_TO_ASSIGN}</PopoverHeader>
      <PopoverBody>
        {organizationsById ? (
          <Form name={formName}>
            <FormGroup>
              <OrganizationSelect {...organizationSelectProps} />
            </FormGroup>
            <FormGroup>
              {!hasParentAssignments && (
                <Button
                  color="default"
                  onClick={onClearAssignmentsButtonClick}
                  size="xs"
                  outline={true}
                >
                  {CLEAR}
                </Button>
              )}
              <Button color="primary" onClick={onSaveAssignmentsButtonClick} size="xs">
                {SAVE}
              </Button>
            </FormGroup>
          </Form>
        ) : (
          <p>{NO_TEAMS_LOADED_MESSAGE}</p>
        )}
      </PopoverBody>
    </Popover>
  );
};

export default AssignTeamPopover;
