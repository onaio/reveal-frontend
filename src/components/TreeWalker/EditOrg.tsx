import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { ASSIGN_TEAMS } from '../../configs/lang';
import { JurisdictionAssignmentForm } from './form';
import { AssignmentFormProps, defaultAssignmentProps } from './form';

const EditOrg = (props: AssignmentFormProps) => {
  const [showForm, setShowForm] = useState(false);
  const { jurisdiction, options, plan, defaultValue } = props;

  const callBack = (_: React.MouseEvent) => {
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  return showForm ? (
    <JurisdictionAssignmentForm
      callBackFunc={closeForm}
      defaultValue={defaultValue}
      jurisdiction={jurisdiction}
      options={options}
      plan={plan}
    />
  ) : (
    <Button onClick={callBack} size="sm" color="primary">
      {ASSIGN_TEAMS}
    </Button>
  );
};

EditOrg.defaultProps = defaultAssignmentProps;

export { EditOrg };
