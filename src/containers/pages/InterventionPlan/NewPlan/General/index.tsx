import React from 'react';
import { Helmet } from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { CREATE_NEW_PLAN, HOME, PLANS } from '../../../../../configs/lang';
import { HOME_URL, NEW_PLAN_URL, PLAN_LIST_URL } from '../../../../../constants';
import PlanForm from '../../../../forms/PlanForm';

/** Simple component that loads the new plan form and allows you to create a new plan */
const NewPlan = () => {
  const pageTitle: string = CREATE_NEW_PLAN;

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: `${NEW_PLAN_URL}`,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: PLANS,
        url: PLAN_LIST_URL,
      },
    ],
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <Row>
        <Col md={8}>
          <PlanForm />
        </Col>
      </Row>
    </div>
  );
};

export default NewPlan;
