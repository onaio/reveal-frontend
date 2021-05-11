/** Jurisdiction Metadata page
 * Displays Jurisdiction Metadata import form
 */
import React from 'react';
import Helmet from 'react-helmet';
import { Card, CardBody, Col, Row } from 'reactstrap';
import JurisdictionMetadata, {
  defaultInitialValues,
  JurisdictionMetadataFormProps,
  submitForm,
} from '../../../../components/forms/JurisdictionMetadata';
import JurisdictionMetadataDownload, {
  defaultInitialValues as initialValues,
  JurisdictionMetadataDownloadFormProps,
  submitForm as formSubmit,
} from '../../../../components/forms/JurisdictionMetadataDownload';
import {
  getAllowedMetaDataIdentifiers,
  JurisdictionsMetaDataIdentifierParams,
} from '../../../../components/forms/JurisdictionMetadataDownload/helpers';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS } from '../../../../configs/env';
import {
  DOWNLOAD_STRUCTURE_METADATA,
  HOME,
  HOW_TO_UPDATE_STRUCTURE_METADATA,
  JURISDICTION_UPLOAD_STEP_1,
  JURISDICTION_UPLOAD_STEP_2,
  JURISDICTION_UPLOAD_STEP_3,
  JURISDICTION_UPLOAD_STEP_4,
  JURISDICTION_UPLOAD_STEP_5,
  STRUCTURE_METADATA,
  UPLOAD_STRUCTURE_METADATA,
} from '../../../../configs/lang';
import {
  HOME_URL,
  OPENSRP_V1_SETTINGS_ENDPOINT,
  OPENSRP_V2_SETTINGS,
  STRUCTURE_METADATA_URL,
} from '../../../../constants';
import { MetadataOptions } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import '../JurisdictionMetadata/index.css';

/** get enabled identifier options */
const enabledIdentifierOptions = getAllowedMetaDataIdentifiers(
  ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS as JurisdictionsMetaDataIdentifierParams[],
  MetadataOptions.StructureMetadata
);

/** JurisdictionMetadataImportView component */
const StructureMetadataImportView = () => {
  //  props for breadcrumbs
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: STRUCTURE_METADATA,
      url: STRUCTURE_METADATA_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  const metadataOption = MetadataOptions.StructureMetadata;

  /** props for the Jurisdiction Metadata form */
  const jurisdictionMetadataFormProps: JurisdictionMetadataFormProps = {
    disabledFields: [],
    initialValues: defaultInitialValues,
    metadataOption,
    redirectAfterAction: HOME_URL,
    serviceClass: new OpenSRPService(OPENSRP_V1_SETTINGS_ENDPOINT),
    submitForm,
  };

  /** props for the Jurisdiction Metadata form */
  const jurisdictionMetadataDownloadFormProps: JurisdictionMetadataDownloadFormProps = {
    disabledFields: [],
    identifierOptions: enabledIdentifierOptions,
    initialValues,
    metadataOption,
    serviceClass: new OpenSRPService(OPENSRP_V2_SETTINGS),
    submitForm: formSubmit,
  };

  return (
    <div>
      <Helmet>
        <title>{STRUCTURE_METADATA}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 mt-5 page-title">{STRUCTURE_METADATA}</h3>
      <Row>
        <Col md={6}>
          <Card>
            <CardBody className="meta-card-body">
              <h5 className="mb-3 mt-5 page-title">{HOW_TO_UPDATE_STRUCTURE_METADATA}</h5>
              <ol>
                <li>{JURISDICTION_UPLOAD_STEP_1}</li>
                <li>{JURISDICTION_UPLOAD_STEP_2}</li>
                <li>{JURISDICTION_UPLOAD_STEP_3}</li>
                <li>{JURISDICTION_UPLOAD_STEP_4}</li>
                <li>{JURISDICTION_UPLOAD_STEP_5}</li>
              </ol>
              {/* Add component for downloading structures template here */}
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <CardBody className="meta-card-body">
              <h5 className="mb-3 mt-5 page-title">{UPLOAD_STRUCTURE_METADATA}</h5>
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
              <h5 className="mb-3 mt-5 page-title">{DOWNLOAD_STRUCTURE_METADATA}</h5>
              <JurisdictionMetadataDownload {...jurisdictionMetadataDownloadFormProps} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StructureMetadataImportView;
