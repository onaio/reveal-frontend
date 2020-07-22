import React, { useState } from 'react';
import { Button, Tooltip } from 'reactstrap';
import { ASSIGN_TEAMS, CANNOT_ASSIGN_TEAM } from '../../../../../configs/lang';
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
  const { assignTeamsLabel, jurisdiction, plan } = props;

  const { id: jurisdictionId } = jurisdiction && jurisdiction.model;
  const endDate = plan && plan.effectivePeriod.end;

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const callBack = (_: React.MouseEvent) => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  /** show and hide tooltip */
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const isExpired = new Date() > new Date(endDate as string);
  const assignBtnId = `jurisiction-${jurisdictionId}`;

  return showForm ? (
    <JurisdictionAssignmentForm {...props} cancelCallBackFunc={closeForm} />
  ) : (
    <div>
      <Button
        onClick={callBack}
        size="sm"
        color="primary"
        className="show-form"
        disabled={isExpired}
        id={assignBtnId}
      >
        {assignTeamsLabel}
      </Button>
      {isExpired && (
        <Tooltip
          placement="top"
          className="tool-tip"
          isOpen={tooltipOpen}
          target={assignBtnId}
          toggle={toggleTooltip}
        >
          {CANNOT_ASSIGN_TEAM}
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
