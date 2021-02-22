import React from 'react';
import { Alert, Col, Row } from 'reactstrap';
import * as Yup from 'yup';
import { ENABLE_MDA_POINT } from '../../../configs/env';
import {
  EXPORT_BASED_ON_GEOGRAPHICAL_REGION,
  EXPORT_CLIENT_LIST,
  EXPORT_STUDENT_LIST,
  REQUIRED,
} from '../../../configs/lang';
import { OPENSRP_EVENT_PARAM_VALUE } from '../../../constants';
import { handleDownload } from '../../../containers/pages/MDAPoint/ClientListView/helpers/serviceHooks';
import LocationSelect from '../LocationSelect';
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
export const ExportForm = (_: ExportFormProps) => {
  return (
    <div>
      <Row id="export-row">
        <Col>
          <h3 className="mb-3 mt-5 page-title">
            {ENABLE_MDA_POINT ? EXPORT_STUDENT_LIST : EXPORT_CLIENT_LIST}
          </h3>
          <Alert color="light" style={{ 'padding-left': '0px' }}>
            {EXPORT_BASED_ON_GEOGRAPHICAL_REGION}
          </Alert>
          <LocationSelect />
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
