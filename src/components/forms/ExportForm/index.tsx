import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { Alert, Button, Col, FormGroup, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { ENABLE_MDA_POINT } from '../../../configs/env';
import {
  DOWNLOAD,
  EXPORT_BASED_ON_GEOGRAPHICAL_REGION,
  EXPORT_CLIENT_LIST,
  EXPORT_STUDENT_LIST,
  LOCATION_ERROR_MESSAGE,
  REQUIRED,
} from '../../../configs/lang';
import { OPENSRP_EVENT_PARAM_VALUE } from '../../../constants';
import { handleDownload } from '../../../containers/pages/MDAPoint/ClientListView/helpers/serviceHooks';
import JurisdictionSelect from '../JurisdictionSelect';
/** Yup validation schema for ExportForm */
export const JurisdictionSchema = Yup.object().shape({
  jurisdictions: Yup.object().shape({
    id: Yup.string().required(REQUIRED),
    name: Yup.string(),
  }),
});
/** Jurisdiction form field Option interface */
export interface JurisdictionFieldOptions {
  id: string;
  name: string;
}
/** Jurisdiction form field interface */
export interface JurisdictionFormField {
  jurisdictions: JurisdictionFieldOptions;
}
/** initial values for exportform */
const defaultInitialValues: JurisdictionFormField = {
  jurisdictions: {
    id: '',
    name: '',
  },
};
/** Interface for ExportForm Props */
export interface ExportFormProps {
  initialValues: JurisdictionFormField;
  downloadFile: typeof handleDownload;
  eventValue: string;
}
export const ExportForm = (props: ExportFormProps) => {
  const { initialValues, downloadFile, eventValue } = props;
  return (
    <div>
      <Row id="export-row">
        <Col>
          <h3 className="mb-3 mt-5 page-title">
            {ENABLE_MDA_POINT ? EXPORT_STUDENT_LIST : EXPORT_CLIENT_LIST}
          </h3>
          {/* Download Form goes here */}
          <Alert color="light">{EXPORT_BASED_ON_GEOGRAPHICAL_REGION}</Alert>
          <Formik
            initialValues={initialValues}
            /* tslint:disable-next-line jsx-no-lambda */
            onSubmit={values => {
              // tslint:disable-next-line: no-floating-promises
              downloadFile('template', values.jurisdictions.name, {
                event_name: eventValue,
                location_id: values.jurisdictions.id,
              });
            }}
            validationSchema={JurisdictionSchema}
          >
            {({ errors }) => (
              <Form className="mb-5">
                <FormGroup className={'async-select-container'}>
                  <Label for={`jurisdictions-${1}-id`}>{'Geographical level to include'}</Label>
                  &nbsp;
                  <div style={{ display: 'inline-block', width: '24rem' }}>
                    <Field
                      required={true}
                      component={JurisdictionSelect}
                      cascadingSelect={true}
                      name={`jurisdictions.id`}
                      id={`jurisdictions-id`}
                      className={'async-select'}
                      labelFieldName={`jurisdictions.name`}
                    />
                  </div>
                  <Field type="hidden" name={`jurisdictions.name`} id={`jurisdictions-name`} />
                  {errors.jurisdictions && (
                    <small className="form-text text-danger jurisdictions-error">
                      {LOCATION_ERROR_MESSAGE}
                    </small>
                  )}
                  {
                    <ErrorMessage
                      name={`jurisdictions.id`}
                      component="small"
                      className="form-text text-danger"
                    />
                  }
                </FormGroup>
                <Button
                  type="submit"
                  id="studentexportform-submit-button"
                  className="btn btn-md btn btn-primary"
                  color="primary"
                >
                  {DOWNLOAD}
                </Button>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </div>
  );
};
const defaultProps: ExportFormProps = {
  downloadFile: handleDownload,
  eventValue: OPENSRP_EVENT_PARAM_VALUE,
  initialValues: defaultInitialValues,
};
ExportForm.defaultProps = defaultProps;
export default ExportForm;
