import { ErrorMessage, Form, Formik } from 'formik';
import Papaparse from 'papaparse';
import React, { useState } from 'react';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import {
  DOWNLOAD,
  DOWNLOAD_FILE,
  DOWNLOADING,
  FILE,
  FILE_DOWNLOADED_SUCCESSFULLY,
  IDENTIFIER,
  JURISDICTION_METADATA,
  REQUIRED,
  SELECT,
} from '../../../configs/lang';
import {
  JURISDICTION_METADATA_COVERAGE,
  JURISDICTION_METADATA_RISK,
  OPENSRP_V2_SETTINGS,
} from '../../../constants';
import { downloadFile as download, growl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

/** yup validation schema for Jurisdiction Metadata Form input */
export const JurisdictionSchema = Yup.object().shape({
  identifier: Yup.string().required(REQUIRED),
});

/** interface for Jurisdiction metadata file */
export interface JurisdictionMetadataFile {
  jurisdiction_id: string;
  jurisdiction_name: string;
  [property: string]: string;
}

/** interface for Jurisdiction metadata response */
export interface JurisdictionMetadataResponse {
  key: string;
  value: string;
  label: string;
  description?: string;
  uuid: string;
  settingsId: string;
  settingIdentifier: string;
  settingMetadataId: string;
  teamId?: string;
  providerId?: string;
  locationId?: string;
  v1Settings: boolean;
  resolveSettings: boolean;
  documentId: string;
  serverVersion: number;
  type: string;
}

/** interface for each select dropdown option */
export interface Option {
  label: string;
  value: string;
}

export interface JurisdictionMetadataDownloadFormFields {
  identifier: Option;
}

export interface JurisdictionMetadataDownloadFormProps {
  disabledFields: string[];
  serviceClass: OpenSRPService;
  submitForm: (
    setSubmitting: (isSubmitting: boolean) => void,
    setGlobalError: (errorMessage: string) => void,
    props: JurisdictionMetadataDownloadFormProps,
    values: JurisdictionMetadataDownloadFormFields
  ) => void;
  initialValues: JurisdictionMetadataDownloadFormFields;
}

export const defaultInitialValues: JurisdictionMetadataDownloadFormFields = {
  identifier: { label: '', value: '' },
};

const createCsv = (entries: JurisdictionMetadataFile[]): void => {
  const csv: string = Papaparse.unparse(entries, {
    header: true,
  });
  // download file
  download(csv, JURISDICTION_METADATA, 'text/csv');
};

const downloadFile = (response: JurisdictionMetadataResponse[]) => {
  const entries: JurisdictionMetadataFile[] = [];
  response.forEach(item => {
    const metaType = item.settingIdentifier.replace('jurisdiction_metadata-', '');
    const entry: JurisdictionMetadataFile = {
      jurisdiction_id: item.key,
      jurisdiction_name: item.label,
      [metaType]: item.value,
    };
    entries.push(entry);
  });
  createCsv(entries);
};

export const submitForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  props: JurisdictionMetadataDownloadFormProps,
  values: JurisdictionMetadataDownloadFormFields
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
        type: toast.TYPE.SUCCESS,
      });
      setSubmitting(false);
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};

const JurisdictionMetadataDownloadForm = (props: JurisdictionMetadataDownloadFormProps) => {
  const { initialValues } = props;
  const [globalError, setGlobalError] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  const identifierOptions = [
    { value: JURISDICTION_METADATA_RISK, label: 'Risk' },
    { value: JURISDICTION_METADATA_COVERAGE, label: 'Coverage' },
  ];

  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        validationSchema={JurisdictionSchema}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting }) => {
          props.submitForm(setSubmitting, setGlobalError, props, values);
        }}
      >
        {({ errors, isSubmitting, setFieldValue }) => (
          <Form className="mb-5" data-testid="form">
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>
            <FormGroup>
              <Select
                defaultOptions={true}
                options={identifierOptions}
                // tslint:disable-next-line: jsx-no-lambda
                onChange={(value: ValueType<{ value: string; label: string }>) => {
                  setFieldValue('identifier', value);
                  setDisabled(false);
                }}
                className={errors.identifier ? `invalid` : ``}
                isSearchable={true}
                isClearable={true}
                placeholder={`${SELECT} ${IDENTIFIER}`}
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
              id="jurisdiction-metadata-download-form-submit-button"
              className="btn btn-primary"
              aria-label={DOWNLOAD_FILE}
              disabled={isSubmitting || Object.keys(errors).length > 0 || disabled}
            >
              {isSubmitting ? DOWNLOADING : `${DOWNLOAD} ${FILE}`}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const defaultProps: JurisdictionMetadataDownloadFormProps = {
  disabledFields: [],
  initialValues: defaultInitialValues,
  serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
  submitForm,
};

JurisdictionMetadataDownloadForm.defaultProps = defaultProps;
export default JurisdictionMetadataDownloadForm;
