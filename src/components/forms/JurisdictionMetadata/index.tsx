import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { toast } from 'react-toastify';
import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  FILE,
  FILE_UPLOADED_SUCCESSFULLY,
  REQUIRED,
  SAVE,
  SAVE_FILE,
  SAVING,
} from '../../../configs/lang';
import { HOME_URL, OPENSRP_SETTINGS_ENDPOINT } from '../../../constants';
import { growl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

const SUPPORTED_FORMATS = ['text/csv'];

/** yup validation schema for teams Form input */
export const JurisdictionSchema = Yup.object().shape({
  csvFile: Yup.mixed()
    .required(REQUIRED)
    .test('fileFormat', 'CSV Files only', value => value && SUPPORTED_FORMATS.includes(value.type)),
});

export interface JurisdictionMetadataFormFields {
  file: File;
}

export interface JurisdictionMetadataFormProps {
  disabledFields: string[];
  OpenSRPService: new (...args: any[]) => any;
  submitForm: (
    setSubmitting: (isSubmitting: boolean) => void,
    setGlobalError: (errorMessage: string) => void,
    setIfDoneHere: (closeSubmissionCycle: boolean) => void,
    props: JurisdictionMetadataFormProps,
    values?: JurisdictionMetadataFormFields
  ) => void;
  initialValues: JurisdictionMetadataFormFields;
  redirectAfterAction: string;
}

export const defaultInitialValues: JurisdictionMetadataFormFields = {
  file: new File([], ''),
};

export const submitForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  setIfDoneHere: (closeSubmissionCycle: boolean) => void,
  props: JurisdictionMetadataFormProps,
  values?: JurisdictionMetadataFormFields
) => {
  const jurisdictionService = new props.OpenSRPService(OPENSRP_SETTINGS_ENDPOINT);
  const valuesToSend = {
    ...values,
  };
  jurisdictionService
    .create(valuesToSend)
    .then(() => {
      setSubmitting(false);
      growl(FILE_UPLOADED_SUCCESSFULLY, {
        onClose: () => setIfDoneHere(true),
        type: toast.TYPE.SUCCESS,
      });
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};
const JurisdictionMetadataForm = (props: JurisdictionMetadataFormProps) => {
  /** track when redirection from this form page should occur */
  const [ifDoneHere, setIfDoneHere] = useState<boolean>(false);
  const { initialValues, redirectAfterAction, disabledFields } = props;
  const [globalError, setGlobalError] = useState<string>('');

  return (
    <div className="form-container">
      {ifDoneHere && <Redirect to={redirectAfterAction} />}
      <Formik
        initialValues={initialValues}
        validationSchema={JurisdictionSchema}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting }) => {
          props.submitForm(setSubmitting, setGlobalError, setIfDoneHere, props, values);
        }}
      >
        {({ errors, isSubmitting }) => (
          <Form className="mb-5" data-testid="form">
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>
            <FormGroup>
              <Label>{FILE}</Label>
              <Field
                type="file"
                name="CSV File"
                id="file"
                disabled={disabledFields.includes('csvFile')}
                className={errors.file ? `form-control is-invalid` : `form-control`}
                data-testid="csvFile"
              />
              <ErrorMessage
                name="csvFile"
                component="small"
                className="form-text text-danger name-error"
              />
            </FormGroup>
            <hr className="mb-2" />
            <Button
              type="submit"
              id="jurisdiction-metadata-form-submit-button"
              className="btn btn-block btn btn-primary"
              aria-label={SAVE_FILE}
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? SAVING : `${SAVE} ${FILE}`}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const defaultProps: JurisdictionMetadataFormProps = {
  OpenSRPService,
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: HOME_URL,
  submitForm,
};

JurisdictionMetadataForm.defaultProps = defaultProps;
export default JurisdictionMetadataForm;
