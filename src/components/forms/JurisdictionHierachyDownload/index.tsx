import { ErrorMessage, Field, Form, Formik } from 'formik';
import Papaparse from 'papaparse';
import React, { useState } from 'react';
import { Button, FormGroup } from 'reactstrap';
import JurisdictionSelect from '../../../components/forms/JurisdictionSelect';
import {
  DOWNLOAD,
  DOWNLOAD_FILE,
  DOWNLOADING,
  FILE,
  FILE_DOWNLOADED_SUCCESSFULLY,
  JURISDICTION_HIERARCHY_TEMPLATE,
  SELECT_COUNTRY,
} from '../../../configs/lang';
import { OPENSRP_V2_SETTINGS, TEXT_PLAIN } from '../../../constants';
import { downloadFile, successGrowl } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import { RawOpenSRPHierarchy, TreeNode } from '../../../store/ducks/opensrp/hierarchies/types';
import { generateJurisdictionTree } from '../../../store/ducks/opensrp/hierarchies/utils';
import { LOCATION } from '../../TreeWalker/constants';

export interface JurisdictionHierachyFile {
  jurisdiction_id: string;
  jurisdiction_name: string;
}

/** interface for each select dropdown option */
export interface Option {
  id: string;
  name: string;
}

/** interface for each select dropdown option */
export interface JurisdictionHierachyDownloadFormFields {
  jurisdictions: Option;
}

/**
 * interface for the Jurisdiction hierarchy download form fields
 */
export interface JurisdictionHierachyDownloadFormProps {
  serviceClass: OpenSRPService;
  initialValues: JurisdictionHierachyDownloadFormFields;
}

export const defaultInitialValues: JurisdictionHierachyDownloadFormFields = {
  jurisdictions: { id: '', name: '' },
};

// Create csv data for the selected jurisdiction hieracrhy
const createCsv = (entries: JurisdictionHierachyFile[], fileName: string): void => {
  const csv: string = Papaparse.unparse(entries, {
    header: true,
  });
  // Export csv file
  downloadFile(csv, fileName, TEXT_PLAIN);
};

export const submitJurisdictionHierachyForm = (
  setSubmitting: (isSubmitting: boolean) => void,
  setGlobalError: (errorMessage: string) => void,
  props: JurisdictionHierachyDownloadFormProps,
  values: JurisdictionHierachyDownloadFormFields
): void => {
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
              jurisdiction_name: node.model.label,
            } as JurisdictionHierachyFile);
            return true;
          });
          createCsv(records, `${JURISDICTION_HIERARCHY_TEMPLATE}.csv`);
          successGrowl(FILE_DOWNLOADED_SUCCESSFULLY);
          setSubmitting(false);
        }
      } else {
        setSubmitting(false);
      }
    })
    .catch((e: Error) => {
      setGlobalError(e.message);
      setSubmitting(false);
    });
};

/**
 * Compponent that renders form to select country and export jurisdiction hierarchy data for selected country
 */
const JurisdictionHierachyDownloadForm = (props: JurisdictionHierachyDownloadFormProps) => {
  const { initialValues } = props;
  const [globalError, setGlobalError] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting }) => {
          submitJurisdictionHierachyForm(setSubmitting, setGlobalError, props, values);
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
                // tslint:disable-next-line: jsx-no-lambda
                validate={(value: any) => {
                  if (value) {
                    setDisabled(false);
                  }
                }}
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

/**
 * JurisdictionHierarchyDownload - enables users to export jurisdiction hierarchies based on seelcted country
 */
const defaultProps: JurisdictionHierachyDownloadFormProps = {
  initialValues: defaultInitialValues,
  serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
};

JurisdictionHierachyDownloadForm.defaultProps = defaultProps;
export default JurisdictionHierachyDownloadForm;
