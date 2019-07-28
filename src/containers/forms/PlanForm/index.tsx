import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import moment from 'moment';
import React, { FormEvent } from 'react';
import { Button, FormGroup, Label } from 'reactstrap';
import * as Yup from 'yup';
import DatePickerWrapper from '../../../components/DatePickerWrapper';
import { DATE_FORMAT, DEFAULT_PLAN_DURATION_DAYS } from '../../../configs/env';
import {
  actionReasons,
  FIClassifications,
  FIReasons,
  FIStatuses,
  goalPriorities,
  planActivities,
  PlanActivity,
} from '../../../configs/settings';
import { DATE, IRS_TITLE, IS, NAME, REQUIRED, SAVING } from '../../../constants';
import { InterventionType, PlanStatus } from '../../../store/ducks/plans';

/** Allowed FI Status values */
type FIStatusType = typeof FIStatuses[number];

/** Allowed FI Status values */
type FIReasonType = typeof FIReasons[number];

/** Array of FI Statuses */
const fiStatusCodes = Object.values(FIClassifications).map(e => e.code as FIStatusType);

/** Yup validation schema for PlanForm */
const PlanSchema = Yup.object().shape({
  caseNum: Yup.string(),
  date: Yup.string().required(`${DATE} ${IS} ${REQUIRED}`),
  end: Yup.date().required(REQUIRED),
  fiReason: Yup.string().oneOf(FIReasons.map(e => e)),
  fiStatus: Yup.string().oneOf(fiStatusCodes),
  interventionType: Yup.string()
    .oneOf(Object.values(InterventionType))
    .required(REQUIRED),
  name: Yup.string().required(`${NAME} ${IS} ${REQUIRED}`),
  opensrpEventId: Yup.string(),
  start: Yup.date().required(REQUIRED),
  status: Yup.string()
    .oneOf(Object.values(PlanStatus))
    .required(REQUIRED),
  title: Yup.string().required(REQUIRED),
});

/** Plan activity form fields interface */
interface PlanActivityFormFields {
  actionDescription: string;
  actionReason: string;
  actionTitle: string;
  goalDescription: string;
  goalDue: Date;
  goalPriority: string;
  goalValue: number;
  timingPeriodEnd: Date;
  timingPeriodStart: Date;
}

/** Plan form fields interface */
interface PlanFormFields {
  activities: PlanActivityFormFields[];
  caseNum?: string;
  date: Date;
  end: Date;
  fiReason?: FIReasonType;
  fiStatus?: FIStatusType;
  interventionType: InterventionType;
  name: string;
  opensrpEventId?: string;
  start: Date;
  status: PlanStatus;
  title: string;
}

/** initial values for plan activity forms */
const initialActivitiesValues: PlanActivityFormFields = {
  actionDescription: '',
  actionReason: actionReasons[0],
  actionTitle: '',
  goalDescription: '',
  goalDue: moment()
    .add(DEFAULT_PLAN_DURATION_DAYS, 'days')
    .toDate(),
  goalPriority: goalPriorities[1],
  goalValue: 0,
  timingPeriodEnd: moment()
    .add(DEFAULT_PLAN_DURATION_DAYS, 'days')
    .toDate(),
  timingPeriodStart: moment().toDate(),
};

/** initial values for plan Form */
const initialValues: PlanFormFields = {
  activities: [initialActivitiesValues],
  caseNum: '',
  date: moment().toDate(),
  end: moment()
    .add(DEFAULT_PLAN_DURATION_DAYS, 'days')
    .toDate(),
  fiReason: undefined,
  fiStatus: undefined,
  interventionType: InterventionType.FI,
  name: '',
  opensrpEventId: undefined,
  start: moment().toDate(),
  status: PlanStatus.DRAFT,
  title: '',
};

/**
 * Get the plan name and title
 * @param {any} event - the event object
 * @param {PlanFormFields} formValues - the form values
 * @returns {[string, string]} - the plan name and title
 */
const getNameTitle = (event: FormEvent, formValues: PlanFormFields): [string, string] => {
  const target = event.target as HTMLInputElement;
  let name = IRS_TITLE;
  let title = IRS_TITLE;
  const currentInterventionType =
    target.name === 'interventionType' ? target.value : formValues.interventionType;
  const currentFiStatus = target.name === 'fiStatus' ? target.value : formValues.fiStatus;
  const currentJurisdiction = 'Some Jurisdiction';
  const currentDate = target.name === 'date' ? target.value : formValues.date;
  if (currentInterventionType === InterventionType.FI) {
    const result = [
      currentFiStatus,
      currentJurisdiction,
      moment(currentDate).format(DATE_FORMAT.toUpperCase()),
    ].map(e => {
      if (e) {
        return e;
      }
    });
    name = result.join('-');
    title = result.join(' ');
  }
  return [name, title];
};

/** Plan Form component */
const PlanForm = () => {
  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        /* tslint:disable-next-line jsx-no-lambda */
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
        }}
        validationSchema={PlanSchema}
      >
        {({ errors, isSubmitting, setFieldValue, values }) => (
          <Form
            /* tslint:disable-next-line jsx-no-lambda */
            onChange={(e: FormEvent) => {
              const nameTitle = getNameTitle(e, values);
              setFieldValue('name', nameTitle[0]);
              setFieldValue('title', nameTitle[1]);
            }}
          >
            <FormGroup className="non-field-errors">
              <ErrorMessage name="name" component="p" className="form-text text-danger" />
              <ErrorMessage name="date" component="p" className="form-text text-danger" />
            </FormGroup>
            <FormGroup>
              <Label for="interventionType">Intervention Type</Label>
              <Field
                component="select"
                name="interventionType"
                id="interventionType"
                className={errors.interventionType ? 'form-control is-invalid' : 'form-control'}
              >
                <option value={InterventionType.FI}>Focus Investigation</option>
                <option value={InterventionType.IRS}>IRS</option>
              </Field>
              <ErrorMessage
                name="interventionType"
                component="small"
                className="form-text text-danger"
              />
            </FormGroup>
            {values.interventionType === InterventionType.FI && (
              <FormGroup>
                <Label for="fiStatus">Focus Investigation Status</Label>
                <Field
                  component="select"
                  name="fiStatus"
                  id="fiStatus"
                  className={errors.fiStatus ? 'form-control is-invalid' : 'form-control'}
                >
                  <option>----</option>
                  {Object.entries(FIClassifications).map(e => (
                    <option key={e[1].code} value={e[1].code}>
                      {e[1].code} - {e[1].name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="fiStatus" component="small" className="form-text text-danger" />
              </FormGroup>
            )}
            {values.interventionType === InterventionType.FI && (
              <FormGroup>
                <Label for="fiReason">Focus Investigation Reason</Label>
                <Field
                  component="select"
                  name="fiReason"
                  id="fiReason"
                  className={errors.fiReason ? 'form-control is-invalid' : 'form-control'}
                >
                  <option>----</option>
                  {FIReasons.map(e => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="fiReason" component="small" className="form-text text-danger" />
              </FormGroup>
            )}
            {values.interventionType === InterventionType.FI && values.fiReason === FIReasons[1] && (
              <FormGroup>
                <Label for="caseNum">Case Number</Label>
                <Field
                  type="text"
                  name="caseNum"
                  id="caseNum"
                  className={errors.caseNum ? 'form-control is-invalid' : 'form-control'}
                />
                <ErrorMessage name="caseNum" component="small" className="form-text text-danger" />

                <Field type="hidden" name="opensrpEventId" id="opensrpEventId" readOnly={true} />
              </FormGroup>
            )}
            <FormGroup>
              <Label for="title">Plan Title</Label>
              <Field
                type="text"
                name="title"
                id="title"
                className={errors.name || errors.title ? 'form-control is-invalid' : 'form-control'}
              />
              <ErrorMessage name="title" component="small" className="form-text text-danger" />

              <Field type="hidden" name="name" id="name" />
            </FormGroup>
            <FormGroup>
              <Label for="status">Status</Label>
              <Field
                component="select"
                name="status"
                id="status"
                className={errors.status ? 'form-control is-invalid' : 'form-control'}
              >
                {Object.entries(PlanStatus).map(e => (
                  <option key={e[0]} value={e[1]}>
                    {e[1]}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="status" component="small" className="form-text text-danger" />
            </FormGroup>
            <FormGroup>
              <Label for="start">Plan Start Date</Label>
              <Field
                type="date"
                name="start"
                id="start"
                dateFormat={DATE_FORMAT}
                className={errors.start ? 'form-control is-invalid' : 'form-control'}
                component={DatePickerWrapper}
              />
              <ErrorMessage name="start" component="small" className="form-text text-danger" />

              <Field type="hidden" name="date" id="date" />
            </FormGroup>
            <FormGroup>
              <Label for="end">Plan End Date</Label>
              <Field
                type="date"
                name="end"
                id="end"
                dateFormat={DATE_FORMAT}
                className={errors.end ? 'form-control is-invalid' : 'form-control'}
                component={DatePickerWrapper}
                minDate={values.start}
              />
              <ErrorMessage name="end" component="small" className="form-text text-danger" />
            </FormGroup>
            <hr />
            <FieldArray
              name="activities"
              /* tslint:disable-next-line jsx-no-lambda */
              render={arrayHelpers => (
                <div>
                  {values.activities.map((activity, index) => (
                    <div key={index}>
                      <FormGroup>
                        <Label for={`activities[${index}].actionTitle`}>Action</Label>
                        <Field
                          type="text"
                          name={`activities[${index}].actionTitle`}
                          id={`activities[${index}].actionTitle`}
                          className={errors.title ? 'form-control is-invalid' : 'form-control'}
                        />
                        <ErrorMessage
                          name={`activities[${index}].actionTitle`}
                          component="small"
                          className="form-text text-danger"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities[${index}].actionDescription`}>Description</Label>
                        <Field
                          component="textarea"
                          name={`activities[${index}].actionDescription`}
                          id={`activities[${index}].actionDescription`}
                          className={errors.title ? 'form-control is-invalid' : 'form-control'}
                        />
                        <ErrorMessage
                          name={`activities[${index}].actionDescription`}
                          component="small"
                          className="form-text text-danger"
                        />
                        <Field
                          type="hidden"
                          name={`activities[${index}].goalDescription`}
                          id={`activities[${index}].goalDescription`}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities[${index}].goalValue`}>Quantity</Label>
                        <Field
                          type="number"
                          name={`activities[${index}].goalValue`}
                          id={`activities[${index}].goalValue`}
                          className={errors.title ? 'form-control is-invalid' : 'form-control'}
                        />
                        <ErrorMessage
                          name={`activities[${index}].goalValue`}
                          component="small"
                          className="form-text text-danger"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities[${index}].timingPeriodStart`}>Start Date</Label>
                        <Field
                          type="date"
                          name={`activities[${index}].timingPeriodStart`}
                          id={`activities[${index}].timingPeriodStart`}
                          dateFormat={DATE_FORMAT}
                          className={errors.status ? 'form-control is-invalid' : 'form-control'}
                          component={DatePickerWrapper}
                        />
                        <ErrorMessage
                          name={`activities[${index}].timingPeriodStart`}
                          component="small"
                          className="form-text text-danger"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities[${index}].timingPeriodEnd`}>End Date</Label>
                        <Field
                          type="date"
                          name={`activities[${index}].timingPeriodEnd`}
                          id={`activities[${index}].timingPeriodEnd`}
                          dateFormat={DATE_FORMAT}
                          className={errors.status ? 'form-control is-invalid' : 'form-control'}
                          component={DatePickerWrapper}
                          minDate={values.activities[index].timingPeriodStart}
                        />
                        <ErrorMessage
                          name={`activities[${index}].timingPeriodEnd`}
                          component="small"
                          className="form-text text-danger"
                        />
                        <Field
                          type="hidden"
                          name={`activities[${index}].goalDue`}
                          id={`activities[${index}].goalDue`}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities[${index}].actionReason`}>Reason</Label>
                        <Field
                          component="select"
                          name={`activities[${index}].actionReason`}
                          id={`activities[${index}].actionReason`}
                          className={errors.status ? 'form-control is-invalid' : 'form-control'}
                        >
                          {actionReasons.map(e => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name={`activities[${index}].actionReason`}
                          component="small"
                          className="form-text text-danger"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities[${index}].goalPriority`}>Priority</Label>
                        <Field
                          component="select"
                          name={`activities[${index}].goalPriority`}
                          id={`activities[${index}].goalPriority`}
                          className={errors.status ? 'form-control is-invalid' : 'form-control'}
                        >
                          {goalPriorities.map(e => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name={`activities[${index}].goalPriority`}
                          component="small"
                          className="form-text text-danger"
                        />
                      </FormGroup>
                    </div>
                  ))}
                </div>
              )}
            />
            <hr />
            <Button
              type="submit"
              className="btn btn-block"
              color="primary"
              aria-label="Save Plan"
              disabled={isSubmitting}
            >
              {isSubmitting ? SAVING : 'Save Plan'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PlanForm;
