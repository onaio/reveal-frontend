/** Jurisdiction Metadata page
 * Displays Jurisdiction Metadata import form
 */
import React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { toast } from 'react-toastify';
import { Card, CardBody, Col, Row } from 'reactstrap';
import JurisdictionHierachyDownload, {
  defaultInitialValues as defaultHierachyValues,
  JurisdictionHierachyDownloadFormProps,
} from '../../../components/forms/JurisdictionHierachyDownload';
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
  JURISDICTION_UPLOAD_STEP_1,
  JURISDICTION_UPLOAD_STEP_2,
  JURISDICTION_UPLOAD_STEP_3,
  JURISDICTION_UPLOAD_STEP_4,
  JURISDICTION_UPLOAD_STEP_5,
  UPLOAD_JURISDICTION_METADATA,
} from '../../../configs/lang';
import {
  GET_ALL,
  HOME_URL,
  JURISDICTION_CSV_FILE_NAME,
  JURISDICTION_CSV_TEMPLATE,
  JURISDICTION_METADATA_URL,
  OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT,
  OPENSRP_LOCATION,
  OPENSRP_V1_SETTINGS_ENDPOINT,
  OPENSRP_V2_SETTINGS,
  TEXT_CSV,
} from '../../../constants';
import { downloadFile, growl, RouteParams } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import './index.css';

/** type intersection for all types that pertain to the props */
export type JurisdictionMetadataImportViewTypes = RouteComponentProps<RouteParams>;

/** interface for Jurisdiction metadata file */
export interface JurisdictionProperties {
  status: string;
  parentId: string;
  name: string;
  geographicLevel: number;
  version: number;
}

/** interface for Jurisdiction metadata file */
export interface JurisdictionResponse {
  type: string;
  id: string;
  properties: JurisdictionProperties;
  serverVersion: number;
}

/** get Jurisdictions for csv template
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 */
export const downloadCsvTemplate = (service: typeof OpenSRPService = OpenSRPService) => {
  const serve = new service(`${OPENSRP_LOCATION}/${GET_ALL}`);
  const params = {
    is_jurisdiction: true,
    return_geometry: false,
    serverVersion: 0,
  };
  serve
    .list(params)
    .then((response: JurisdictionResponse[]) => {
      const header = JURISDICTION_CSV_TEMPLATE;
      let content = '';
      response.forEach(item => {
        content += `${item.id},${item.properties.name}\r\n`;
      });
      downloadFile(`${header}\r\n${content}`, JURISDICTION_CSV_FILE_NAME, TEXT_CSV);
    })
    .catch((err: Error) => {
      growl(err.message, {
        type: toast.TYPE.ERROR,
      });
      downloadFile(JURISDICTION_CSV_TEMPLATE, JURISDICTION_CSV_FILE_NAME, TEXT_CSV);
    });
};

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

  /** props for the Jurisdiction Hierarchy form */
  const jurisdictionMetadataDownloadFormProp: JurisdictionHierachyDownloadFormProps = {
    initialValues: defaultHierachyValues,
    serviceClass: new OpenSRPService(OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT),
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
            <CardBody className="meta-card-body">
              <h5 className="mb-3 mt-5 page-title">{HOW_TO_UPDATE_JURISDICTION_METADATA}</h5>
              <ol>
                <li>{JURISDICTION_UPLOAD_STEP_1}</li>
                <li>{JURISDICTION_UPLOAD_STEP_2}</li>
                <li>{JURISDICTION_UPLOAD_STEP_3}</li>
                <li>{JURISDICTION_UPLOAD_STEP_4}</li>
                <li>{JURISDICTION_UPLOAD_STEP_5}</li>
              </ol>
              <JurisdictionHierachyDownload {...jurisdictionMetadataDownloadFormProp} />
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <CardBody className="meta-card-body">
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
            <CardBody className="meta-card-body">
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
