import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { Button, FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import { DOWNLOADING, REQUIRED } from '../../../configs/lang';
import {
  OPENSRP_EVENT_PARAM_VALUE,
  OPENSRP_TEMPLATE_ENDPOINT,
  OPENSRP_UPLOAD_ENDPOINT,
} from '../../../constants';
import { handleDownload } from '../../../containers/pages/MDAPoint/ClientListView/helpers/serviceHooks';
import './index.css';

export const JurisdictionSchema = Yup.object().shape({
  id: Yup.string().required(REQUIRED),
  name: Yup.string(),
});

/** Jurisdiction form field Option interface */
export interface JurisdictionFieldOptions {
  id: string;
  name: string;
}

/** initial values for exportform */
const defaultInitialValues: JurisdictionFieldOptions = {
  id: '',
  name: '',
};

/** Interface for ExportForm Props */
export interface ExportFormProps {
  initialValues: JurisdictionFieldOptions;
  downloadFile: typeof handleDownload;
  eventValue: string;
  templateEndpoint: string;
  uploadEndpoint: string;
}

export const StudentExportForm = (props: ExportFormProps) => {
  const { initialValues, downloadFile, eventValue, templateEndpoint, uploadEndpoint } = props;
  return (
    <Formik
      initialValues={initialValues}
      /* tslint:disable-next-line jsx-no-lambda */
      onSubmit={(values, { setSubmitting }) => {
        // tslint:disable-next-line: no-floating-promises
        downloadFile(templateEndpoint, `${values.name}.csv`, uploadEndpoint, {
          event_name: eventValue,
          location_id: values.id,
        }).then(() => setSubmitting(false));
      }}
      validationSchema={JurisdictionSchema}
    >
      {({ values, isSubmitting }) => (
        <Form className="mb-5">
          <FormGroup>
            <Field type="hidden" name={`id`} id={`jurisdictions-id`} values={values.name} />
            <Field type="hidden" name={`name`} id={`jurisdictions-name`} value={values.id} />
          </FormGroup>
          <Button
            type="submit"
            id="studentexportform-submit-button"
            className="btn btn-link submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              DOWNLOADING
            ) : (
              <FontAwesomeIcon className="download-icon" icon="download" />
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
const defaultProps: ExportFormProps = {
  downloadFile: handleDownload,
  eventValue: OPENSRP_EVENT_PARAM_VALUE,
  initialValues: defaultInitialValues,
  templateEndpoint: OPENSRP_TEMPLATE_ENDPOINT,
  uploadEndpoint: OPENSRP_UPLOAD_ENDPOINT,
};
StudentExportForm.defaultProps = defaultProps;
export default StudentExportForm;
