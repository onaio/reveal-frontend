import { ErrorMessage, Field, Form, Formik } from 'formik';
import moment from 'moment';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { toast } from 'react-toastify';
import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  ACTIVE,
  NAME,
  NO,
  ORGANIZATION_CREATED_SUCCESSFULLY,
  ORGANIZATION_EDITED_SUCCESSFULLY,
  ORGANIZATION_LABEL,
  REQUIRED,
  SAVE,
  SAVE_TEAM,
  SAVING,
  TEAM,
  YES,
} from '../../../configs/lang';
import { OPENSRP_ORGANIZATION_ENDPOINT, ORGANIZATIONS_LIST_URL } from '../../../constants';
import { generateNameSpacedUUID, growl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

const OrgFormNameSpace = '9a4c8cb0-df70-11e9-b38b-57f114a50538';

/** default type value for organizations */
const defaultOrganizationType = {
  coding: [
    {
      code: 'team',
      display: TEAM,
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
  OpenSRPService: new (...args: any[]) => any;
  submitForm: (
    setSubmitting: (isSubmitting: boolean) => void,
    editMode: boolean,
    setGlobalError: (errorMessage: string) => void,
    setIfDoneHere: (closeSubmissionCycle: boolean) => void,
    props: OrganizationFormProps,
    values?: OrganizationFormFields
  ) => void;
  initialValues: OrganizationFormFields;
  redirectAfterAction: string;
}

export const defaultInitialValues: OrganizationFormFields = {
  active: false,
  identifier: '',
  name: '',
  type: defaultOrganizationType,
};

export const submitForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  editMode: boolean,
  setGlobalError: (errorMessage: string) => void,
  setIfDoneHere: (closeSubmissionCycle: boolean) => void,
  props: OrganizationFormProps,
  values?: OrganizationFormFields
) => {
  if (editMode) {
    const organizationService = new props.OpenSRPService(
      `${OPENSRP_ORGANIZATION_ENDPOINT}/${values && values.identifier}`
    );
    organizationService
      .update(values)
      .then(() => {
        setSubmitting(false);
        growl(ORGANIZATION_EDITED_SUCCESSFULLY, {
          onClose: () => setIfDoneHere(true),
          type: toast.TYPE.SUCCESS,
        });
      })
      .catch((e: Error) => {
        setGlobalError(e.message);
        setSubmitting(false);
      });
  } else {
    const organizationService = new props.OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
    const identifier = generateNameSpacedUUID(`${moment().toString()}`, OrgFormNameSpace);
    const valuesToSend = {
      ...values,
      identifier,
    };
    organizationService
      .create(valuesToSend)
      .then(() => {
        setSubmitting(false);
        growl(ORGANIZATION_CREATED_SUCCESSFULLY, {
          onClose: () => setIfDoneHere(true),
          type: toast.TYPE.SUCCESS,
        });
      })
      .catch((e: Error) => {
        setGlobalError(e.message);
        setSubmitting(false);
      });
  }
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
        onSubmit={(values, { setSubmitting }) => {
          props.submitForm(setSubmitting, editMode, setGlobalError, setIfDoneHere, props, values);
        }}
      >
        {({ errors, isSubmitting, setFieldValue, values }) => (
          <Form className="mb-5" data-testid="form">
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
                data-testid="name"
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
              aria-label={SAVE_TEAM}
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
  OpenSRPService,
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: ORGANIZATIONS_LIST_URL,
  submitForm,
};

OrganizationForm.defaultProps = defaultProps;
export default OrganizationForm;
