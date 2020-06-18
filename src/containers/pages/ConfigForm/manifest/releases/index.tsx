import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, MANIFEST_RELEASES } from '../../../../../configs/lang';
import { HOME_URL, MANIFEST_RELEASE_URL } from '../../../../../constants';

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
    </div>
  );
};
