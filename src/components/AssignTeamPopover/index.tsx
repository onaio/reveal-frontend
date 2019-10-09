import { keys } from 'lodash';
import React, { MouseEvent } from 'react';
import { Button, Form, FormGroup, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import { CLEAR, SAVE, SELECT_TEAMS_TO_ASSIGN } from '../../constants';
import OrganizationSelect from '../../containers/forms/OrganizationSelect';
import { stopPropagationAndPreventDefault } from '../../helpers/utils';
import { Organization } from '../../store/ducks/opensrp/organizations';

/** Interface for AssignTeamPopover */
export interface AssignTeamPopoverProps {
  formName: string;
  isActive: boolean;
  jurisdictionId: string;
  onClearAssignmentsButtonClick: (e: MouseEvent) => void;
  onSaveAssignmentsButtonClick: (e: MouseEvent) => void;
  onToggle: () => void;
  organizationsById: { [key: string]: Organization } | null;
  planId: string;
  target: string;
}

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
  } = props;

  const organizationsArray: Organization[] | null =
    organizationsById &&
    keys(organizationsById)
      .map((o: string) => organizationsById[o])
      .filter(o => !!o);

  const organizationSelectProps = {
    jurisdictionId,
    name: formName,
    planId,
  };

  const popoverProps = {
    isOpen: isActive,
    onClick: (e: React.MouseEvent) => stopPropagationAndPreventDefault(e),
    target,
    toggle: () => onToggle(),
  };

  return (
    <Popover {...popoverProps} style={{ minWidth: '16rem' }}>
      <PopoverHeader>{SELECT_TEAMS_TO_ASSIGN}</PopoverHeader>
      <PopoverBody>
        {organizationsArray ? (
          <Form name={formName}>
            <FormGroup>
              <OrganizationSelect {...organizationSelectProps} />
            </FormGroup>
            <FormGroup>
              <Button
                color="default"
                onClick={onClearAssignmentsButtonClick}
                size="xs"
                outline={true}
              >
                {CLEAR}
              </Button>
              <Button color="primary" onClick={onSaveAssignmentsButtonClick} size="xs">
                {SAVE}
              </Button>
            </FormGroup>
          </Form>
        ) : (
          <p>No teams loaded...</p>
        )}
      </PopoverBody>
    </Popover>
  );
};

export default AssignTeamPopover;
