import reducerRegistry from '@onaio/redux-reducer-registry';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { ActionCreator, Store } from 'redux';
import PlanForm, {
  LocationChildRenderProp,
  PlanFormProps,
  propsForUpdatingPlans,
} from '../../../../components/forms/PlanForm';
import { getPlanFormValues, isFIOrDynamicFI } from '../../../../components/forms/PlanForm/helpers';
import { ErrorPage } from '../../../../components/page/ErrorPage';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES,
  HIDE_PLAN_FORM_FIELDS_ON_EDIT,
} from '../../../../configs/env';
import { COULD_NOT_LOAD_PLAN, HOME, PLANS, UPDATE_PLAN } from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import {
  CASE_TRIGGERED,
  HOME_URL,
  NEW_PLAN_URL,
  OPENSRP_PLANS,
  PLAN_LIST_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { OpenSRPService } from '../../../../services/opensrp';
import { fetchEvents } from '../../../../store/ducks/opensrp/events';
import planDefinitionReducer, {
  addPlanDefinition,
  getPlanDefinitionById,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  PlanStatus,
} from '../../../../store/ducks/plans';
import ConnectedCaseDetails, { CaseDetailsProps } from './CaseDetails';
import ConnectedPlanLocationNames from './PlanLocationNames';
import { beforeSubmitFactory, getEventId, planIsReactive } from './utils';

/** register the plan definitions reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

/** UpdatePlanProps interface */
export interface UpdatePlanProps {
  fetchPlanRecordsCreator: ActionCreator<FetchPlanRecordsAction>;
  fetchPlan: typeof addPlanDefinition;
  plan: PlanDefinition | null;
  service: typeof OpenSRPService;
}

/** Route params interface */
export interface RouteParams {
  id: string;
}

/** plan statuses to hide field */
const hideFieldsOnPlanStatuses = [PlanStatus.ACTIVE, PlanStatus.COMPLETE, PlanStatus.DRAFT];

/** Component used to update Plan Definition objects */
const UpdatePlan = (props: RouteComponentProps<RouteParams> & UpdatePlanProps) => {
  const { fetchPlan, plan, service, fetchPlanRecordsCreator } = props;
  const planIdentifier = props.match.params.id;
  const [loading, setLoading] = useState<boolean>(true);

  const apiService = new service(OPENSRP_PLANS);

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(plan === null); // only set loading when there are no plans
      const planFromAPI = await apiService.read(planIdentifier);
      const currentPlan = Array.isArray(planFromAPI) ? planFromAPI[0] : planFromAPI;
      fetchPlan(currentPlan);
    } catch (e) {
      displayError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!planIdentifier) {
      return;
    }
    loadData().catch(err => displayError(err));
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!plan) {
    return <ErrorPage errorMessage={COULD_NOT_LOAD_PLAN} />;
  }

  const pageTitle: string = `${UPDATE_PLAN}: ${plan.title}`;

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
        url: `${PLAN_LIST_URL}`,
      },
    ],
  };

  /** Create a copy of mutable activities to allow splicing on PlanForm component
   *  when adding and removing activities
   */
  const { activities, ...theRest } = getPlanFormValues(plan);
  const activitiesCopy = _.cloneDeep(activities);
  const initialValues = {
    ...theRest,
    activities: activitiesCopy,
  };

  const beforeSubmit = beforeSubmitFactory(plan);
  const planStatus = (plan && plan.status) || '';

  const isCaseTriggeredAndDraft =
    CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES &&
    planStatus === PlanStatus.DRAFT &&
    isFIOrDynamicFI(initialValues.interventionType) &&
    initialValues.fiReason === CASE_TRIGGERED;
  const hiddenFields =
    HIDE_PLAN_FORM_FIELDS_ON_EDIT.length > 0 &&
    hideFieldsOnPlanStatuses.includes(initialValues.status) &&
    !isCaseTriggeredAndDraft
      ? HIDE_PLAN_FORM_FIELDS_ON_EDIT
      : [];

  const planFormProps: Partial<PlanFormProps> = {
    ...propsForUpdatingPlans(planStatus),
    actionCreator: fetchPlanRecordsCreator,
    addAndRemoveActivities: isCaseTriggeredAndDraft,
    addPlan: fetchPlan,
    autoSelectFIStatus: false,
    beforeSubmit,
    hiddenFields,
    initialValues,
    /** a renderProp prop. this tells the planForm; I will give you a component that knows of the plan you are displaying,
     * the component will get jurisdictions associated with that plan and render them as links, what you(planForm)
     * will do, is provide a child prop(a renderProp) that tells the mentioned component what other stuff you would wish
     * displayed alongside the jurisdiction names links.
     */
    renderLocationNames: (child?: LocationChildRenderProp) => (
      <ConnectedPlanLocationNames child={child} plan={plan} />
    ),
  };

  const caseDetailsProps: CaseDetailsProps = {
    event: null,
    eventId: null,
    fetchEventsCreator: fetchEvents,
    service: OpenSRPService,
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
          <PlanForm {...planFormProps} />
        </Col>
        <Col md={4}>
          {/* Only show case details if plan is reactive */}
          {planIsReactive(plan) && (
            <ConnectedCaseDetails {...{ ...caseDetailsProps, eventId: getEventId(plan) }} />
          )}
        </Col>
      </Row>
    </div>
  );
};

const defaultProps: UpdatePlanProps = {
  fetchPlan: addPlanDefinition,
  fetchPlanRecordsCreator: fetchPlanRecords,
  plan: null,
  service: OpenSRPService,
};

UpdatePlan.defaultProps = defaultProps;

export { UpdatePlan };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plan: PlanDefinition | null;
}

// /** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const planObj = getPlanDefinitionById(state, ownProps.match.params.id);
  return {
    plan: planObj,
  };
};

/** map dispatch to props */
const mapDispatchToProps = {
  fetchPlan: addPlanDefinition,
  fetchPlanRecordsCreator: fetchPlanRecords,
};

/** Connected ActiveFI component */
const ConnectedUpdatePlan = connect(mapStateToProps, mapDispatchToProps)(UpdatePlan);

export default ConnectedUpdatePlan;
