import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { MouseEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { TEAMS_ASSIGNED } from '../../../configs/lang';
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
import AssignTeamButton, { AssignTeamButtonProps } from '../../AssignTeamButton';
import AssignTeamPopover, { AssignTeamPopoverProps } from '../../AssignTeamPopover';
import { getButtonId, getFormName } from './helpers';
import './style.css';

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
  parentIds?: string[];
  parentAssignments?: string[];
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
    parentIds,
    parentAssignments,
  } = props;
  const [isActive, setIsActive] = useState<boolean>(false);

  // toggle isActive state on button click
  const onPlanAssignmentButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    setIsActive(!isActive);
  };

  // remove assignments for this jurisdicition and save to state,
  // and toggle isActive state on clear button click
  const onClearAssignmentsButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    const nextAssignments = assignmentsArray.filter(
      (a: Assignment) => a.jurisdiction !== jurisdictionId
    );
    resetPlanAssignmentsAction({ [planId]: [...nextAssignments] });
    setIsActive(!isActive);
  };

  // toggle isActive state when clicking save button
  const onSaveAssignmentsButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    setIsActive(!isActive);
  };

  // define the props being passed to the default AssignTeamButton
  const assignTeamButtonProps: AssignTeamButtonProps = props.assignButtonProps || {
    id: getButtonId(jurisdictionId),
    onClick: onPlanAssignmentButtonClick,
  };

  // define the props for the default AssignTeamPopover
  const assignTeamPopoverProps: AssignTeamPopoverProps = props.assignPopoverProps || {
    formName: getFormName(jurisdictionId),
    isActive,
    jurisdictionId,
    onClearAssignmentsButtonClick,
    onSaveAssignmentsButtonClick,
    onToggle: () => setIsActive(!isActive),
    organizationsById,
    parentAssignments,
    parentIds,
    planId,
    target: getButtonId(jurisdictionId),
  };

  const assignedOrganizations = assignments
    .map(
      (a: Assignment) =>
        organizationsById &&
        organizationsById[a.organization] &&
        organizationsById[a.organization].name
    )
    .filter(org => !!org)
    .join(', ');

  return (
    <div onClick={stopPropagationAndPreventDefault} className="assignment-cell">
      <span className="assignment-label" title={`${assignments.length} ${TEAMS_ASSIGNED}`}>
        {assignedOrganizations}
      </span>
      {assignButton || <AssignTeamButton {...assignTeamButtonProps} />}
      {assignPopover || <AssignTeamPopover {...assignTeamPopoverProps} />}
    </div>
  );
};

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
  const idsToCheckAssignments =
    ownProps.parentIds && ownProps.parentIds.length
      ? [ownProps.jurisdictionId, ...ownProps.parentIds]
      : [ownProps.jurisdictionId];
  const parentAssignments: string[] = [];
  const uniqueOptionsIds: string[] = [];
  const assignments: Assignment[] = [];
  assignmentsArray.forEach((a: Assignment) => {
    if (idsToCheckAssignments.includes(a.jurisdiction)) {
      if (a.jurisdiction !== ownProps.jurisdictionId) {
        parentAssignments.push(a.organization);
      }
      if (!uniqueOptionsIds.includes(a.organization)) {
        uniqueOptionsIds.push(a.organization);
        assignments.push(a);
      }
    }
  });

  return {
    ...ownProps,
    assignments,
    assignmentsArray,
    organizationsById,
    parentAssignments,
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
