import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import AsyncSelect from 'react-select/async';

import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  ACTIVE,
  ID,
  NAME,
  OPENSRP_PRACTITIONER_ENDPOINT,
  PRACTITIONER,
  REQUIRED,
  SAVE,
  SAVING,
} from '../../../constants';
import { generateNameSpacedUUID } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

/** Namespace for generating uuids */
const PractitionerFormNameSpace = '78295ac0-df73-11e9-a54b-dbf5e5b2d668';

/** props for userIdSelect */
interface UserIdSelectProps {
  serviceClass: typeof OpenSRPService;
  onChangeHandler?: (value: string) => void;
}

/** default props for userIdSelectProps */
const defaultUserIdSelectProps = {
  serviceClass: OpenSRPService,
};

/** userIdSelect component - wraps around asyncSelect to provide a select
 * input component from which users can select an openMRS id when adding a practitioner
 * for the moment : this will be disabled for editing a practitioner.
 */
const UserIdSelect: React.FC<UserIdSelectProps> = props => {
  const { serviceClass, onChangeHandler } = props;
  const formatOptions = (entries: any[]): Array<{ label: string; value: string }> => {
    return entries.map(entry => ({ label: entry.username, value: entry.identifier }));
  };

  /** handles value changes in the async select */
  const changeHandler = (value: any) => {
    if (typeof onChangeHandler !== 'undefined') {
      onChangeHandler(value.label);
    }
  };

  /** returns promise that resolve with fetched openMRs user-data */
  const promiseOptions = async () => {
    const serve = new serviceClass('');
    const options = await serve.list();
    return formatOptions(options);
  };

  return (
    <AsyncSelect
      cacheOptions={true}
      defaultOptions={true}
      loadOptions={promiseOptions}
      onChange={changeHandler}
    />
  );
};

UserIdSelect.defaultProps = defaultUserIdSelectProps;

export interface PractitionerFormFields {
  identifier: string;
  active: boolean;
  name: string;
  userId: string;
  username: string;
}

/** Initial values for practitioner's form */
export const defaultInitialValues = {
  active: false,
  identifier: '',
  name: '',
  userId: '',
  username: '',
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
  initialValues: PractitionerFormFields;
  disabledFields: string[];
  redirectAfterAction: string;
  serviceClass: typeof OpenSRPService;
}
/** default values for practitioner form props */
const defaultPractitionerFormProps: PractitionerFormProps = {
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: '/teams',
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

  return (
    <div className="form-container">
      {ifDoneHere && <Redirect to={redirectAfterAction} />}
      <Formik
        initialValues={initialValues}
        validationSchema={PractitionerSchema}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting, setFieldValue }) => {
          setFieldValue('identifier', generateNameSpacedUUID(``, PractitionerFormNameSpace));
          const apiService = new props.serviceClass(OPENSRP_PRACTITIONER_ENDPOINT);

          if (editMode) {
            apiService
              .update(values)
              .then(() => {
                setSubmitting(false);
                setIfDoneHere(true);
              })
              .catch((e: Error) => {
                setGlobalError(e.message);
                setSubmitting(false);
              });
          } else {
            apiService
              .create(values)
              .then(() => {
                setSubmitting(false);
                setIfDoneHere(true);
              })
              .catch((e: Error) => {
                setGlobalError(e.message);
                setSubmitting(false);
              });
          }
        }}
      >
        {({ errors, isSubmitting, values, setFieldValue }) => (
          <Form className="mb-5">
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>

            <FormGroup>
              <Label>{`${NAME}`}</Label>
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

            <FormGroup>
              <Label>Username</Label>
              <Field
                type="text"
                name="username"
                id="username"
                disabled={disabledFields.includes('username')}
                className={errors.identifier ? `form-control is-invalid` : `form-control`}
              />
              <ErrorMessage
                component="small"
                name="username"
                className="form-text text-danger username-error"
              />
            </FormGroup>
            <FormGroup>
              <Label for="userId"> openMRS username </Label>
              <Field
                required={true}
                component={UserIdSelect}
                // tslint:disable-next-line: jsx-no-lambda
                onChangeHandler={(value: string) => setFieldValue('userId', value)}
                name="userId"
                id="userId"
                placeholder="Select username form openMRS"
                aria-label="Select username form openMRS"
                disabled={disabledFields.includes('userId') || editMode}
                className={errors.userId ? 'is-invalid async-select' : 'async-select'}
              />

              <ErrorMessage
                name="userId"
                component="small"
                className="form-text text-danger userId-error"
              />
            </FormGroup>

            <FormGroup>
              <Label>Active</Label>
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
                  no
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
                  yes
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
              aria-Label="Save Practitioner"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? SAVING : `${SAVE} ${PRACTITIONER}`}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

PractitionerForm.defaultProps = defaultPractitionerFormProps;

export default PractitionerForm;
