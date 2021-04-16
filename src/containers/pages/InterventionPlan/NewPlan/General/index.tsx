import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { ActionCreator } from 'redux';
import PlanForm, {
  defaultInitialValues,
  PlanFormProps,
} from '../../../../../components/forms/PlanForm';
import {
  isFIOrDynamicFI,
  planActivitiesMap,
} from '../../../../../components/forms/PlanForm/helpers';
import HeaderBreadcrumb, {
  Page,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { AUTO_SELECT_FI_CLASSIFICATION } from '../../../../../configs/env';
import {
  COUNTRY,
  CREATE_NEW_PLAN,
  DRAFT_PLANS,
  FOCUS_AREA_HEADER,
  HOME,
  PLANS,
} from '../../../../../configs/lang';
import { HOME_URL, NEW_PLAN_URL, PLAN_LIST_URL, PLANNING_VIEW_URL } from '../../../../../constants';
import { addPlanDefinition } from '../../../../../store/ducks/opensrp/PlanDefinition';
import {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  InterventionType,
} from '../../../../../store/ducks/plans';
import { JurisdictionDetails } from './JurisdictionDetails';

/** expose props that would enable one to customize the underlying planForm props */
interface BaseNewPlanProps {
  fetchPlanRecordsCreator: ActionCreator<FetchPlanRecordsAction>;
  addPlan: typeof addPlanDefinition;
  extraPlanFormProps: Partial<PlanFormProps>;
  breadCrumbParentPage: Page;
  showJurisdictionDetails: boolean;
}

/** the default props */
export const defaultBasePlanProps = {
  addPlan: addPlanDefinition,
  breadCrumbParentPage: {
    label: PLANS,
    url: PLAN_LIST_URL,
  },
  extraPlanFormProps: { redirectAfterAction: PLAN_LIST_URL },
  showJurisdictionDetails: true,
};

/** portion of planform props that configures how the field(s) used to
 * add jurisdictions to a plan behave
 */
const managePlansLocationFieldProps = {
  allowMoreJurisdictions: true,
  cascadingSelect: true,
  jurisdictionLabel: FOCUS_AREA_HEADER,
};

/** dynamically supply props during runtime when the interventionType changes
 * Reason: the planForm is using a key (the intervention type); once the intervention changes
 *  the planForm does not re-render it remounts, the look up gives it a place to get the props it should
 *  use, especially the initialValues. otherwise it will fallback to using the default initialValues set in state
 *  which will by default reset some values like intervention type back to FI, which is sth we don't necessarily want.
 * ps: the planFormProps passed in the components props take the higher precedence
 */
const planFormPropsLookUp = {
  [InterventionType.IRS]: {
    allowMoreJurisdictions: true,
    cascadingSelect: true,
    initialValues: {
      ...defaultInitialValues,
      activities: planActivitiesMap[InterventionType.IRS],
      interventionType: InterventionType.IRS,
    },
    jurisdictionLabel: FOCUS_AREA_HEADER,
    redirectAfterAction: PLAN_LIST_URL,
  },
  [InterventionType.FI]: {},
  [InterventionType.MDA]: {},
  [InterventionType.MDAPoint]: {},
  [InterventionType.DynamicFI]: {},
  [InterventionType.DynamicIRS]: {
    ...managePlansLocationFieldProps,
  },
  [InterventionType.DynamicMDA]: {
    ...managePlansLocationFieldProps,
  },
  [InterventionType.IRSLite]: {},
  [InterventionType.MDALite]: {},
};

/** Simple component that loads the new plan form and allows you to create a new plan */
const BaseNewPlan = (props: BaseNewPlanProps) => {
  const { addPlan, fetchPlanRecordsCreator } = props;
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
      props.breadCrumbParentPage,
    ],
  };

  const lookedUpPlanFormProps = planFormPropsLookUp[formValues.interventionType] || {};

  const planFormProps = {
    ...{ ...lookedUpPlanFormProps, initialValues: formValues, ...props.extraPlanFormProps },
    actionCreator: fetchPlanRecordsCreator,
    autoSelectFIStatus: AUTO_SELECT_FI_CLASSIFICATION,
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
          <PlanForm {...planFormProps} key={formValues.interventionType} addPlan={addPlan} />
        </Col>
        {props.showJurisdictionDetails && (
          <Col md={4}>
            {isFIOrDynamicFI(formValues.interventionType) &&
              formValues.jurisdictions[0].id !== '' && (
                <JurisdictionDetails planFormJurisdiction={formValues.jurisdictions[0]} />
              )}
          </Col>
        )}
      </Row>
    </div>
  );
};

BaseNewPlan.defaultProps = defaultBasePlanProps;

/** map dispatch to props */
const mapDispatchToProps = {
  addPlan: addPlanDefinition,
  fetchPlanRecordsCreator: fetchPlanRecords,
};

/** Connected component */
const ConnectedBaseNewPlan = connect(null, mapDispatchToProps)(BaseNewPlan);

/** form used in the planning tool */
export const NewPlanForPlanning = () => {
  const baseNewPlanProps = {
    addPlan: addPlanDefinition,
    breadCrumbParentPage: {
      label: DRAFT_PLANS,
      url: PLANNING_VIEW_URL,
    },
    extraPlanFormProps: {
      allowMoreJurisdictions: false,
      cascadingSelect: false,
      jurisdictionLabel: COUNTRY,
      redirectAfterAction: PLANNING_VIEW_URL,
    },
    showJurisdictionDetails: false,
  };
  return <ConnectedBaseNewPlan {...baseNewPlanProps} />;
};

export default ConnectedBaseNewPlan;
