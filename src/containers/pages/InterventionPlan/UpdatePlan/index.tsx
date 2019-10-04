import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { PlanDefinition } from '../../../../configs/settings';
import {
  HOME,
  HOME_URL,
  NEW_PLAN_URL,
  OPENSRP_PLANS,
  PLAN_LIST_URL,
  PLANS,
  UPDATE_PLAN,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import planDefinitionReducer, {
  addPlanDefinition,
  getPlanDefinitionById,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import PlanForm, { propsForUpdatingPlans } from '../../../forms/PlanForm';
import { getPlanFormValues } from '../../../forms/PlanForm/helpers';

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
  const [loading, setLoading] = useState<boolean>(true);

  if (!planIdentifier) {
    return null; /** we should make this into a better error page */
  }

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(plan === null); // only set loading when there are no plans
      const planFromAPI = await apiService.read(planIdentifier);
      fetchPlan(planFromAPI);
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading === true) {
    return <Loading />;
  }

  const apiService = new service(OPENSRP_PLANS);
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
