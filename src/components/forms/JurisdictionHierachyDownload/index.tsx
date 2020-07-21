import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik';
import Papaparse from 'papaparse';
import React, { useState } from 'react';
import { Button, FormGroup } from 'reactstrap';
import JurisdictionSelect, {
  JurisdictionSelectProps,
} from '../../../components/forms/JurisdictionSelect';
import {
  DOWNLOAD,
  DOWNLOAD_FILE,
  DOWNLOADING,
  FILE,
  FILE_DOWNLOADED_SUCCESSFULLY,
  JURISDICTION_HIERARCHY_TEMPLATE,
  SELECT_COUNTRY,
} from '../../../configs/lang';
import { OPENSRP_V2_SETTINGS, TEXT_CSV } from '../../../constants';
import { downloadFile, successGrowl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import { RawOpenSRPHierarchy, TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
import { generateJurisdictionTree } from '../../../store/ducks/opensrp/hierarchies/utils';
import { LOCATION } from '../../TreeWalker/constants';

export interface JurisdictionHierachyFile {
  jurisdiction_id: string;
  jurisdiction_label: string;
}

/** interface for each select dropdown option */
export interface Option {
  id: string;
  name: string;
}

export interface JurisdictionHierachyDownloadFormFields {
  jurisdictions: Option;
}

export interface JurisdictionHierachyDownloadFormProps {
  disabledFields: string[];
  serviceClass: OpenSRPService;
  submitForm: (
    setSubmitting: (isSubmitting: boolean) => void,
    setGlobalError: (errorMessage: string) => void,
    props: JurisdictionHierachyDownloadFormProps,
    values: JurisdictionHierachyDownloadFormFields
  ) => void;
  initialValues: JurisdictionHierachyDownloadFormFields;
}

export const defaultInitialValues: JurisdictionHierachyDownloadFormFields = {
  jurisdictions: { id: '', name: '' },
};

const createCsv = (entries: JurisdictionHierachyFile[], fileName: string): void => {
  const csv: string = Papaparse.unparse(entries, {
    header: true,
  });
  // download file
  downloadFile(csv, fileName, TEXT_CSV);
};

export const submitJurisdictionHierachyForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  props: JurisdictionHierachyDownloadFormProps,
  values: JurisdictionHierachyDownloadFormFields
) => {
  const params = {
    return_structure_count: false,
  };
  const { serviceClass } = props;
  serviceClass
    .read(values.jurisdictions.id, params)
    .then((response: RawOpenSRPHierarchy) => {
      const records: JurisdictionHierachyFile[] = [];
      if (response) {
        const tree: TreeNode = generateJurisdictionTree(response);
        if (tree) {
          tree.walk((node: TreeNode) => {
            records.push({
              jurisdiction_id: node.model.id,
              jurisdiction_label: node.model.label,
            } as JurisdictionHierachyFile);
            return true;
          });
          createCsv(records, JURISDICTION_HIERARCHY_TEMPLATE);
          successGrowl(FILE_DOWNLOADED_SUCCESSFULLY);
          setSubmitting(false);
        }
      }
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};

const JurisdictionHierachyDownloadForm = (props: JurisdictionHierachyDownloadFormProps) => {
  const { initialValues } = props;
  const [globalError, setGlobalError] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting }) => {
          props.submitForm(setSubmitting, setGlobalError, props, values);
        }}
      >
        {({ errors, isSubmitting }) => (
          <Form className="mb-5" data-testid="form">
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="form-text text-danger">{globalError}</p>}
            </FormGroup>
            <FormGroup>
              <Field
                required={true}
                component={JurisdictionSelect}
                cascadingSelect={false}
                name={`jurisdictions.id`}
                id={`jurisdictions-id`}
                placeholder={SELECT_COUNTRY}
                aria-label={SELECT_COUNTRY}
                disabled={false}
                labelFieldName={`jurisdictions.name`}
              />
              <Field type="hidden" name={`jurisdictions.name`} id={`jurisdictions.name`} />
              <ErrorMessage
                name={LOCATION}
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

const defaultProps: JurisdictionHierachyDownloadFormProps = {
  disabledFields: [],
  initialValues: defaultInitialValues,
  serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
  submitForm: submitJurisdictionHierachyForm,
};

JurisdictionHierachyDownloadForm.defaultProps = defaultProps;
export default JurisdictionHierachyDownloadForm;
