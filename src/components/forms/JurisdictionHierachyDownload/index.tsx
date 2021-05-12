import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Button, FormGroup } from 'reactstrap';
import JurisdictionSelect from '../../../components/forms/JurisdictionSelect';
import { DOWNLOAD, DOWNLOAD_FILE, DOWNLOADING, FILE, SELECT_COUNTRY } from '../../../configs/lang';
import { OPENSRP_V2_SETTINGS } from '../../../constants';
import { OpenSRPService } from '../../../services/opensrp';
import { LOCATION } from '../../TreeWalker/constants';
import {
  JurisdictionHierachyDownloadFormFields,
  JurisdictionHierachyDownloadFormProps,
  submitJurisdictionHierachyForm,
} from './helpers';

/** default form values */
export const defaultInitialValues: JurisdictionHierachyDownloadFormFields = {
  jurisdictions: { id: '', name: '' },
};

/**
 * Compponent that renders form to select country and export jurisdiction hierarchy data for selected country
 */
const JurisdictionHierachyDownloadForm = (props: JurisdictionHierachyDownloadFormProps) => {
  const { initialValues, submitForm } = props;
  const [globalError, setGlobalError] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(true);
  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting }) => {
          submitForm(setSubmitting, setGlobalError, props.serviceClass, values);
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
  submitForm: submitJurisdictionHierachyForm,
};

JurisdictionHierachyDownloadForm.defaultProps = defaultProps;
export default JurisdictionHierachyDownloadForm;
