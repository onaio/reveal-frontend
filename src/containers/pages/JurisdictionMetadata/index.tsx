/** Jurisdiction Metadata page
 * Displays Jurisdiction Metadata import form
 */
import React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import JurisdictionMetadata, {
  defaultInitialValues,
  JurisdictionMetadataFormProps,
  submitForm,
} from '../../../components/forms/JurisdictionMetadata';
import JurisdictionMetadataUpload, {
  defaultInitialValues as initialValues,
  JurisdictionMetadataUploadFormProps,
  submitForm as formSubmit,
} from '../../../components/forms/JurisdictionMetadataUpload';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, UPLOAD_JURISDICTION_METADATA } from '../../../configs/lang';
import {
  HOME_URL,
  OPENSRP_V1_SETTINGS_ENDPOINT,
  OPENSRP_V2_SETTINGS,
  UPLOAD_JURISDICTION_METADATA_URL,
} from '../../../constants';
import { RouteParams } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';

/** type intersection for all types that pertain to the props */
export type JurisdictionMetadataImportViewTypes = RouteComponentProps<RouteParams>;

/** JurisdictionMetadataImportView component */
const JurisdictionMetadataImportView = () => {
  //  props for breadcrumbs
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: UPLOAD_JURISDICTION_METADATA,
      url: UPLOAD_JURISDICTION_METADATA_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  /** props for the Jurisdiction Metadata form */
  const jurisdictionMetadataFormProps: JurisdictionMetadataFormProps = {
    disabledFields: [],
    initialValues: defaultInitialValues,
    redirectAfterAction: HOME_URL,
    serviceClass: new OpenSRPService(OPENSRP_V1_SETTINGS_ENDPOINT),
    submitForm,
  };

  /** props for the Jurisdiction Metadata form */
  const jurisdictionMetadataUploadFormProps: JurisdictionMetadataUploadFormProps = {
    disabledFields: [],
    initialValues,
    redirectAfterAction: HOME_URL,
    serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
    submitForm: formSubmit,
  };

  return (
    <div>
      <Helmet>
        <title>{UPLOAD_JURISDICTION_METADATA}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <JurisdictionMetadata {...jurisdictionMetadataFormProps} />
          <JurisdictionMetadataUpload {...jurisdictionMetadataUploadFormProps} />
        </Col>
      </Row>
    </div>
  );
};

export default JurisdictionMetadataImportView;
