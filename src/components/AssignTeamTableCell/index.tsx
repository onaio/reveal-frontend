import reducerRegistry from '@onaio/redux-reducer-registry';
import { keys } from 'lodash';
import React, { MouseEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import { Store } from 'redux';
import { ASSIGN_TEAMS } from '../../constants';
import OrganizationSelect from '../../containers/forms/OrganizationSelect';
import { stopPropagationAndPreventDefault } from '../../helpers/utils';
import assignmentReducer, {
  Assignment,
  getAssignmentsArrayByPlanIdByJurisdictionId,
  reducerName as assignmentReducerName,
} from '../../store/ducks/opensrp/assignments';
import organizationsReducer, {
  getOrganizationsById,
  Organization,
  reducerName as organizationsReducerName,
} from '../../store/ducks/opensrp/organizations';

reducerRegistry.register(assignmentReducerName, assignmentReducer);

reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** Interface for Assign Teams cell props */
export interface AssignTeamCellProps {
  assignments: Assignment[];
  jurisdictionId: string;
  organizationsById: { [key: string]: Organization } | null;
  planId: string;
}

/** Component that will be rendered in IRS planning table cells
 * showing the button and card in the Assign Teams column
 */
const AssignTeamTableCell = (props: AssignTeamCellProps) => {
  const { assignments, jurisdictionId, organizationsById, planId } = props;
  const [isActive, setIsActive] = useState<boolean>(false);

  const onPlanAssignmentButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    setIsActive(!isActive);
  };

  const AssignTeamButton = (
    <Button
      color="primary"
      id={getButtonId(jurisdictionId)}
      onClick={onPlanAssignmentButtonClick}
      size="sm"
    >
      {ASSIGN_TEAMS}
    </Button>
  );

  const organizationsArray: Organization[] | null =
    organizationsById &&
    keys(organizationsById)
      .map((o: string) => organizationsById[o])
      .filter(o => !!o);

  const organizationSelectProps = {
    jurisdictionId,
    name: getFormName(jurisdictionId),
    planId,
    values: assignments.map((a: Assignment) => a.organization),
  };

  const popoverProps = {
    isOpen: isActive,
    onClick: (e: React.MouseEvent) => stopPropagationAndPreventDefault(e),
    target: getButtonId(jurisdictionId),
    toggle: () => setIsActive(!isActive),
  };
  const AssignPopover = (
    <Popover {...popoverProps}>
      <PopoverHeader>Select Teams to Assign</PopoverHeader>
      <PopoverBody>
        <h1>Here be Teams!</h1>
        {organizationsArray ? (
          <Form name={getFormName(jurisdictionId)}>
            <OrganizationSelect {...organizationSelectProps} />
          </Form>
        ) : (
          <p>No teams loaded...</p>
        )}
      </PopoverBody>
    </Popover>
  );

  return (
    <div>
      {AssignTeamButton}
      {AssignPopover}
    </div>
  );
};

const getButtonId = (jurisdictionId: string): string => `plan-assignment-${jurisdictionId}`;
const getFormName = (jurisdictionId: string): string => `plan-assignment-form-${jurisdictionId}`;
export { AssignTeamTableCell };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {AssignTeamCellProps} ownProps - the props
 *
 * @returns {AssignTeamCellProps} - ownProps and organizationsById
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): AssignTeamCellProps => {
  const organizationsById = getOrganizationsById(state);
  const assignments = getAssignmentsArrayByPlanIdByJurisdictionId(
    state,
    ownProps.planId,
    ownProps.jurisdictionId
  );
  return {
    ...ownProps,
    assignments,
    organizationsById,
  } as AssignTeamCellProps;
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {};

/** Create Connected AssignTeamTableCell */
const ConnectedAssignTeamTableCell = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignTeamTableCell);

export default ConnectedAssignTeamTableCell;
