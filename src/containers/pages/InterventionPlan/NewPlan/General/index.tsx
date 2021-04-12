import { Registry } from '@onaio/redux-reducer-registry/dist/types';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { ActionCreator, Store } from 'redux';
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
import { AUTO_SELECT_FI_CLASSIFICATION, DISPLAYED_PLAN_TYPES } from '../../../../../configs/env';
import {
  COUNTRY,
  CREATE_NEW_PLAN,
  DRAFT_PLANS,
  FOCUS_AREA_HEADER,
  HOME,
  PLANS,
} from '../../../../../configs/lang';
import {
  HOME_URL,
  NEW_PLAN_URL,
  PLAN_LIST_URL,
  PLAN_RECORD_BY_ID,
  PLANNING_VIEW_URL,
  QUERY_PARAM_TITLE,
} from '../../../../../constants';
import { getQueryParams } from '../../../../../helpers/utils';
import { addPlanDefinition } from '../../../../../store/ducks/opensrp/PlanDefinition';
import {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  InterventionType,
  makePlansArraySelector,
  PlanRecord,
} from '../../../../../store/ducks/plans';
import {
  DataSelectors,
  OpenSRPPlanListViewProps,
} from '../../PlanningView/helpers/OpenSRPPlansList';
import { JurisdictionDetails } from './JurisdictionDetails';

/** expose props that would enable one to customize the underlying planForm props */
interface BaseNewPlanProps {
  plansArray: PlanRecord[];
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
  plansArray: [],
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
  const { addPlan, plansArray, fetchPlanRecordsCreator } = props;
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
    plansArray,
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

/** maps props to state */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: RouteComponentProps & OpenSRPPlanListViewProps
): { plansArray: PlanRecord[] } => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const { planStatuses, interventionTypes } = ownProps;
  const interventionType =
    interventionTypes && interventionTypes.length
      ? interventionTypes
      : (DISPLAYED_PLAN_TYPES as InterventionType[]);
  const dataSelectors: DataSelectors = {
    interventionType,
    statusList: planStatuses,
    title,
  };

  const plansRecordsArray = plansArraySelector(state as Registry, dataSelectors) as PlanRecord[];
  // sort by date
  if (ownProps.sortByDate) {
    plansRecordsArray.sort((a, b) => Date.parse(b.plan_date) - Date.parse(a.plan_date));
  }
  const props = { plansArray: plansRecordsArray };
  return props;
};
/** map dispatch to props */
const mapDispatchToProps = {
  addPlan: addPlanDefinition,
  fetchPlanRecordsCreator: fetchPlanRecords,
};

/** form used in the planning tool */
const NewPlanForm = (props: BaseNewPlanProps) => {
  const baseNewPlanProps: Partial<BaseNewPlanProps> = {
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
  return <BaseNewPlan {...{ ...props, ...baseNewPlanProps }} />;
};

export const NewPlanForPlanning = connect(mapStateToProps, mapDispatchToProps)(NewPlanForm);

const ConnectedBaseNewPlan = connect(mapStateToProps, mapDispatchToProps)(BaseNewPlan);

export default ConnectedBaseNewPlan;
