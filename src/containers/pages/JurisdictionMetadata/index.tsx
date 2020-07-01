/** Jurisdiction Metadata page
 * Displays Jurisdiction Metadata import form
 */
import React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Card, CardBody, CardLink, Col, Row } from 'reactstrap';
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
  HOW_TO_UPDATE_JURISDICTION_METADATA,
  JURISDICTION_METADATA,
  UPLOAD_JURISDICTION_METADATA,
} from '../../../configs/lang';
import {
  HOME_URL,
  JURISDICTION_METADATA_URL,
  OPENSRP_V1_SETTINGS_ENDPOINT,
  OPENSRP_V2_SETTINGS,
} from '../../../constants';
import { RouteParams } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import './index.css';

/** type intersection for all types that pertain to the props */
export type JurisdictionMetadataImportViewTypes = RouteComponentProps<RouteParams>;

/** JurisdictionMetadataImportView component */
const JurisdictionMetadataImportView = () => {
  //  props for breadcrumbs
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: JURISDICTION_METADATA,
      url: JURISDICTION_METADATA_URL,
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
    serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
    submitForm: formSubmit,
  };

  return (
    <div>
      <Helmet>
        <title>{JURISDICTION_METADATA}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 mt-5 page-title">{JURISDICTION_METADATA}</h3>
      <Row>
        <Col md={6}>
          <Card>
            <CardBody>
              <h5 className="mb-3 mt-5 page-title">{HOW_TO_UPDATE_JURISDICTION_METADATA}</h5>
              <ol>
                <li>Click on the download template CSV button below.</li>
                <li>
                  Open the downloaded file and complete the risk and target details on the
                  respective columns.
                </li>
                <li>Save the updated CSV file.</li>
                <li>Select the saved file on the upload form.</li>
                <li>Click the "Upload File" button to complete the process.</li>
              </ol>
              <CardLink href="#">Download Templete CSV</CardLink>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <CardBody>
              <h5 className="mb-3 mt-5 page-title">{UPLOAD_JURISDICTION_METADATA}</h5>
              <JurisdictionMetadata {...jurisdictionMetadataFormProps} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col md={6}>
          <Card>
            <CardBody>
              <h5 className="mb-3 mt-5 page-title">{DOWNLOAD_JURISDICTION_METADATA}</h5>
              <JurisdictionMetadataDownload {...jurisdictionMetadataDownloadFormProps} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JurisdictionMetadataImportView;
