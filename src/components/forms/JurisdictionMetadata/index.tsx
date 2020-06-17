import { ErrorMessage, Field, Form, Formik } from 'formik';
import Papaparse from 'papaparse';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { toast } from 'react-toastify';
import { Button, Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  CSV_FILE,
  FILE,
  FILE_UPLOADED_SUCCESSFULLY,
  JURISDICTION_ID,
  JURISDICTION_METADATA,
  JURISDICTION_NAME,
  REQUIRED,
  UPLOAD,
  UPLOAD_FILE,
  UPLOADING,
} from '../../../configs/lang';
import { HOME_URL, OPENSRP_V1_SETTINGS_ENDPOINT } from '../../../constants';
import { growl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

const SUPPORTED_FORMATS = ['text/csv'];

/** yup validation schema for Jurisdiction Metadata Form input */
export const JurisdictionSchema = Yup.object().shape({
  file: Yup.mixed()
    .required(REQUIRED)
    .test('fileFormat', 'CSV Files only', value => value && SUPPORTED_FORMATS.includes(value.type)),
});

export interface JurisdictionMetadataFormFields {
  file: File;
}

export interface Setting {
  description: string;
  label: string;
  value: string | unknown;
  key: string;
}

export interface SettingConfiguration {
  type: string;
  identifier: string;
  providerId: string;
  locationId: string;
  settings: Setting[];
  teamId: string;
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

// create payloads for sending
const createPayloads = (result: any): SettingConfiguration[] => {
  const payloads: SettingConfiguration[] = [];
  const { data } = result;
  // check if jurisdiction_id exists
  if (data.length > 0 && data[0].jurisdiction_id) {
    // get the metadata items
    const headers = Object.keys(data[0]);
    for (const header of headers) {
      const settings: Setting[] = [];
      if (header !== JURISDICTION_ID && header !== JURISDICTION_NAME) {
        // add the metadata values with jurisdiction as the key
        for (const item of data) {
          const entries = Object.entries(item);
          for (const [key, value] of entries) {
            if (key === header) {
              const setting: Setting = {
                description: `${JURISDICTION_METADATA} for ${item.jurisdiction_name} id ${item.jurisdiction_id}`,
                key: item.jurisdiction_id,
                label: `${item.jurisdiction_name} metadata`,
                value,
              };
              settings.push(setting);
            }
          }
        }
        const payload: SettingConfiguration = {
          identifier: `jurisdiction_metadata-${header}`,
          locationId: '',
          providerId: 'demo',
          settings,
          teamId: '',
          type: 'SettingConfiguration',
        };
        payloads.push(payload);
      }
    }
  }
  return payloads;
};

// read csv and convert to json
const handleFile = (file: File, complete: (results: any) => any) => {
  Papaparse.parse(file, {
    complete: results => {
      complete(results);
    },
    header: true,
  });
};

export const submitForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  setIfDoneHere: (closeSubmissionCycle: boolean) => void,
  props: JurisdictionMetadataFormProps,
  values?: JurisdictionMetadataFormFields
) => {
  if (values) {
    const jurisdictionService = new props.OpenSRPService(OPENSRP_V1_SETTINGS_ENDPOINT);
    handleFile(values.file, results => {
      const payloads: SettingConfiguration[] = createPayloads(results);
      if (payloads.length > 0) {
        // loop through payloads and send
        for (const payload of payloads) {
          const valuesToSend = JSON.stringify(payload);
          jurisdictionService
            .create(valuesToSend)
            .then(() => {
              growl(FILE_UPLOADED_SUCCESSFULLY, {
                onClose: () => setIfDoneHere(true),
                type: toast.TYPE.SUCCESS,
              });
            })
            .catch((e: Error) => {
              setGlobalError(e.message);
            });
        }
        setSubmitting(false);
      } else {
        setGlobalError('Invalid CSV');
        setSubmitting(false);
      }
    });
  }
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
        {({ errors, isSubmitting, setFieldValue }) => (
          <Form className="mb-5" data-testid="form">
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>
            <FormGroup>
              <Label>{CSV_FILE}</Label>
              <Field
                type="file"
                name="csv file"
                id="file"
                accept=".csv"
                disabled={disabledFields.includes('file')}
                // tslint:disable-next-line: jsx-no-lambda
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue(
                    'file',
                    event && event.target && event.target.files && event.target.files[0]
                  );
                }}
                className={errors.file ? `form-control is-invalid` : `form-control`}
                data-testid="file"
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

const defaultProps: JurisdictionMetadataFormProps = {
  OpenSRPService,
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: HOME_URL,
  submitForm,
};

JurisdictionMetadataForm.defaultProps = defaultProps;
export default JurisdictionMetadataForm;
