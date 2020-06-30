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
import JurisdictionMetadataDownload, {
  defaultInitialValues as initialValues,
  JurisdictionMetadataDownloadFormProps,
  submitForm as formSubmit,
} from '../../../components/forms/JurisdictionMetadataDownload';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  DOWNLOAD_JURISDICTION_METADATA,
  HOME,
  JURISDICTION_METADATA,
  UPLOAD_JURISDICTION_METADATA,
} from '../../../configs/lang';
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
  const jurisdictionMetadataDownloadFormProps: JurisdictionMetadataDownloadFormProps = {
    disabledFields: [],
    initialValues,
    redirectAfterAction: HOME_URL,
    serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
    submitForm: formSubmit,
  };

  return (
    <div>
      <Helmet>
        <title>{JURISDICTION_METADATA}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 mt-5 page-title">{UPLOAD_JURISDICTION_METADATA}</h3>
      <Row>
        <Col md={8}>
          <JurisdictionMetadata {...jurisdictionMetadataFormProps} />
        </Col>
      </Row>
      <hr />
      <h3 className="mb-3 mt-5 page-title">{DOWNLOAD_JURISDICTION_METADATA}</h3>
      <Row>
        <Col md={8}>
          <JurisdictionMetadataDownload {...jurisdictionMetadataDownloadFormProps} />
        </Col>
      </Row>
    </div>
  );
};

export default JurisdictionMetadataImportView;
