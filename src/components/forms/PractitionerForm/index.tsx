import { ErrorMessage, Field, Form, Formik } from 'formik';
import moment from 'moment';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { toast } from 'react-toastify';
import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import { PRACTITIONER_FORM_NAMESPACE } from '../../../configs/env';
import {
  ACTIVE,
  NAME,
  NO,
  PRACTITIONER_CREATED_SUCCESSFULLY,
  PRACTITIONER_EDITED_SUCCESSFULLY,
  REQUIRED,
  SAVE_PRACTITIONER,
  SAVING,
  SELECT_USERNAME,
  USERNAME,
  YES,
} from '../../../configs/lang';
import { OPENSRP_PRACTITIONER_ENDPOINT, PRACTITIONERS_LIST_URL } from '../../../constants';
import { generateNameSpacedUUID, growl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import { Practitioner } from '../../../store/ducks/opensrp/practitioners';
import UserIdSelect, { OptionTypes } from './UserIdSelect';

export interface PractitionerFormFields {
  identifier: string;
  active: boolean;
  name: string | undefined;
  userId: string | undefined;
  username: string | undefined;
}

/** Initial values for practitioner's form */
export const defaultInitialValues: PractitionerFormFields = {
  active: false,
  identifier: '',
  name: undefined,
  userId: undefined,
  username: undefined,
};

/** yup validations for practitioner data object from form */
export const PractitionerSchema = Yup.object().shape({
  active: Yup.boolean(),
  identifier: Yup.string(),
  name: Yup.string().required(REQUIRED),
  userId: Yup.string().required(REQUIRED),
  username: Yup.string().required(REQUIRED),
});

/** interface for props to Practitioner form */
export interface PractitionerFormProps {
  allPractitioners: Practitioner[];
  initialValues: PractitionerFormFields;
  disabledFields: string[];
  redirectAfterAction: string;
  serviceClass: typeof OpenSRPService;
}
/** default values for practitioner form props */
const defaultPractitionerFormProps: PractitionerFormProps = {
  allPractitioners: [],
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: PRACTITIONERS_LIST_URL,
  serviceClass: OpenSRPService,
};

/** PractitionerForm: Used to add or edit a practitioner */
const PractitionerForm = (props: PractitionerFormProps) => {
  /** track when redirection from this form page should occur */
  const [ifDoneHere, setIfDoneHere] = useState<boolean>(false);
  const { initialValues, redirectAfterAction, disabledFields } = props;
  const [globalError, setGlobalError] = useState<string>('');

  /** edit mode set to true if we are updating a practitioner data. */
  const editMode: boolean = initialValues.identifier !== '';

  // add list of practitioners
  UserIdSelect.defaultProps.allPractitioners = props.allPractitioners;

  return (
    <div className="form-container">
      {ifDoneHere && <Redirect to={redirectAfterAction} />}
      <Formik
        initialValues={initialValues}
        validationSchema={PractitionerSchema}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting }) => {
          if (editMode) {
            const apiService = new props.serviceClass(OPENSRP_PRACTITIONER_ENDPOINT);
            apiService
              .update(values)
              .then(() => {
                setSubmitting(false);
                growl(PRACTITIONER_EDITED_SUCCESSFULLY, {
                  onClose: () => setIfDoneHere(true),
                  type: toast.TYPE.SUCCESS,
                });
              })
              .catch((e: Error) => {
                setGlobalError(e.message);
                setSubmitting(false);
              });
          } else {
            const apiService = new props.serviceClass(OPENSRP_PRACTITIONER_ENDPOINT);
            const identifier = generateNameSpacedUUID(
              `${moment().toString()}`,
              PRACTITIONER_FORM_NAMESPACE
            );
            const valuesToSend = {
              ...values,
              identifier,
            };
            apiService
              .create(valuesToSend)
              .then(() => {
                setSubmitting(false);
                growl(PRACTITIONER_CREATED_SUCCESSFULLY, {
                  onClose: () => setIfDoneHere(true),
                  type: toast.TYPE.SUCCESS,
                });
                // setIfDoneHere(true);
              })
              .catch((e: Error) => {
                setGlobalError(e.message);
                setSubmitting(false);
              });
          }
        }}
      >
        {({ errors, isSubmitting, values, setFieldValue }) => (
          <Form>
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>

            <FormGroup>
              <Label>{NAME}</Label>
              <Field
                type="text"
                name="name"
                id="name"
                disabled={disabledFields.includes('name')}
                className={errors.name ? `form-control is-invalid` : `form-control`}
              />
              <ErrorMessage
                name="name"
                component="small"
                className="form-text text-danger name-error"
              />
            </FormGroup>

            {!editMode ? (
              <FormGroup>
                <Label for="userId"> {USERNAME} </Label>
                <Field
                  required={true}
                  component={UserIdSelect}
                  // tslint:disable-next-line: jsx-no-lambda
                  onChangeHandler={(option: OptionTypes) => {
                    if (option) {
                      setFieldValue('username', option.label);
                      setFieldValue('userId', option.value);
                    } else {
                      setFieldValue('username', undefined);
                      setFieldValue('userId', undefined);
                    }
                  }}
                  name="userId"
                  id="userId"
                  placeholder={SELECT_USERNAME}
                  aria-label={SELECT_USERNAME}
                  disabled={disabledFields.includes('userId') || editMode}
                  className={errors.userId ? 'is-invalid async-select' : 'async-select'}
                />

                <ErrorMessage
                  name="userId"
                  component="small"
                  className="form-text text-danger userId-error"
                />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>{USERNAME}</Label>
                <Field
                  readOnly={true}
                  type="text"
                  name="username"
                  id="username"
                  disabled={disabledFields.includes('username')}
                  className={errors.username ? `form-control is-invalid` : `form-control`}
                />
                <ErrorMessage
                  component="small"
                  name="username"
                  className="form-text text-danger username-error"
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>{ACTIVE}</Label>
              <br />
              <div className="btn-group btn-group-toggle" data-toggle="buttons">
                <label
                  className={`btn btn-outline-secondary ${values.active === false ? 'active' : ''}`}
                >
                  <Field
                    type="radio"
                    name="active"
                    id="no"
                    // tslint:disable-next-line: jsx-no-lambda
                    onChange={() => setFieldValue('active', false)}
                  />{' '}
                  {NO}
                </label>
                <label
                  className={`btn btn-outline-primary ${values.active === true ? 'active' : ''}`}
                >
                  <Field
                    type="radio"
                    name="active"
                    id="yes"
                    // tslint:disable-next-line: jsx-no-lambda
                    onChange={() => setFieldValue('active', true)}
                  />{' '}
                  {YES}
                </label>
                <ErrorMessage
                  name="active"
                  component="small"
                  className="form-text text-danger active-error"
                />
              </div>
            </FormGroup>

            <hr className="mb-2" />
            <Button
              type="submit"
              id="practitioner-form-submit-button"
              className="btn btn-block btn btn-primary"
              aria-label="Save Practitioner"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? SAVING : SAVE_PRACTITIONER}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

PractitionerForm.defaultProps = defaultPractitionerFormProps;

export default PractitionerForm;
