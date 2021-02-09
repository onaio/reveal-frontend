import { Field, Form, Formik } from 'formik';
import React from 'react';
import { Button, Col, FormGroup, Label, Row } from 'reactstrap';
import {
  ACTIVITY_DONE_BEFORE,
  ASSIGNED_WRONG_PLAN,
  CANCELED_PLAN,
  DUPLICATED_PLAN,
  ENTERED_WRONG_ADDRESS,
  OTHER_REASON,
  OTHER_REASON_LABEL,
  RETIRE_PLAN_REASON,
  SAME_SUB_VILLAGE,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';

interface RetirePlanFormProps {
  payload: PlanDefinition;
  savePlan: () => void;
}

interface FormInitialValues {
  otherReason: string;
  retireReason: string;
}

const other: string = 'OTHER';
export const RetireReasonOptions: { [key: string]: string } = {
  ACTIVITY_DONE: ACTIVITY_DONE_BEFORE,
  CANCELED: CANCELED_PLAN,
  DUPLICATE: DUPLICATED_PLAN,
  SAME_VILLAGE: SAME_SUB_VILLAGE,
  WRONG_ADDRESS: ENTERED_WRONG_ADDRESS,
  WRONG_PLAN: ASSIGNED_WRONG_PLAN,
  // tslint:disable-next-line: object-literal-sort-keys
  OTHER: OTHER_REASON,
};

const generatePayload = (values: FormInitialValues, planPayload?: PlanDefinition) => {
  if (!planPayload) {
    return values;
  }
  const retireReason =
    values.retireReason === other ? values.otherReason : RetireReasonOptions[values.retireReason];
  return {
    baseEntityId: planPayload.identifier,
    details: {
      planIdentifier: planPayload.identifier,
    },
    entityType: 'PlanDefinition',
    eventDate: '{{ current date}}',
    eventType: 'Retire_Plan',
    formSubmissionId: '{{uuid}}',
    locationId: '{{plan_location_identifier for plans with 1 location or empty otherwise}}',
    obs: [
      {
        fieldCode: 'retire_reason',
        fieldDataType: 'text',
        fieldType: 'formsubmissionField',
        formSubmissionField: 'retire_reason',
        humanReadableValues: [],
        parentCode: '',
        saveObsAsArray: false,
        set: [],
        values: [retireReason],
      },
    ],
    providerId: '{{logged in username}}',
    type: 'Event',
    version: '',
  };
};

const initialValues: FormInitialValues = {
  otherReason: '',
  retireReason: '',
};

const RetirePlanForm = (props?: RetirePlanFormProps) => {
  return (
    <Row>
      <Col md={6} id="planform-col-container">
        <Formik
          initialValues={initialValues}
          /* tslint:disable-next-line jsx-no-lambda */
          onSubmit={(values, { setSubmitting }) => {
            const formPayload = generatePayload(values, props?.payload);
            setSubmitting(false);
            return formPayload;
          }}
        >
          {({ errors, isSubmitting, values, isValid }) => (
            <Form>
              <FormGroup>
                <Label for="retireReason">{RETIRE_PLAN_REASON}</Label>
                <Field
                  required={true}
                  component="select"
                  name="retireReason"
                  id="retireReason"
                  className={errors.retireReason ? 'form-control is-invalid' : 'form-control'}
                >
                  <option key="" value="">
                    ------------
                  </option>
                  {Object.entries(RetireReasonOptions).map(e => (
                    <option key={e[0]} value={e[0]}>
                      {e[1]}
                    </option>
                  ))}
                </Field>
              </FormGroup>
              {values.retireReason === 'OTHER' && (
                <FormGroup>
                  <Label for="otherReason">{OTHER_REASON_LABEL}</Label>
                  <Field
                    required={true}
                    name="otherReason"
                    id="otherReason"
                    className={errors.otherReason ? 'form-control is-invalid' : 'form-control'}
                  />
                </FormGroup>
              )}
              <Button
                type="submit"
                id="planform-submit-button"
                className="btn btn-block"
                color="primary"
                aria-label="Ok"
                disabled={isSubmitting || Object.keys(errors).length > 0 || !isValid}
              >
                'OK'
              </Button>
            </Form>
          )}
        </Formik>
      </Col>
    </Row>
  );
};

export { RetirePlanForm };
