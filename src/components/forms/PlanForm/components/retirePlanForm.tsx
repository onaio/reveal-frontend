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
import {
  EVENT_LABEL,
  FORM_SUBMISSION_FIELD,
  OPENSRP_EVENT_ENDPOINT,
  PLAN_DEFINITION,
  RETIRE_PLAN,
  RETIRE_REASON,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { generateNameSpacedUUID } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';

/** Formik set submitting type  */
export type SetSubmittingType = (isSubmitting: boolean) => void;

/** Retire plan from props interface */
interface RetirePlanFormProps {
  cancelCallBack: () => void;
  payload: PlanDefinition;
  setSubmittingCallBack: SetSubmittingType;
  savePlan: (payload: PlanDefinition, setSubmitting: SetSubmittingType) => void;
}

/** retiring Form values interface */
interface RetiringFormValues {
  otherReason: string;
  retireReason: string;
}

/** Define reasons, for translation purposes */
const otherReason: string = 'OTHER';
export const RetireReasonOptions: { [key: string]: string } = {
  ACTIVITY_DONE: ACTIVITY_DONE_BEFORE,
  CANCELED: CANCELED_PLAN,
  DUPLICATE: DUPLICATED_PLAN,
  SAME_VILLAGE: SAME_SUB_VILLAGE,
  WRONG_ADDRESS: ENTERED_WRONG_ADDRESS,
  WRONG_PLAN: ASSIGNED_WRONG_PLAN,
  // tslint:disable-next-line: object-literal-sort-keys
  [otherReason]: OTHER_REASON,
};

/**
 * generate retiring plan payload to be submited to API
 * @param {RetiringFormValues} values - submited form values
 * @param {PlanDefinition} planPayload - plans payload to be submited
 */
const generatePayload = (values: RetiringFormValues, planPayload: PlanDefinition) => {
  const retireReason =
    values.retireReason === otherReason
      ? values.otherReason
      : RetireReasonOptions[values.retireReason];
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
    entityType: PLAN_DEFINITION,
    eventDate,
    eventType: RETIRE_PLAN,
    formSubmissionId,
    obs: [
      {
        fieldCode: RETIRE_REASON,
        fieldDataType: 'text',
        fieldType: FORM_SUBMISSION_FIELD,
        formSubmissionField: RETIRE_REASON,
        humanReadableValues: [],
        parentCode: '',
        saveObsAsArray: false,
        set: [],
        values: [retireReason],
      },
    ],
    providerId,
    type: EVENT_LABEL,
    version: Date.now(),
  };
};

/** Form initial values */
const initialValues: RetiringFormValues = {
  otherReason: '',
  retireReason: '',
};

/** Retiring plan reasons Component */
const RetirePlanForm = (props: RetirePlanFormProps) => {
  const { payload, savePlan, cancelCallBack, setSubmittingCallBack } = props;

  return (
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
            cancelCallBack();
            // we have not handled what will happen if saving of a plan fails
            // and the event for retiring the plan is successfull
            savePlan(payload, setSubmittingCallBack);
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
          {values.retireReason === otherReason && (
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
            <Col md={6}>
              <Button
                id="retireform-cancel-button"
                className="btn btn-block"
                color="secondary"
                aria-label="Ok"
                /* tslint:disable-next-line jsx-no-lambda */
                onClick={() => {
                  setSubmittingCallBack(false);
                  cancelCallBack();
                }}
              >
                {CANCEL}
              </Button>
            </Col>
            <Col md={6}>
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
  );
};

export { RetirePlanForm };
