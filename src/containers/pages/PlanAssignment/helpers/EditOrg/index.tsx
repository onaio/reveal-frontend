import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { ASSIGN_TEAMS } from '../../../../../configs/lang';
import {
  AssignmentFormProps,
  defaultAssignmentProps,
  JurisdictionAssignmentForm,
} from '../JurisdictionAssignmentForm';

const EditOrg = (props: AssignmentFormProps) => {
  const [showForm, setShowForm] = useState(false);

  const callBack = (_: React.MouseEvent) => {
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  return showForm ? (
    <JurisdictionAssignmentForm {...props} cancelCallBackFunc={closeForm} />
  ) : (
    <Button onClick={callBack} size="sm" color="primary">
      {ASSIGN_TEAMS}
    </Button>
  );
};

EditOrg.defaultProps = defaultAssignmentProps;

export { EditOrg };
