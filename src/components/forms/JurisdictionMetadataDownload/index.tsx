import { ErrorMessage, Form, Formik } from 'formik';
import Papaparse from 'papaparse';
import React, { useState } from 'react';
import Select from 'react-select';
import { ValueType } from 'react-select/src/types';
import { Button } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import { ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS } from '../../../configs/env';
import {
  DOWNLOAD,
  DOWNLOAD_FILE,
  DOWNLOADING,
  ERROR_NO_JURISDICTION_METADATA_FOUND,
  FILE,
  FILE_DOWNLOADED_SUCCESSFULLY,
  IDENTIFIER,
  REQUIRED,
  SELECT,
} from '../../../configs/lang';
import { OPENSRP_V2_SETTINGS, TEXT_CSV } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { downloadFile, MetadataOptions, successGrowl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import {
  getAllowedMetaDataIdentifiers,
  JurisdictionsMetaDataIdentifierParams,
  SelectOption,
} from './helpers';

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

/**
 * interface for the Jurisdiction metadata download form fields
 */
export interface JurisdictionMetadataDownloadFormFields {
  identifier: Option;
}

const createCsv = (entries: JurisdictionMetadataFile[], fileName: string): void => {
  const csv: string = Papaparse.unparse(entries, {
    header: true,
  });
  // download file
  downloadFile(csv, fileName, TEXT_CSV);
};

/**
 * Download CSV file from obtained data
 */
export const download = (
  response: JurisdictionMetadataResponse[],
  metadataOption: MetadataOptions
) => {
  if (!response.length) {
    return;
  }

  const entries: JurisdictionMetadataFile[] = [];
  response.forEach(item => {
    const metaType = item.settingIdentifier.replace(`${metadataOption}-`, '');
    const entry: JurisdictionMetadataFile = {
      jurisdiction_id: item.key,
      jurisdiction_name: item.label,
      [metaType]: item.value,
    };
    entries.push(entry);
  });
  createCsv(entries, `${response[0].settingIdentifier}.csv`);
};

/**
 * interface for the Jurisdiction metadata download form props
 */
export interface JurisdictionMetadataDownloadFormProps {
  disabledFields: string[];
  serviceClass: OpenSRPService;
  submitForm: (
    setSubmitting: (isSubmitting: boolean) => void,
    setGlobalError: (errorMessage: string) => void,
    props: JurisdictionMetadataDownloadFormProps,
    values: JurisdictionMetadataDownloadFormFields
  ) => void;
  metadataOption: MetadataOptions;
  identifierOptions?: SelectOption[];
  initialValues: JurisdictionMetadataDownloadFormFields;
}

export const defaultInitialValues: JurisdictionMetadataDownloadFormFields = {
  identifier: { label: '', value: '' },
};

export const submitForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  props: JurisdictionMetadataDownloadFormProps,
  values: JurisdictionMetadataDownloadFormFields
) => {
  const { serviceClass, metadataOption } = props;
  const params = {
    identifier: values.identifier.value,
    serverVersion: 0,
  };
  serviceClass
    .list(params)
    .then((response: JurisdictionMetadataResponse[]) => {
      if (response.length) {
        download(response, metadataOption);
        successGrowl(FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        displayError(new Error(ERROR_NO_JURISDICTION_METADATA_FOUND));
      }

      setSubmitting(false);
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};

/** get enabled identifier options */
const enabledIdentifierOptions = getAllowedMetaDataIdentifiers(
  ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS as JurisdictionsMetaDataIdentifierParams[]
);

const JurisdictionMetadataDownloadForm = (props: JurisdictionMetadataDownloadFormProps) => {
  const { initialValues, identifierOptions } = props;
  const [globalError, setGlobalError] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);

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

/**
 * JurisdictionMetadataDownload - allows a user to download jurisdiction metadata by identifier
 * NOTE: The downloaded data contains Jurisdiction name and Id originally downloaded with the csv
 */
const defaultProps: JurisdictionMetadataDownloadFormProps = {
  disabledFields: [],
  identifierOptions: enabledIdentifierOptions,
  initialValues: defaultInitialValues,
  metadataOption: MetadataOptions.JurisdictionMetadata,
  serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
  submitForm,
};

JurisdictionMetadataDownloadForm.defaultProps = defaultProps;
export default JurisdictionMetadataDownloadForm;
