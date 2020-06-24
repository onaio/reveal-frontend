import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { ASSIGN_TEAMS } from '../../../../../configs/lang';
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
  const { assignTeamsLabel } = props;

  const callBack = (_: React.MouseEvent) => {
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  return showForm ? (
    <JurisdictionAssignmentForm {...props} cancelCallBackFunc={closeForm} />
  ) : (
    <Button onClick={callBack} size="sm" color="primary">
      {assignTeamsLabel}
    </Button>
  );
};

/** default props */
const defaultEditOrgsProps: EditOrgsProps = {
  ...defaultAssignmentProps,
  assignTeamsLabel: ASSIGN_TEAMS,
};

EditOrgs.defaultProps = defaultEditOrgsProps;

export { EditOrgs };
