import React from 'react';
import { Helmet } from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  HOME,
  HOME_URL,
  INTERVENTION_IRS_URL,
  NEW_IRS_PLAN_URL,
  PLAN_LIST_URL,
  PLANS,
} from '../../../../../constants';
import { InterventionType } from '../../../../../store/ducks/plans';
import PlanForm, { defaultInitialValues, PlanFormProps } from '../../../../forms/PlanForm';
import { getFormActivities, IRSActivities } from '../../../../forms/PlanForm/helpers';

/** Simple component that loads the new plan form and allows you to create a new IRS plan */
const NewIRSPlan = () => {
  const pageTitle: string = 'Create New IRS Plan';

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: `${NEW_IRS_PLAN_URL}`,
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

  const props: Partial<PlanFormProps> = {
    allowMoreJurisdictions: false,
    cascadingSelect: false,
    disabledFields: ['interventionType', 'status'],
    initialValues: {
      ...defaultInitialValues,
      activities: getFormActivities(IRSActivities),
      interventionType: InterventionType.IRS,
    },
    jurisdictionLabel: 'Country',
    redirectAfterAction: INTERVENTION_IRS_URL,
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
          <PlanForm {...props} />
        </Col>
      </Row>
    </div>
  );
};

export default NewIRSPlan;
