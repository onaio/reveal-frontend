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
  const { defaultValue, jurisdiction, options, plan, submitCallBackFunc } = props;

  const callBack = (_: React.MouseEvent) => {
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  return showForm ? (
    <JurisdictionAssignmentForm
      cancelCallBackFunc={closeForm}
      defaultValue={defaultValue}
      jurisdiction={jurisdiction}
      options={options}
      plan={plan}
      submitCallBackFunc={submitCallBackFunc}
    />
  ) : (
    <Button onClick={callBack} size="sm" color="primary">
      {ASSIGN_TEAMS}
    </Button>
  );
};

EditOrg.defaultProps = defaultAssignmentProps;

export { EditOrg };
