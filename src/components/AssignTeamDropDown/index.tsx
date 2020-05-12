import React, { MouseEvent } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  UncontrolledDropdown,
} from 'reactstrap';
import {
  ASSIGN_TEAMS,
  CLEAR,
  NO_TEAMS_LOADED_MESSAGE,
  SAVE,
  SELECT_TEAMS_TO_ASSIGN,
} from '../../configs/lang';
import { Organization } from '../../store/ducks/opensrp/organizations';
import OrganizationSelect from '../forms/OrganizationSelect';
// import './index.css'

// interface ToggleInterface extends DropdownToggle{
//   jurisdictionName: string;
//   jurisdictionId: string;
// }

/** Interface for AssignTeamPopover */
export interface AssignTeamPopoverProps {
  // formName: string; // id of the container form element for the nested ReactSelect el
  // isActive: boolean; // whether or not the popover should be visible
  jurisdictionId: string; // the id of the relevant Jurisdiction
  jurisdictionName: string;
  onClearAssignmentsButtonClick: (e: MouseEvent) => void; // what to do when clicking 'Clear'
  onSaveAssignmentsButtonClick: (e: MouseEvent) => void; // what to do when clicking 'Save'
  // onToggle: () => void; // what to do when the popover toggles
  organizationsById: { [key: string]: Organization } | null; // all the organizations
  planId: string; // the id of the current Plan
  // target: string; // the id of the adjacent button which toggles the popup
}

/** default Component for AssignTeamPopover */
const AssignTeamDropDown = (props: AssignTeamPopoverProps) => {
  const {
    jurisdictionId,
    jurisdictionName,
    onClearAssignmentsButtonClick,
    onSaveAssignmentsButtonClick,
    organizationsById,
    planId,
  } = props;

  // define props for the child Organization Select component
  const organizationSelectProps = {
    jurisdictionId,
    // name: formName,
    planId,
  };

  return (
    <>
      <UncontrolledDropdown direction="left" className="assignment-drop-down">
        <DropdownToggle
          caret={true}
          color="primary"
          className="assign-team-button"
          size="sm"
          style={{ float: 'right' }}
        >
          {ASSIGN_TEAMS}
        </DropdownToggle>
        <DropdownMenu className="assignment-drop-down-menu">
          <Card className="assignment-drop-down-card">
            <CardHeader className="card-header">{`${SELECT_TEAMS_TO_ASSIGN} TO ${props.jurisdictionName}`}</CardHeader>
            <CardBody className="card-body">
              {organizationsById ? (
                <Form className="assignment-form">
                  <FormGroup>
                    <OrganizationSelect {...organizationSelectProps} />
                  </FormGroup>
                  <FormGroup>
                    <Button
                      color="secondary"
                      onClick={onClearAssignmentsButtonClick}
                      size="xs"
                      outline={true}
                      className="mr-3"
                    >
                      {CLEAR}
                    </Button>
                    <Button color="primary" onClick={onSaveAssignmentsButtonClick} size="xs">
                      {SAVE}
                    </Button>
                  </FormGroup>
                  {/* <CardFooter className='card-footer'>
                  <FormGroup>
                  <Button
                  color="default"
                  onClick={onClearAssignmentsButtonClick}
                  size="xs"
                  outline={true}
                  className='mr-3'
                    >
                    {CLEAR}
                    </Button>
                    <Button color="primary" onClick={onSaveAssignmentsButtonClick} size="xs">
                      {SAVE}
                      </Button>
                  </FormGroup>
                </CardFooter> */}
                </Form>
              ) : (
                <p>{NO_TEAMS_LOADED_MESSAGE}</p>
              )}
            </CardBody>
          </Card>
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
};

export default AssignTeamDropDown;
