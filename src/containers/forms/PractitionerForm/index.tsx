import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { ErrorMessage, Field, Form, Formik, yupToFormErrors } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { valueContainerCSS } from 'react-select/src/components/containers';
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

const PractitionerFormNameSpace = '78295ac0-df73-11e9-a54b-dbf5e5b2d668';

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
}

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
          const apiService = new OpenSRPService(OPENSRP_PRACTITIONER_ENDPOINT);

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
                className="form-text text-danger identifier-error"
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
                    id="option2"
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
                    id="option1"
                    // tslint:disable-next-line: jsx-no-lambda
                    onChange={() => setFieldValue('active', true)}
                  />{' '}
                  yes
                </label>
                <ErrorMessage
                  name="active"
                  component="small"
                  className="form-text text-danger name-error"
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
