import { ErrorMessage, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import { toast } from 'react-toastify';
import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  FILE,
  FILE_DOWNLOADED_SUCCESSFULLY,
  IDENTIFIER,
  REQUIRED,
  UPLOAD,
  UPLOAD_FILE,
  UPLOADING,
} from '../../../configs/lang';
import {
  HOME_URL,
  JURISDICTION_METADATA_COVERAGE,
  JURISDICTION_METADATA_RISK,
  OPENSRP_V2_SETTINGS,
} from '../../../constants';
import { growl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

/** yup validation schema for Jurisdiction Metadata Form input */
export const JurisdictionSchema = Yup.object().shape({
  identifier: Yup.string().required(REQUIRED),
});
/** interface for each select dropdown option */
export interface Option {
  label: string;
  value: string;
}

export interface JurisdictionMetadataUploadFormFields {
  identifier: Option;
}

export interface JurisdictionMetadataUploadFormProps {
  disabledFields: string[];
  serviceClass: OpenSRPService;
  submitForm: (
    setSubmitting: (isSubmitting: boolean) => void,
    setGlobalError: (errorMessage: string) => void,
    setIfDoneHere: (closeSubmissionCycle: boolean) => void,
    props: JurisdictionMetadataUploadFormProps,
    values: JurisdictionMetadataUploadFormFields
  ) => void;
  initialValues: JurisdictionMetadataUploadFormFields;
  redirectAfterAction: string;
}

export const defaultInitialValues: JurisdictionMetadataUploadFormFields = {
  identifier: { label: '', value: '' },
};

const createCsv = (data: string) => {
  return data;
};

const downloadFile = (response: any) => {
  const data: string = response.data;
  createCsv(data);
};

export const submitForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  setIfDoneHere: (closeSubmissionCycle: boolean) => void,
  props: JurisdictionMetadataUploadFormProps,
  values: JurisdictionMetadataUploadFormFields
) => {
  const { serviceClass } = props;
  const params = {
    identifier: values.identifier.value,
    serverVersion: 0,
  };
  serviceClass
    .list(params)
    .then((response: any) => {
      downloadFile(response);
      growl(FILE_DOWNLOADED_SUCCESSFULLY, {
        onClose: () => setIfDoneHere(true),
        type: toast.TYPE.SUCCESS,
      });
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};

const JurisdictionMetadataUploadForm = (props: JurisdictionMetadataUploadFormProps) => {
  const [ifDoneHere, setIfDoneHere] = useState<boolean>(false);
  const { initialValues, redirectAfterAction } = props;
  const [globalError, setGlobalError] = useState<string>('');
  const identifierOptions = [
    { value: JURISDICTION_METADATA_RISK, label: 'Risk' },
    { value: JURISDICTION_METADATA_COVERAGE, label: 'Coverage' },
  ];

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
        {({ errors, isSubmitting, setFieldValue }) => (
          <Form className="mb-5" data-testid="form">
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>
            <FormGroup>
              <Label>{IDENTIFIER}</Label>
              <Select
                defaultOptions={true}
                options={identifierOptions}
                // tslint:disable-next-line: jsx-no-lambda
                onChange={(value: ValueType<{ value: string; label: string }>) =>
                  setFieldValue('identifier', value)
                }
                className={errors.identifier ? `invalid` : ``}
                isSearchable={true}
                isClearable={true}
                placeholder={IDENTIFIER}
                data-testid="identifier"
              />
              <ErrorMessage
                name={IDENTIFIER}
                component="small"
                className="form-text text-danger name-error"
              />
            </FormGroup>
            <hr className="mb-2" />
            <Button
              type="submit"
              id="jurisdiction-metadata-form-submit-button"
              className="btn btn-block btn btn-primary"
              aria-label={UPLOAD_FILE}
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? UPLOADING : `${UPLOAD} ${FILE}`}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const defaultProps: JurisdictionMetadataUploadFormProps = {
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: HOME_URL,
  serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
  submitForm,
};

JurisdictionMetadataUploadForm.defaultProps = defaultProps;
export default JurisdictionMetadataUploadForm;
