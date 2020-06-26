import { ConnectedManifestReleases } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  APP_ID_LABEL,
  APP_VERSION_LABEL,
  FIND_RELEASE_LABEL,
  HOME,
  IDENTIFIER_LABEL,
  MANIFEST_RELEASES,
  UPOL0AD_FILE_LABEL,
  VIEW_FILES_LABEL,
} from '../../../../../configs/lang';
import {
  FILE_UPLOAD_TYPE,
  HOME_URL,
  MANIFEST_FILE_UPLOAD,
  MANIFEST_RELEASE_URL,
  OPENSRP_MANIFEST_ENDPOINT,
} from '../../../../../constants';
import { defaultConfigProps, drillDownProps } from '../../helpers';

/** openSrp form config manifest releases wrapper */
export const ManifestReleasesPage = () => {
  const breadcrumbProps = {
    currentPage: {
      label: MANIFEST_RELEASES,
      url: MANIFEST_RELEASE_URL,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  const releasesProps = {
    ...defaultConfigProps,
    appIdLabel: APP_ID_LABEL,
    appVersionLabel: APP_VERSION_LABEL,
    currentUrl: MANIFEST_RELEASE_URL,
    drillDownProps,
    endpoint: OPENSRP_MANIFEST_ENDPOINT,
    formUploadUrl: MANIFEST_FILE_UPLOAD,
    identifierLabel: IDENTIFIER_LABEL,
    placeholder: FIND_RELEASE_LABEL,
    uploadFileLabel: UPOL0AD_FILE_LABEL,
    uploadTypeUrl: FILE_UPLOAD_TYPE,
    viewFilesLabel: VIEW_FILES_LABEL,
  };

  return (
    <div>
      <Helmet>
        <title>{MANIFEST_RELEASES}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{MANIFEST_RELEASES}</h3>
        </Col>
      </Row>
      <ConnectedManifestReleases {...releasesProps} />
    </div>
  );
};
