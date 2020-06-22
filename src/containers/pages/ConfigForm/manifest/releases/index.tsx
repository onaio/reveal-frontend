import { ConnectedManifestReleases } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, MANIFEST_RELEASES } from '../../../../../configs/lang';
import {
  FILE_UPLOAD_TYPE,
  HOME_URL,
  MANIFEST_FILE_UPLOAD,
  MANIFEST_RELEASE_URL,
  OPENSRP_MANIFEST_ENDPOINT,
} from '../../../../../constants';
import { defaultConfigProps } from '../../helpers';

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
    currentUrl: MANIFEST_RELEASE_URL,
    endpoint: OPENSRP_MANIFEST_ENDPOINT,
    formUploadUrl: MANIFEST_FILE_UPLOAD,
    uploadTypeUrl: FILE_UPLOAD_TYPE,
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
