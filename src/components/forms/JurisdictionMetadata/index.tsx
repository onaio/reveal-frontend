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
  CSV_ONLY,
  FILE,
  FILE_FORMAT,
  FILE_UPLOADED_SUCCESSFULLY,
  INVALID_CSV,
  REQUIRED,
  UPLOAD,
  UPLOAD_FILE,
  UPLOADING,
} from '../../../configs/lang';
import {
  APPLICATION_CSV,
  APPLICATION_VND_EXCEL,
  APPLICATION_X_CSV,
  HOME_URL,
  OPENSRP_V1_SETTINGS_ENDPOINT,
  TEXT_COMMA_SEPARATED_VALUES,
  TEXT_CSV,
  TEXT_PLAIN,
  TEXT_TAB_SEPARATED_VALUES,
  TEXT_X_COMMA_SEPARATED_VALUES,
  TEXT_X_CSV,
} from '../../../constants';
import {
  creatSettingsPayloads,
  growl,
  PapaResult,
  SettingConfiguration,
} from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

const SUPPORTED_FORMATS = [
  TEXT_CSV,
  APPLICATION_CSV,
  TEXT_PLAIN,
  TEXT_X_CSV,
  APPLICATION_VND_EXCEL,
  APPLICATION_X_CSV,
  TEXT_COMMA_SEPARATED_VALUES,
  TEXT_X_COMMA_SEPARATED_VALUES,
  TEXT_TAB_SEPARATED_VALUES,
];

/** yup validation schema for Jurisdiction Metadata Form input */
export const JurisdictionSchema = Yup.object().shape({
  file: Yup.mixed()
    .required(REQUIRED)
    .test(FILE_FORMAT, CSV_ONLY, value => value && SUPPORTED_FORMATS.includes(value.type)),
});

export interface JurisdictionMetadataFormFields {
  file: File;
}

export interface JurisdictionMetadataFormProps {
  disabledFields: string[];
  serviceClass: OpenSRPService;
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

// read csv and convert to json
const handleFile = (file: File, complete: (results: PapaResult) => void) => {
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
    handleFile(values.file, results => {
      const { serviceClass } = props;
      const payloads: SettingConfiguration[] = creatSettingsPayloads(results);
      if (payloads.length > 0) {
        const valuesToSend = { settingConfigurations: payloads };
        serviceClass
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
        setSubmitting(false);
      } else {
        setGlobalError(INVALID_CSV);
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
  const [disabled, setDisabled] = useState<boolean>(true);

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
                  setGlobalError('');
                  setDisabled(false);
                  setFieldValue(
                    'file',
                    event && event.target && event.target.files && event.target.files[0]
                  );
                }}
                className={errors.file ? `form-control is-invalid` : `form-control`}
                data-testid="file"
              />
              <ErrorMessage
                name="csv"
                component="small"
                className="form-text text-danger csv-error"
              />
            </FormGroup>
            <hr className="mb-2" />
            <Button
              type="submit"
              id="jurisdiction-metadata-form-submit-button"
              className="btn btn-primary"
              aria-label={UPLOAD_FILE}
              disabled={isSubmitting || Object.keys(errors).length > 0 || disabled}
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
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: HOME_URL,
  serviceClass: new OpenSRPService(OPENSRP_V1_SETTINGS_ENDPOINT),
  submitForm,
};

JurisdictionMetadataForm.defaultProps = defaultProps;
export default JurisdictionMetadataForm;
