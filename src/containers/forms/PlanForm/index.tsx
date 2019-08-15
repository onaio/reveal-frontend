import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import moment from 'moment';
import React, { FormEvent, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, FormGroup, Label } from 'reactstrap';
import DatePickerWrapper from '../../../components/DatePickerWrapper';
import {
  DATE_FORMAT,
  DEFAULT_ACTIVITY_DURATION_DAYS,
  DEFAULT_PLAN_DURATION_DAYS,
  DEFAULT_PLAN_VERSION,
} from '../../../configs/env';
import {
  actionReasons,
  FIClassifications,
  FIReasons,
  goalPriorities,
} from '../../../configs/settings';
import { PLAN_LIST_URL, SAVING } from '../../../constants';
import { OpenSRPService } from '../../../services/opensrp';
import { InterventionType, PlanStatus } from '../../../store/ducks/plans';
import JurisdictionSelect from '../JurisdictionSelect';
import {
  doesFieldHaveErrors,
  FIActivities,
  generatePlanDefinition,
  getFormActivities,
  getNameTitle,
  IRSActivities,
  PlanFormFields,
  PlanJurisdictionFormFields,
  PlanSchema,
} from './helpers';

/** initial values for plan jurisdiction forms */
const initialJurisdictionValues: PlanJurisdictionFormFields = {
  id: '',
  name: '',
};

/** initial values for plan Form */
export const defaultInitialValues: PlanFormFields = {
  activities: getFormActivities(FIActivities),
  caseNum: '',
  date: moment().toDate(),
  end: moment()
    .add(DEFAULT_PLAN_DURATION_DAYS, 'days')
    .toDate(),
  fiReason: undefined,
  fiStatus: undefined,
  identifier: '',
  interventionType: InterventionType.FI,
  jurisdictions: [initialJurisdictionValues],
  name: '',
  opensrpEventId: undefined,
  start: moment().toDate(),
  status: PlanStatus.DRAFT,
  title: '',
  version: DEFAULT_PLAN_VERSION,
};

/** interface for plan form props */
interface PlanFormProps {
  disabledFields: string[];
  initialValues: PlanFormFields;
  redirectAfterAction: string;
}

/** Plan Form component */
const PlanForm = (props: PlanFormProps) => {
  const [globalError, setGlobalError] = useState<string>('');
  const [areWeDoneHere, setAreWeDoneHere] = useState<boolean>(false);

  const { disabledFields, initialValues, redirectAfterAction } = props;
  return (
    <div className="form-container">
      {areWeDoneHere === true && <Redirect to={redirectAfterAction} />}
      <Formik
        initialValues={initialValues}
        /* tslint:disable-next-line jsx-no-lambda */
        onSubmit={(values, { setErrors, setSubmitting }) => {
          const payload = generatePlanDefinition(values);
          const apiService = new OpenSRPService('/plans');

          apiService
            .create(payload)
            .then(() => {
              setSubmitting(false);
              setAreWeDoneHere(true);
            })
            .catch((e: Error) => {
              setGlobalError(e.message);
            });
        }}
        validationSchema={PlanSchema}
      >
        {({ errors, handleChange, isSubmitting, setFieldValue, values }) => (
          <Form
            /* tslint:disable-next-line jsx-no-lambda */
            onChange={(e: FormEvent) => {
              const target = e.target as HTMLInputElement;
              const fieldsThatChangePlanTitle = [
                'interventionType',
                'fiStatus',
                'date',
                'jurisdictions[0].id',
              ];
              const nameTitle = getNameTitle(e, values);
              if (
                fieldsThatChangePlanTitle.includes(target.name) ||
                (!values.title || values.title === '')
              ) {
                setFieldValue('title', nameTitle[1]);
              }
              setFieldValue('name', nameTitle[0]);
            }}
            className="mb-5"
          >
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="">{globalError}</p>}
              <ErrorMessage name="name" component="p" className="form-text text-danger" />
              <ErrorMessage name="date" component="p" className="form-text text-danger" />
            </FormGroup>
            <FormGroup>
              <Label for="interventionType">Intervention Type</Label>
              <Field
                required={true}
                component="select"
                name="interventionType"
                id="interventionType"
                disabled={disabledFields.includes('interventionType')}
                /* tslint:disable-next-line jsx-no-lambda */
                onChange={(e: FormEvent) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value === InterventionType.IRS) {
                    setFieldValue('activities', getFormActivities(IRSActivities));
                  } else {
                    setFieldValue('activities', getFormActivities(FIActivities));
                  }
                  setFieldValue('jurisdictions', [initialJurisdictionValues]);
                  handleChange(e);
                }}
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

            <h5 className="mt-5">Locations</h5>
            <div id="jurisdictions-select-container">
              <FieldArray
                name="jurisdictions"
                /* tslint:disable-next-line jsx-no-lambda */
                render={arrayHelpers => (
                  <div className="mb-5">
                    {values.jurisdictions.map((jurisdiction, index) => (
                      <fieldset key={index}>
                        {errors.jurisdictions && errors.jurisdictions[index] && (
                          <div className="alert alert-danger" role="alert">
                            <h6 className="alert-heading">Please fix these errors</h6>
                            <ul className="list-unstyled">
                              {Object.entries(errors.jurisdictions[index] || {}).map(
                                ([key, val]) => (
                                  <li key={key}>
                                    <strong>Focus Area</strong>: {val}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                        <div className="jurisdiction-item position-relative">
                          {values.jurisdictions && values.jurisdictions.length > 1 && (
                            <button
                              type="button"
                              className="close position-absolute removeArrItem removeJurisdiction"
                              aria-label="Close"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              <span aria-hidden="true">&times;</span>
                            </button>
                          )}
                          <FormGroup
                            className={
                              errors.jurisdictions &&
                              doesFieldHaveErrors('id', index, errors.jurisdictions)
                                ? 'is-invalid async-select-container'
                                : 'async-select-container'
                            }
                          >
                            <Label for={`jurisdictions-${index}-id`}>Focus Area</Label>
                            <Field
                              required={true}
                              component={JurisdictionSelect}
                              name={`jurisdictions[${index}].id`}
                              id={`jurisdictions-${index}-id`}
                              placeholder="Select Focus Area"
                              aria-label="Select Focus Area"
                              disabled={disabledFields.includes('jurisdictions')}
                              className={
                                errors.jurisdictions &&
                                doesFieldHaveErrors('id', index, errors.jurisdictions)
                                  ? 'is-invalid async-select'
                                  : 'async-select'
                              }
                              labelFieldName={`jurisdictions[${index}].name`}
                            />
                            <Field
                              type="hidden"
                              name={`jurisdictions[${index}].name`}
                              id={`jurisdictions-${index}-name`}
                            />

                            {errors.jurisdictions && errors.jurisdictions[index] && (
                              <small className="form-text text-danger">An Error Ocurred</small>
                            )}

                            <ErrorMessage
                              name={`jurisdictions[${index}].id`}
                              component="small"
                              className="form-text text-danger"
                            />
                          </FormGroup>
                        </div>
                      </fieldset>
                    ))}
                    {values.interventionType === InterventionType.IRS && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm mb-5 addJurisdiction"
                        onClick={() => arrayHelpers.push(initialJurisdictionValues)}
                      >
                        Add Focus Area
                      </button>
                    )}
                  </div>
                )}
              />
            </div>

            {values.interventionType === InterventionType.FI && (
              <FormGroup>
                <Label for="fiStatus">Focus Investigation Status</Label>
                <Field
                  required={values.interventionType === InterventionType.FI}
                  component="select"
                  name="fiStatus"
                  id="fiStatus"
                  disabled={disabledFields.includes('fiStatus')}
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
                  required={values.interventionType === InterventionType.FI}
                  component="select"
                  name="fiReason"
                  id="fiReason"
                  disabled={disabledFields.includes('fiReason')}
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
                  required={
                    values.interventionType === InterventionType.FI &&
                    values.fiReason === FIReasons[1]
                  }
                  type="text"
                  name="caseNum"
                  id="caseNum"
                  disabled={disabledFields.includes('caseNum')}
                  className={errors.caseNum ? 'form-control is-invalid' : 'form-control'}
                />
                <ErrorMessage name="caseNum" component="small" className="form-text text-danger" />

                <Field type="hidden" name="opensrpEventId" id="opensrpEventId" readOnly={true} />
              </FormGroup>
            )}
            <FormGroup>
              <Label for="title">Plan Title</Label>
              <Field
                required={true}
                type="text"
                name="title"
                id="title"
                disabled={disabledFields.includes('title')}
                className={errors.name || errors.title ? 'form-control is-invalid' : 'form-control'}
              />
              <ErrorMessage name="title" component="small" className="form-text text-danger" />

              <Field type="hidden" name="name" id="name" />
              <Field type="hidden" name="identifier" id="identifier" readOnly={true} />
              <Field type="hidden" name="version" id="version" readOnly={true} />
            </FormGroup>
            <FormGroup>
              <Label for="status">Status</Label>
              <Field
                required={true}
                component="select"
                name="status"
                id="status"
                disabled={disabledFields.includes('status')}
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
                required={true}
                type="date"
                name="start"
                id="start"
                disabled={disabledFields.includes('start')}
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
                required={true}
                type="date"
                name="end"
                id="end"
                disabled={disabledFields.includes('end')}
                dateFormat={DATE_FORMAT}
                className={errors.end ? 'form-control is-invalid' : 'form-control'}
                component={DatePickerWrapper}
                minDate={values.start}
              />
              <ErrorMessage name="end" component="small" className="form-text text-danger" />
            </FormGroup>
            <h4 className="mt-5">Activities</h4>
            <FieldArray
              name="activities"
              /* tslint:disable-next-line jsx-no-lambda */
              render={arrayHelpers => (
                <div>
                  {values.activities.map((activity, index) => (
                    <fieldset key={index}>
                      <legend>{values.activities[index].actionTitle}</legend>
                      {errors.activities && errors.activities[index] && (
                        <div className="alert alert-danger" role="alert">
                          <h5 className="alert-heading">Please fix these errors</h5>
                          <ul className="list-unstyled">
                            {Object.entries(errors.activities[index] || {}).map(([key, val]) => (
                              <li key={key}>
                                <strong>{key}</strong>: {val}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <FormGroup>
                        <Label for={`activities-${index}-actionTitle`}>Action</Label>
                        <Field
                          type="text"
                          name={`activities[${index}].actionTitle`}
                          id={`activities-${index}-actionTitle`}
                          required={true}
                          disabled={disabledFields.includes('activities')}
                          className={
                            errors.activities &&
                            doesFieldHaveErrors('actionTitle', index, errors.activities)
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
                        />
                        <ErrorMessage
                          name={`activities[${index}].actionTitle`}
                          component="small"
                          className="form-text text-danger"
                        />

                        <Field
                          type="hidden"
                          name={`activities[${index}].actionCode`}
                          id={`activities-${index}-actionCode`}
                          value={values.activities[index].actionCode}
                          readOnly={true}
                        />
                        <Field
                          type="hidden"
                          name={`activities[${index}].actionIdentifier`}
                          id={`activities-${index}-actionIdentifier`}
                          value={values.activities[index].actionIdentifier}
                          readOnly={true}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities-${index}-actionDescription`}>Description</Label>
                        <Field
                          component="textarea"
                          name={`activities[${index}].actionDescription`}
                          id={`activities-${index}-actionDescription`}
                          required={true}
                          disabled={disabledFields.includes('activities')}
                          className={
                            errors.activities &&
                            doesFieldHaveErrors('actionDescription', index, errors.activities)
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
                        />
                        <ErrorMessage
                          name={`activities[${index}].actionDescription`}
                          component="small"
                          className="form-text text-danger"
                        />
                        <Field
                          type="hidden"
                          name={`activities[${index}].goalDescription`}
                          id={`activities-${index}-goalDescription`}
                          value={values.activities[index].actionDescription}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities-${index}-goalValue`}>Quantity</Label>
                        <Field
                          type="number"
                          name={`activities[${index}].goalValue`}
                          id={`activities-${index}-goalValue`}
                          required={true}
                          disabled={disabledFields.includes('activities')}
                          className={
                            errors.activities &&
                            doesFieldHaveErrors('goalValue', index, errors.activities)
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
                        />
                        <ErrorMessage
                          name={`activities[${index}].goalValue`}
                          component="small"
                          className="form-text text-danger"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities-${index}-timingPeriodStart`}>Start Date</Label>
                        <Field
                          type="date"
                          name={`activities[${index}].timingPeriodStart`}
                          id={`activities-${index}-timingPeriodStart`}
                          required={true}
                          disabled={disabledFields.includes('activities')}
                          dateFormat={DATE_FORMAT}
                          className={
                            errors.activities &&
                            doesFieldHaveErrors('timingPeriodStart', index, errors.activities)
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
                          component={DatePickerWrapper}
                          minDate={values.start}
                          maxDate={values.end}
                        />
                        <ErrorMessage
                          name={`activities[${index}].timingPeriodStart`}
                          component="small"
                          className="form-text text-danger"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities-${index}-timingPeriodEnd`}>End Date</Label>
                        <Field
                          type="date"
                          name={`activities[${index}].timingPeriodEnd`}
                          id={`activities-${index}-timingPeriodEnd`}
                          required={true}
                          disabled={disabledFields.includes('activities')}
                          dateFormat={DATE_FORMAT}
                          className={
                            errors.activities &&
                            doesFieldHaveErrors('timingPeriodEnd', index, errors.activities)
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
                          component={DatePickerWrapper}
                          minDate={values.activities[index].timingPeriodStart}
                          maxDate={values.end}
                        />
                        <ErrorMessage
                          name={`activities[${index}].timingPeriodEnd`}
                          component="small"
                          className="form-text text-danger"
                        />
                        <Field
                          type="hidden"
                          name={`activities[${index}].goalDue`}
                          id={`activities-${index}-goalDue`}
                          value={values.activities[index].timingPeriodEnd}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`activities-${index}-actionReason`}>Reason</Label>
                        <Field
                          component="select"
                          name={`activities[${index}].actionReason`}
                          id={`activities-${index}-actionReason`}
                          required={true}
                          disabled={disabledFields.includes('activities')}
                          className={
                            errors.activities &&
                            doesFieldHaveErrors('actionReason', index, errors.activities)
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
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
                        <Label for={`activities-${index}-goalPriority`}>Priority</Label>
                        <Field
                          component="select"
                          name={`activities[${index}].goalPriority`}
                          id={`activities-${index}-goalPriority`}
                          required={true}
                          disabled={disabledFields.includes('activities')}
                          className={
                            errors.activities &&
                            doesFieldHaveErrors('goalPriority', index, errors.activities)
                              ? 'form-control is-invalid'
                              : 'form-control'
                          }
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
                    </fieldset>
                  ))}
                </div>
              )}
            />
            <hr className="mb-2" />
            <Button
              type="submit"
              id="planform-submit-button"
              className="btn btn-block"
              color="primary"
              aria-label="Save Plan"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? SAVING : 'Save Plan'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const defaultProps: PlanFormProps = {
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: PLAN_LIST_URL,
};

PlanForm.defaultProps = defaultProps;

export default PlanForm;
