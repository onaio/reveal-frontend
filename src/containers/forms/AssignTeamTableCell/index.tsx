import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { MouseEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { Store } from 'redux';
import AssignTeamPopover, { AssignTeamPopoverProps } from '../../../components/AssignTeamPopover';
import { ASSIGN_TEAMS, TEAMS_ASSIGNED } from '../../../constants';
import { stopPropagationAndPreventDefault } from '../../../helpers/utils';
import assignmentReducer, {
  Assignment,
  fetchAssignments,
  getAssignmentsArrayByPlanIdByJurisdictionId,
  reducerName as assignmentReducerName,
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
  assignments: Assignment[];
  assignButton?: React.ElementType;
  assignPopover?: React.ElementType;
  fetchAssignmentsActionCreator: typeof fetchAssignments;
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
    assignButton,
    assignPopover,
    fetchAssignmentsActionCreator,
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
    const nextAssignments = assignments.filter(
      (a: Assignment) => a.jurisdiction !== jurisdictionId
    );
    fetchAssignmentsActionCreator(nextAssignments);
  };

  const onSaveAssignmentsButtonClick = (e: MouseEvent) => {
    stopPropagationAndPreventDefault(e);
    setIsActive(!isActive);
  };

  const AssignTeamButton = (
    <Button
      color="primary"
      className="assign-team-button"
      id={getButtonId(jurisdictionId)}
      onClick={onPlanAssignmentButtonClick}
      size="sm"
    >
      {ASSIGN_TEAMS}
    </Button>
  );

  const defaultAssignTeamPopoverProps: AssignTeamPopoverProps = {
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
  const defaultAssignTeamPopover = <AssignTeamPopover {...defaultAssignTeamPopoverProps} />;

  return (
    <div onClick={stopPropagationAndPreventDefault}>
      <span style={{ paddingRight: '2rem' }} className="assignment-count-text">
        {`${assignments.length} ${TEAMS_ASSIGNED}`}
      </span>
      {assignButton || AssignTeamButton}
      {assignPopover || defaultAssignTeamPopover}
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
const mapDispatchToProps = {
  fetchAssignmentsActionCreator: fetchAssignments,
};

/** Create Connected AssignTeamTableCell */
const ConnectedAssignTeamTableCell = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignTeamTableCell);

export default ConnectedAssignTeamTableCell;
