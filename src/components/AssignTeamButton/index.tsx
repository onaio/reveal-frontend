import { Dictionary } from '@onaio/utils';
import React, { MouseEvent } from 'react';
import { Button } from 'reactstrap';
import { ASSIGN_TEAMS } from '../../configs/lang';

/** interface describing the props of AssignTeamButton */
export interface AssignTeamButtonProps {
  buttonText?: string;
  className?: string;
  color?: string;
  id: string; // id must match the target value of the adjacent popover
  onClick: (e: MouseEvent) => void; // what to do when button is clicked
  size?: string;
  style?: Dictionary;
}

/** a simple button component for Team Assignment */
const AssignTeamButton = (props: AssignTeamButtonProps) => (
  <Button
    color={props.color || 'primary'}
    className={props.className || 'assign-team-button'}
    id={props.id}
    onClick={props.onClick}
    size={props.size || 'sm'}
    style={props.style || { float: 'right' }}
  >
    {props.buttonText || ASSIGN_TEAMS}
  </Button>
);

export default AssignTeamButton;
