import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { Alert, Button, Col, FormGroup, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { ENABLE_MDA_POINT } from '../../../configs/env';
import { EXPORT_CLIENT_LIST, EXPORT_STUDENT_LIST, REQUIRED } from '../../../configs/lang';
import { handleDownload } from '../../../containers/pages/MDAPoint/ClientListView/helpers/serviceHooks';
import JurisdictionSelect from '../JurisdictionSelect';
import { values } from '../PlanForm/tests/fixtures';
export const JurisdictionSchema = Yup.object().shape({
  jurisdictions: Yup.object().shape({
    id: Yup.string().required(REQUIRED),
    name: Yup.string(),
  }),
});
/** interface to describe props for ExportForm component */
export interface PlanJurisdictionFormField {
  id: string;
  name: string;
}
export interface JurisdictionFormField {
  jurisdictions: PlanJurisdictionFormField;
}
export const ExportForm = () => {
  const defaultInitialValues: JurisdictionFormField = {
    jurisdictions: {
      id: '',
      name: '',
    },
  };
  return (
    <div>
      <Row id="export-row">
        <Col>
          <h3 className="mb-3 mt-5 page-title">
            {ENABLE_MDA_POINT ? EXPORT_STUDENT_LIST : EXPORT_CLIENT_LIST}
          </h3>
          {/* Download Form goes here */}
          <Alert color="light">Export Country based on Geographical level!</Alert>
          <Formik
            initialValues={defaultInitialValues}
            /* tslint:disable-next-line jsx-no-lambda */
            onSubmit={() => {
              handleDownload('template', values.name, {
                event_name: 'Child Registration',
                location_id: 12345,
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
                      {'Please select location'}
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
                  Download
                </Button>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </div>
  );
};
export default ExportForm;
