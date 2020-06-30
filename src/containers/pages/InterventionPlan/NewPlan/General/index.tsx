import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Col, Row } from 'reactstrap';
import PlanForm, {
  defaultInitialValues,
  PlanFormProps,
} from '../../../../../components/forms/PlanForm';
import { getFormActivities, IRSActivities } from '../../../../../components/forms/PlanForm/helpers';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { COUNTRY, CREATE_NEW_PLAN, HOME, PLANS } from '../../../../../configs/lang';
import {
  ASSIGN_JURISDICTIONS_URL,
  HOME_URL,
  NEW_PLAN_URL,
  PLAN_LIST_URL,
} from '../../../../../constants';
import { InterventionType } from '../../../../../store/ducks/plans';
import { JurisdictionDetails } from './JurisdictionDetails';

/** expose props that would enable one to customize the underlying planForm props */
interface BaseNewPlanProps {
  extraPlanFormProps: Partial<PlanFormProps>;
}

/** the default props */
export const defaultBasePlanProps = {
  extraPlanFormProps: { redirectAfterAction: ASSIGN_JURISDICTIONS_URL },
};

/** dynamically supply props during runtime when the interventionType changes
 * ps: the planForm passed in the props take the highest precedence
 */
const planFormPropsLookUp = {
  [InterventionType.IRS]: {
    allowMoreJurisdictions: false,
    cascadingSelect: false,
    initialValues: {
      ...defaultInitialValues,
      activities: getFormActivities(IRSActivities),
      interventionType: InterventionType.IRS,
    },
    jurisdictionLabel: COUNTRY,
    redirectAfterAction: ASSIGN_JURISDICTIONS_URL,
  },
  [InterventionType.FI]: {},
  [InterventionType.MDA]: {},
  [InterventionType.MDAPoint]: {},
};

/** Simple component that loads the new plan form and allows you to create a new plan */
const BaseNewPlan = (props: BaseNewPlanProps) => {
  const [formValues, setFormValues] = useState(defaultInitialValues);
  const formValuesHandler = (_: any, next: any) => {
    setFormValues(next.values);
  };

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

  const lookedUpPlanFormProps = planFormPropsLookUp[formValues.interventionType] || {};

  const planFormProps = {
    ...{ ...lookedUpPlanFormProps, initialValues: formValues, ...props.extraPlanFormProps },
    formHandler: formValuesHandler,
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
      <Row>
        <Col md={8} id="planform-col-container">
          <PlanForm {...planFormProps} key={formValues.interventionType} />
        </Col>
        <Col md={4}>
          {formValues.interventionType === InterventionType.FI &&
            formValues.jurisdictions[0].id !== '' && (
              <JurisdictionDetails planFormJurisdiction={formValues.jurisdictions[0]} />
            )}
        </Col>
      </Row>
    </div>
  );
};

BaseNewPlan.defaultProps = defaultBasePlanProps;

/** IRS-specific form for  creating a plan */
export const NewIRSPlan = () => {
  const baseNewPlanProps = {
    extraPlanFormProps: {
      allowMoreJurisdictions: false,
      cascadingSelect: false,
      disabledFields: ['interventionType', 'status'],
      initialValues: {
        ...defaultInitialValues,
        activities: getFormActivities(IRSActivities),
        interventionType: InterventionType.IRS,
      },
      jurisdictionLabel: COUNTRY,
      redirectAfterAction: ASSIGN_JURISDICTIONS_URL,
    },
  };
  return <BaseNewPlan {...baseNewPlanProps} />;
};

export default BaseNewPlan;
