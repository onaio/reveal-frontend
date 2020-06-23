import { ErrorMessage, Field, Form, Formik, FormikActions } from 'formik';
import React, { Fragment } from 'react';
import { Button, Col, FormGroup, Row } from 'reactstrap';
import { SelectField, SelectOption } from '../../../../../components/TreeWalker/SelectField';
import { OpenSRPJurisdiction } from '../../../../../components/TreeWalker/types';
import {
  CLOSE,
  COULD_NOT_LOAD_FORM,
  DID_NOT_SAVE_SUCCESSFULLY,
  SAVE,
  SAVING,
  TEAM_ASSIGNMENT_SUCCESSFUL,
} from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { OPENSRP_POST_ASSIGNMENTS_ENDPOINT } from '../../../../../constants';
import { successGrowl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import { Assignment } from '../../../../../store/ducks/opensrp/assignments';
import { getPayload } from './helpers';

export interface AssignmentFormProps {
  cancelCallBackFunc: () => void;
  defaultValue: SelectOption[];
  existingAssignments: Assignment[];
  jurisdiction: OpenSRPJurisdiction | null;
  messages: {
    fieldError: string;
    loadFormError: string;
  };
  options: SelectOption[];
  plan: PlanDefinition | null;
  submitCallBackFunc: (assignments: Assignment[]) => void;
  successNotifierBackFunc: (message: string) => void;
}

export const defaultAssignmentProps: AssignmentFormProps = {
  cancelCallBackFunc: () => null,
  defaultValue: [],
  existingAssignments: [],
  jurisdiction: null,
  messages: {
    fieldError: DID_NOT_SAVE_SUCCESSFULLY,
    loadFormError: COULD_NOT_LOAD_FORM,
  },
  options: [],
  plan: null,
  submitCallBackFunc: () => null,
  successNotifierBackFunc: successGrowl,
};

interface FormValues {
  organizations: string[];
}

const JurisdictionAssignmentForm = (props: AssignmentFormProps) => {
  const {
    cancelCallBackFunc,
    defaultValue,
    existingAssignments,
    jurisdiction,
    messages,
    options,
    plan,
    submitCallBackFunc,
    successNotifierBackFunc,
  } = props;

  if (!jurisdiction || !plan) {
    return <span>{messages.loadFormError}</span>;
  }

  const initialValues: FormValues = {
    organizations: defaultValue.map(e => e.value),
  };

  const submitForm = (
    values: FormValues,
    { setSubmitting, setFieldError }: FormikActions<FormValues>
  ) => {
    setSubmitting(true);
    const payload = getPayload(
      values.organizations,
      plan,
      jurisdiction,
      initialValues.organizations,
      existingAssignments
    );
    const OpenSrpAssignmentService = new OpenSRPService(OPENSRP_POST_ASSIGNMENTS_ENDPOINT);
    OpenSrpAssignmentService.create(payload)
      .then(response => {
        if (response) {
          successNotifierBackFunc(TEAM_ASSIGNMENT_SUCCESSFUL);
          submitCallBackFunc(payload);
        } else {
          setFieldError('organizations', messages.fieldError);
        }
      })
      .finally(() => setSubmitting(false))
      .catch((error: Error) => setFieldError('organizations', error.message));
  };

  return (
    <Fragment>
      <Formik initialValues={initialValues} onSubmit={submitForm}>
        {({ errors, isSubmitting }) => (
          <Form className="mb-5">
            <FormGroup className="select-orgs">
              <Field
                className={errors.organizations ? 'form-control is-invalid' : 'form-control'}
                component={SelectField}
                defaultValue={defaultValue}
                name="organizations"
                options={options}
              />
              <ErrorMessage
                name="organizations"
                component="p"
                className="form-text text-danger assignments-error"
              />
            </FormGroup>
            <FormGroup className="submit-group" id="submit-group">
              <Row>
                <Col md="6">
                  <Button
                    className="btn-block cancel"
                    size="sm"
                    type="button"
                    onClick={cancelCallBackFunc}
                  >
                    {CLOSE}
                  </Button>
                </Col>
                <Col md="6">
                  <Button
                    className="btn-block submit"
                    color="primary"
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? SAVING : SAVE}
                  </Button>
                </Col>
              </Row>
            </FormGroup>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
};

JurisdictionAssignmentForm.defaultProps = defaultAssignmentProps;

export { JurisdictionAssignmentForm };
