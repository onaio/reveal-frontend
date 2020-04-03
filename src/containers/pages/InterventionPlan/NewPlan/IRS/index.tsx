import React from 'react';
import { Helmet } from 'react-helmet';
import { Col, Row } from 'reactstrap';
import PlanForm, {
  defaultInitialValues,
  PlanFormProps,
} from '../../../../../components/forms/PlanForm';
import { getFormActivities, IRSActivities } from '../../../../../components/forms/PlanForm/helpers';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { COUNTRY, CREATE_NEW_IRS_PLAN, HOME, IRS_PLANS } from '../../../../../configs/lang';
import { HOME_URL, INTERVENTION_IRS_DRAFTS_URL, NEW_IRS_PLAN_URL } from '../../../../../constants';
import { InterventionType } from '../../../../../store/ducks/plans';

/** Simple component that loads the new plan form and allows you to create a new IRS plan */
const NewIRSPlan = () => {
  const pageTitle: string = CREATE_NEW_IRS_PLAN;

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
        label: IRS_PLANS,
        url: INTERVENTION_IRS_DRAFTS_URL,
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
    jurisdictionLabel: COUNTRY,
    redirectAfterAction: INTERVENTION_IRS_DRAFTS_URL,
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
