import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { MouseEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import AssignTeamButton, { AssignTeamButtonProps } from '../../../components/AssignTeamButton';
import AssignTeamPopover, { AssignTeamPopoverProps } from '../../../components/AssignTeamPopover';
import { TEAMS_ASSIGNED } from '../../../constants';
import { stopPropagationAndPreventDefault } from '../../../helpers/utils';
import assignmentReducer, {
  Assignment,
  fetchAssignments,
  getAssignmentsArrayByPlanId,
  reducerName as assignmentReducerName,
  resetPlanAssignments,
} from '../../../store/ducks/opensrp/assignments';
import organizationsReducer, {
  getOrganizationsById,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../store/ducks/opensrp/organizations';

reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** Interface for Assign Teams cell props */
export interface AssignTeamCellProps {
  assignments: Assignment[]; // all the assignments for the plan-jurisdiction
  assignmentsArray: Assignment[]; // all the assignments for the plan
  assignButton?: React.ElementType;
  assignButtonProps?: AssignTeamButtonProps;
  assignPopover?: React.ElementType;
  assignPopoverProps?: AssignTeamPopoverProps;
  resetPlanAssignmentsAction: typeof resetPlanAssignments;
  jurisdictionId: string;
  organizationsById: { [key: string]: Organization } | null;
  planId: string;
}

/** Component that will be rendered in IRS planning table cells
 * showing the button and card in the Assign Teams column
 */
const AssignTeamTableCell = (props: AssignTeamCellProps) => {
  const {
    assignments,
    assignmentsArray,
    assignButton,
    assignPopover,
    resetPlanAssignmentsAction,
    jurisdictionId,
    organizationsById,
    planId,
  } = props;
  const [isActive, setIsActive] = useState<boolean>(false);

  const onPlanAssignmentButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    setIsActive(!isActive);
  };

  const onClearAssignmentsButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    const nextAssignments = assignmentsArray.filter(
      (a: Assignment) => a.jurisdiction !== jurisdictionId
    );
    resetPlanAssignmentsAction({ [planId]: [...nextAssignments] });
    setIsActive(!isActive);
  };

  const onSaveAssignmentsButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    setIsActive(!isActive);
  };

  // define the props being passed to the default AssignTeamButton
  const assignTeamButtonProps: AssignTeamButtonProps = props.assignButtonProps || {
    id: getButtonId(jurisdictionId),
    onClick: onPlanAssignmentButtonClick,
  };

  const assignTeamPopoverProps: AssignTeamPopoverProps = props.assignPopoverProps || {
    formName: getFormName(jurisdictionId),
    isActive,
    jurisdictionId,
    onClearAssignmentsButtonClick,
    onSaveAssignmentsButtonClick,
    onToggle: () => setIsActive(!isActive),
    organizationsById,
    planId,
    target: getButtonId(jurisdictionId),
  };

  return (
    <div onClick={stopPropagationAndPreventDefault}>
      <span style={{ paddingRight: '2rem' }} className="assignment-count-text">
        {`${assignments.length} ${TEAMS_ASSIGNED}`}
      </span>
      {assignButton || <AssignTeamButton {...assignTeamButtonProps} />}
      {assignPopover || <AssignTeamPopover {...assignTeamPopoverProps} />}
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
  const assignmentsArray = getAssignmentsArrayByPlanId(state, ownProps.planId);
  const assignments = assignmentsArray.filter(
    (a: Assignment) => a.jurisdiction === ownProps.jurisdictionId
  );
  return {
    ...ownProps,
    assignments,
    assignmentsArray,
    organizationsById,
  } as AssignTeamCellProps;
};

/** map props to actions that may be dispatched by component */
const mapDispatchToProps = {
  fetchAssignmentsActionCreator: fetchAssignments,
  resetPlanAssignmentsAction: resetPlanAssignments,
};

/** Create Connected AssignTeamTableCell */
const ConnectedAssignTeamTableCell = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignTeamTableCell);

export default ConnectedAssignTeamTableCell;
