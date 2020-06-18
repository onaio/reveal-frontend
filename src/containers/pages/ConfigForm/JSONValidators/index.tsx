import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, JSON_VALIDATORS } from '../../../../configs/lang';
import { HOME_URL, JSON_VALIDATORS_URL } from '../../../../constants';

export const JSONValidatorListPage = () => {
  const breadcrumbProps = {
    currentPage: {
      label: JSON_VALIDATORS,
      url: JSON_VALIDATORS_URL,
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
        <title>{JSON_VALIDATORS}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{JSON_VALIDATORS}</h3>
        </Col>
      </Row>
    </div>
  );
};
