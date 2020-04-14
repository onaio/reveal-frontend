import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import PlanForm, {
  LocationChildRenderProp,
  propsForUpdatingPlans,
} from '../../../../components/forms/PlanForm';
import { getPlanFormValues } from '../../../../components/forms/PlanForm/helpers';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { HOME, PLANS, UPDATE_PLAN } from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { HOME_URL, NEW_PLAN_URL, OPENSRP_PLANS, PLAN_LIST_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { abortFetch } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import { fetchEvents } from '../../../../store/ducks/opensrp/events';
import planDefinitionReducer, {
  addPlanDefinition,
  getPlanDefinitionById,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import ConnectedCaseDetails, { CaseDetailsProps } from './CaseDetails';
import ConnectedPlanLocationNames from './PlanLocationNames';
import { getEventId, planIsReactive } from './utils';

/** register the plan definitions reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

/** UpdatePlanProps interface */
interface UpdatePlanProps {
  fetchPlan: typeof addPlanDefinition;
  plan: PlanDefinition | null;
  service: typeof OpenSRPService;
}

/** Route params interface */
export interface RouteParams {
  id: string;
}

/** Component used to update Plan Definition objects */
const UpdatePlan = (props: RouteComponentProps<RouteParams> & UpdatePlanProps) => {
  const { fetchPlan, plan, service } = props;
  const planIdentifier = props.match.params.id;
  const controller = new AbortController();
  const signal = controller.signal;

  if (!planIdentifier) {
    return null; /** we should make this into a better error page */
  }
  const apiService = new service(OPENSRP_PLANS, signal);

  /** async function to load the data */
  async function loadData() {
    try {
      const planFromAPI = await apiService.read(planIdentifier);
      const currentPlan = Array.isArray(planFromAPI) ? planFromAPI[0] : planFromAPI;
      fetchPlan(currentPlan);
    } catch (e) {
      displayError(e);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
    return () => abortFetch({ controller });
  }, []);

  if (plan === null) {
    return <Loading />;
  }

  const pageTitle: string = plan ? `${UPDATE_PLAN}: ${plan.title}` : UPDATE_PLAN;

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

  const planFormProps = {
    ...propsForUpdatingPlans,
    ...(plan && { initialValues: getPlanFormValues(plan) }),
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
const mapDispatchToProps = { fetchPlan: addPlanDefinition };

/** Connected ActiveFI component */
const ConnectedUpdatePlan = connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdatePlan);

export default ConnectedUpdatePlan;
