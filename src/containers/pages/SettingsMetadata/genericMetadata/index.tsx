import React from 'react';
import Helmet from 'react-helmet';
import { Card, CardBody, Col, Row } from 'reactstrap';
import JurisdictionHierachyDownload, {
  defaultInitialValues as defaultHierachyValues,
} from '../../../../components/forms/JurisdictionHierachyDownload';
import {
  FormSubmit,
  JurisdictionHierachyDownloadFormProps,
} from '../../../../components/forms/JurisdictionHierachyDownload/helpers';
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
import { SelectOption } from '../../../../components/forms/JurisdictionMetadataDownload/helpers';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME } from '../../../../configs/lang';
import { HOME_URL, OPENSRP_V1_SETTINGS_ENDPOINT, OPENSRP_V2_SETTINGS } from '../../../../constants';
import { MetadataOptions } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import './index.css';

/** GenericSettingsMetadata Props interface  */
export interface GenericSettingsMetadataProps {
  currentPageLabel: string;
  currentPageUrl: string;
  hierachyDownloadSteps: string[];
  hierachyDownloadTitle: string;
  hierachyDownloadUrl: string;
  hierachyFormSubmit: FormSubmit;
  identifierOptions: SelectOption[];
  metadataDownloadTitle: string;
  metadataOption: MetadataOptions;
  metdataUploadTitle: string;
  pageTitle: string;
  serviceClass: typeof OpenSRPService;
}

/** generic metadata component */
export const GenericSettingsMetadata = (props: GenericSettingsMetadataProps) => {
  const {
    currentPageLabel,
    currentPageUrl,
    hierachyDownloadSteps,
    hierachyDownloadTitle,
    hierachyDownloadUrl,
    hierachyFormSubmit,
    identifierOptions,
    metadataDownloadTitle,
    metadataOption,
    metdataUploadTitle,
    pageTitle,
    serviceClass,
  } = props;
  //  props for breadcrumbs
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: currentPageLabel,
      url: currentPageUrl,
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
    metadataOption,
    redirectAfterAction: HOME_URL,
    serviceClass: new serviceClass(OPENSRP_V1_SETTINGS_ENDPOINT),
    submitForm,
  };

  /** props for the Jurisdiction Metadata form */
  const jurisdictionMetadataDownloadFormProps: JurisdictionMetadataDownloadFormProps = {
    disabledFields: [],
    identifierOptions,
    initialValues,
    metadataOption,
    serviceClass: new serviceClass(OPENSRP_V2_SETTINGS),
    submitForm: formSubmit,
  };

  /** props for the Jurisdiction Hierarchy form */
  const jurisdictionMetadataDownloadFormProp: JurisdictionHierachyDownloadFormProps = {
    initialValues: defaultHierachyValues,
    serviceClass: new serviceClass(hierachyDownloadUrl),
    submitForm: hierachyFormSubmit,
  };

  const downloadSteps = hierachyDownloadSteps.map((step, i) => <li key={i}>{step}</li>);

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 mt-5 page-title">{pageTitle}</h3>
      <Row>
        <Col md={6}>
          <Card>
            <CardBody className="meta-card-body">
              <h5 className="mb-3 mt-5 page-title">{hierachyDownloadTitle}</h5>
              <ol>{downloadSteps}</ol>
              <JurisdictionHierachyDownload {...jurisdictionMetadataDownloadFormProp} />
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <CardBody className="meta-card-body">
              <h5 className="mb-3 mt-5 page-title">{metdataUploadTitle}</h5>
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
              <h5 className="mb-3 mt-5 page-title">{metadataDownloadTitle}</h5>
              <JurisdictionMetadataDownload {...jurisdictionMetadataDownloadFormProps} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
