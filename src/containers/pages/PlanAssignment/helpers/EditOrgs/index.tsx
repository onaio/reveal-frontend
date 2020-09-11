import React, { useState } from 'react';
import { Button, Tooltip } from 'reactstrap';
import { SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY } from '../../../../../configs/env';
import { ASSIGN_TEAMS, CANNOT_ASSIGN_TEAM_LABEL } from '../../../../../configs/lang';
import {
  AssignmentFormProps,
  defaultAssignmentProps,
  JurisdictionAssignmentForm,
} from '../JurisdictionAssignmentForm';

/** Props for EditOrgs  */
interface EditOrgsProps extends AssignmentFormProps {
  assignTeamsLabel: string;
}

/**
 * EditOrgs
 *
 * Renders the table column that contains the jurisdiction assignment form
 *
 * @param props - the props
 */
const EditOrgs = (props: EditOrgsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { assignTeamsLabel, jurisdiction, plan } = props;

  const { id: jurisdictionId } = jurisdiction && jurisdiction.model;
  const endDate = plan && plan.effectivePeriod.end;
  const isPlanExpired = new Date() > new Date(endDate as string);

  /**
   * toggle assign plan button and team assigning form
   * @param {React.MouseEvent} _
   * @param {boolean} disabled
   */
  const callBack = (_: React.MouseEvent, disabled: boolean = isPlanExpired) => {
    if (disabled) {
      return false;
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  /** show and hide tooltip */
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const assignBtnId = `jurisiction-${jurisdictionId}`;
  if (SHOW_TEAM_ASSIGN_ON_OPERATIONAL_AREAS_ONLY && jurisdiction && jurisdiction.hasChildren()) {
    return null;
  }

  return showForm ? (
    <JurisdictionAssignmentForm {...props} cancelCallBackFunc={closeForm} />
  ) : (
    <div>
      <Button
        onClick={callBack}
        size="sm"
        color="primary"
        className={`show-form${isPlanExpired ? ' disabled' : ''}`}
        id={assignBtnId}
      >
        {assignTeamsLabel}
      </Button>
      {isPlanExpired && (
        <Tooltip
          placement="top"
          className="tool-tip"
          isOpen={tooltipOpen}
          target={assignBtnId}
          toggle={toggleTooltip}
        >
          {CANNOT_ASSIGN_TEAM_LABEL}
        </Tooltip>
      )}
    </div>
  );
};

/** default props */
const defaultEditOrgsProps: EditOrgsProps = {
  ...defaultAssignmentProps,
  assignTeamsLabel: ASSIGN_TEAMS,
};

EditOrgs.defaultProps = defaultEditOrgsProps;

export { EditOrgs };
