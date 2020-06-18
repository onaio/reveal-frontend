import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { FORM_DRAFT_FILES, HOME } from '../../../../../configs/lang';
import { HOME_URL, VIEW_DRAFT_FILES_URL } from '../../../../../constants';

/** simple wrapper for manifest draft file lists component */
export const ManifestDraftFiles = () => {
  const breadcrumbProps = {
    currentPage: {
      label: FORM_DRAFT_FILES,
      url: VIEW_DRAFT_FILES_URL,
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
        <title>{FORM_DRAFT_FILES}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{FORM_DRAFT_FILES}</h3>
        </Col>
      </Row>
    </div>
  );
};
