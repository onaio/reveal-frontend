import { ErrorMessage, Field, Form, Formik } from 'formik';
import moment from 'moment';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  ACTIVE,
  NAME,
  NO,
  OPENSRP_ORGANIZATION_ENDPOINT,
  ORGANIZATION_LABEL,
  ORGANIZATIONS_LIST_URL,
  REQUIRED,
  SAVE,
  SAVING,
  YES,
} from '../../../constants';
import { generateNameSpacedUUID } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

const OrgFormNameSpace = '9a4c8cb0-df70-11e9-b38b-57f114a50538';

/** default type value for organizations */
const defaultOrganizationType = {
  coding: [
    {
      code: 'team',
      display: 'Team',
      system: 'http://terminology.hl7.org/CodeSystem/organization-type',
    },
  ],
};

/** yup validation schema for teams Form input */
export const OrgSchema = Yup.object().shape({
  active: Yup.boolean(),
  identifier: Yup.string(),
  name: Yup.string().required(REQUIRED),
});

/** interface for data fields for team's form */
export interface OrganizationFormFields {
  active: boolean;
  identifier: string;
  name: string;
  type: typeof defaultOrganizationType;
}

/** interface for Organization form props */
export interface OrganizationFormProps {
  disabledFields: string[];
  initialValues: OrganizationFormFields;
  redirectAfterAction: string;
}

export const defaultInitialValues: OrganizationFormFields = {
  active: false,
  identifier: '',
  name: '',
  type: defaultOrganizationType,
};

// TODO - indicator that a team has been added to store??
/** Organization form component */
const OrganizationForm = (props: OrganizationFormProps) => {
  /** track when redirection from this form page should occur */
  const [ifDoneHere, setIfDoneHere] = useState<boolean>(false);
  const { initialValues, redirectAfterAction, disabledFields } = props;
  const [globalError, setGlobalError] = useState<string>('');

  /** edit mode set to true if we are updating a team data. */
  const editMode: boolean = initialValues.identifier !== '';

  return (
    <div className="form-container">
      {ifDoneHere && <Redirect to={redirectAfterAction} />}
      <Formik
        initialValues={initialValues}
        validationSchema={OrgSchema}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting, setFieldValue }) => {
          const organizationService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
          const identifier = generateNameSpacedUUID(`${moment().toString()}`, OrgFormNameSpace);
          const valuesToSend = {
            ...values,
            identifier,
          };

          if (editMode) {
            // 2 calls for each for updating team information and updating practitioner_role table
            organizationService
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
            organizationService
              .create(valuesToSend)
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
        {({ errors, isSubmitting, setFieldValue, values }) => (
          <Form className="mb-5">
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
              id="team-form-submit-button"
              className="btn btn-block btn btn-primary"
              aria-label="Save Team"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? SAVING : `${SAVE} ${ORGANIZATION_LABEL}`}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const defaultProps: OrganizationFormProps = {
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: ORGANIZATIONS_LIST_URL,
};

OrganizationForm.defaultProps = defaultProps;
export default OrganizationForm;
