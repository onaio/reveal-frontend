import { ErrorMessage, Field, Form, Formik } from 'formik';
import moment from 'moment';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PRACTITIONER_ROLE_ENDPOINT,
  REQUIRED,
  SAVING,
  TEAM_LIST_URL,
} from '../../../constants';
import { generateNameSpacedUUID } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

const TeamFormNameSpace = '9a4c8cb0-df70-11e9-b38b-57f114a50538';

/** default type value for organizations */
const defaultOrganizationType = {
  type: {
    coding: [
      {
        code: 'team',
        display: 'Team',
        system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      },
    ],
  },
};

/** yup validation schema for teams Form input */
export const TeamSchema = Yup.object().shape({
  active: Yup.boolean(),
  identifier: Yup.string(),
  name: Yup.string().required(REQUIRED),
});

/** interface for data fields for team's form */
interface TeamFormFields {
  active: boolean;
  identifier: string;
  name: string;
  type?: any;
}

/** interface for Team form props */
export interface TeamFormProps {
  disabledFields: string[];
  initialValues: TeamFormFields;
  redirectAfterAction: string;
}

export const defaultInitialValues: TeamFormFields = {
  active: false,
  identifier: '',
  name: '',
  type: defaultOrganizationType,
};

// TODO - indicator that a team has been added to store??
/** Team form component */
const TeamForm = (props: TeamFormProps) => {
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
        validationSchema={TeamSchema}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting, setFieldValue }) => {
          const organizationService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
          setFieldValue(
            'identifier',
            generateNameSpacedUUID(`${moment().toString()}`, TeamFormNameSpace)
          );

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
        {({ errors, isSubmitting, setFieldValue, values }) => (
          <Form className="mb-5">
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>
            <FormGroup>
              <Label>Name</Label>
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
              id="team-form-submit-button"
              className="btn btn-block btn btn-primary"
              aria-label="Save Team"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? SAVING : 'Save Team'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const defaultProps: TeamFormProps = {
  disabledFields: ['identifier'],
  initialValues: defaultInitialValues,
  redirectAfterAction: TEAM_LIST_URL,
};

TeamForm.defaultProps = defaultProps;
export default TeamForm;
