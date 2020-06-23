import React from 'react';
import { Helmet } from 'react-helmet';
import { Col, Row } from 'reactstrap';
import PlanForm, {
  defaultInitialValues,
  PlanFormProps,
} from '../../../../../components/forms/PlanForm';
import { getFormActivities, IRSActivities } from '../../../../../components/forms/PlanForm/helpers';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  COUNTRY,
  CREATE_NEW_IRS_PLAN,
  CREATE_NEW_PLAN,
  HOME,
  IRS_PLANS,
  PLANNING_PAGE_TITLE,
} from '../../../../../configs/lang';
import {
  HOME_URL,
  INTERVENTION_IRS_DRAFTS_URL,
  NEW_IRS_PLAN_URL,
  NEW_PLANNING_PLAN_URL,
  PLANNING_VIEW_URL,
} from '../../../../../constants';
import { InterventionType } from '../../../../../store/ducks/plans';

enum PageType {
  IRS,
  General,
}

interface NewPlanProps {
  pageType: PageType;
}

/** Simple component that loads the new plan form and allows you to create a new IRS plan */
const NewDraftPlan = (props: NewPlanProps) => {
  const isIrsDraft = PageType.IRS === props.pageType;
  const pageTitle: string = isIrsDraft ? CREATE_NEW_IRS_PLAN : CREATE_NEW_PLAN;
  const pageUrl: string = isIrsDraft ? NEW_IRS_PLAN_URL : NEW_PLANNING_PLAN_URL;

  const immediateParentBreadCrumb = isIrsDraft
    ? {
        label: IRS_PLANS,
        url: INTERVENTION_IRS_DRAFTS_URL,
      }
    : {
        label: PLANNING_PAGE_TITLE,
        url: PLANNING_VIEW_URL,
      };

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: pageUrl,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      immediateParentBreadCrumb,
    ],
  };

  const disabledFields =
    props.pageType === PageType.IRS ? ['interventionType', 'status'] : ['status'];
  const initialValues =
    props.pageType === PageType.IRS
      ? {
          ...defaultInitialValues,
          activities: getFormActivities(IRSActivities),
          interventionType: InterventionType.IRS,
        }
      : { ...defaultInitialValues };

  const redirectAfterAction = isIrsDraft ? INTERVENTION_IRS_DRAFTS_URL : PLANNING_VIEW_URL;

  const newPlanProps: Partial<PlanFormProps> = {
    allowMoreJurisdictions: false,
    cascadingSelect: false,
    disabledFields,
    initialValues,
    jurisdictionLabel: COUNTRY,
    redirectAfterAction,
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
          <PlanForm {...newPlanProps} />
        </Col>
      </Row>
    </div>
  );
};

const defaultProps = {
  pageType: PageType.IRS,
};
NewDraftPlan.defaultProps = defaultProps;

export const NewPlanningDraftPlan = () => {
  const prop = {
    pageType: PageType.General,
  };
  return <NewDraftPlan {...prop} />;
};

export default NewDraftPlan;
