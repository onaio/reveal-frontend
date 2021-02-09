import { getUser } from '@onaio/session-reducer';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import React from 'react';
import { Button, Col, FormGroup, Label, Row } from 'reactstrap';
import { ACTION_UUID_NAMESPACE } from '../../../../configs/env';
import {
  ACTIVITY_DONE_BEFORE,
  AN_ERROR_OCCURRED,
  ASSIGNED_WRONG_PLAN,
  CANCEL,
  CANCELED_PLAN,
  DUPLICATED_PLAN,
  ENTERED_WRONG_ADDRESS,
  OTHER_REASON,
  OTHER_REASON_LABEL,
  PROCEED,
  RETIRE_PLAN_REASON,
  SAME_SUB_VILLAGE,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { OPENSRP_EVENT_ENDPOINT } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { generateNameSpacedUUID } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';

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

const generatePayload = (values: FormInitialValues, planPayload: PlanDefinition) => {
  const retireReason =
    values.retireReason === other ? values.otherReason : RetireReasonOptions[values.retireReason];
  const eventDate = moment(new Date()).format('YYYY-MM-DD');
  const providerId = (getUser(store.getState()) || {}).username || '';
  const formSubmissionId = generateNameSpacedUUID(
    `${moment().toString()}-${planPayload.identifier}-${retireReason}`,
    ACTION_UUID_NAMESPACE
  );
  const { jurisdiction } = planPayload;
  const locationId =
    jurisdiction.length === 0 || jurisdiction.length > 1 ? '' : jurisdiction[0].code;

  return {
    ...(locationId && { locationId }),
    baseEntityId: planPayload.identifier,
    details: {
      planIdentifier: planPayload.identifier,
    },
    entityType: 'PlanDefinition',
    eventDate,
    eventType: 'Retire_Plan',
    formSubmissionId,
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
    providerId,
    type: 'Event',
    version: Date.now(),
  };
};

const initialValues: FormInitialValues = {
  otherReason: '',
  retireReason: '',
};

const RetirePlanForm = (props: RetirePlanFormProps) => {
  const { payload, savePlan } = props;
  return (
    <Row>
      <Col md={6} id="retireform-col-container">
        <Formik
          initialValues={initialValues}
          /* tslint:disable-next-line jsx-no-lambda */
          onSubmit={(values, { setSubmitting }) => {
            const service = new OpenSRPService(OPENSRP_EVENT_ENDPOINT);
            const formPayload = generatePayload(values, payload);
            service
              .create(formPayload)
              .then(() => {
                setSubmitting(false);
                savePlan();
              })
              .catch((e: Error) => {
                setSubmitting(false);
                displayError(e, AN_ERROR_OCCURRED, false);
              });
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
              <Row>
                <Col md={6} />
                <Col md={3}>
                  <Button
                    id="retireform-cancel-button"
                    className="btn btn-block"
                    color="secondary"
                    aria-label="Ok"
                  >
                    {CANCEL}
                  </Button>
                </Col>
                <Col md={3}>
                  <Button
                    type="submit"
                    id="retireform-submit-button"
                    className="btn btn-block"
                    color="primary"
                    aria-label="Ok"
                    disabled={isSubmitting || Object.keys(errors).length > 0 || !isValid}
                  >
                    {PROCEED}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </Col>
    </Row>
  );
};

export { RetirePlanForm };
