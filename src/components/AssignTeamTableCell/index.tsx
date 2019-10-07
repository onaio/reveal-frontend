import reducerRegistry from '@onaio/redux-reducer-registry';
import { keys, values } from 'lodash';
import React, { MouseEvent, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import { Store } from 'redux';
import { stopPropagationAndPreventDefault } from '../../helpers/utils';
import organizationsReducer, {
  getOrganizationsById,
  Organization,
  reducerName as organizationsReducerName,
} from '../../store/ducks/opensrp/organizations';
import Loading from '../page/Loading';
reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** Interface for Assign Teams cell props */
export interface AssignTeamCellProps {
  jurisdictionId: string;
  organizationsById: { [key: string]: Organization } | null;
  planId: string;
}

/** Component that will be rendered in IRS planning table cells
 * showing the button and card in the Assign Teams column
 */
const AssignTeamTableCell = (props: AssignTeamCellProps) => {
  const { jurisdictionId, organizationsById } = props;
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
      Assign Teams
    </Button>
  );

  const organizationsArray: Organization[] | null =
    organizationsById &&
    keys(organizationsById)
      .map((o: string) => organizationsById[o])
      .filter(o => !!o);

  const AssignPopover = (
    <Popover target={getButtonId(jurisdictionId)} isOpen={isActive}>
      <PopoverHeader>Select Teams to Assign</PopoverHeader>
      <PopoverBody>
        <h1>Here be Teams!</h1>
        {organizationsArray ? (
          <ul>
            {organizationsArray.map((organization: Organization, i: number) => (
              <li key={i}>{organization.name}</li>
            ))}
          </ul>
        ) : (
          <Loading />
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
export { AssignTeamTableCell };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {AssignTeamCellProps} ownProps - the props
 *
 * @returns {AssignTeamCellProps} - ownProps and organizationsById
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): AssignTeamCellProps => {
  const organizationsById = getOrganizationsById(state);
  return {
    ...ownProps,
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
