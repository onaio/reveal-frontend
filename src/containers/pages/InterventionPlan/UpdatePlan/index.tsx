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
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  PLANS,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import planDefinitionReducer, {
  addPlanDefinition,
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

  const apiService = new service('/plans');
  const pageTitle: string = plan ? `Update Plan: ${plan.title}` : 'Update Plan';

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
// interface DispatchedStateProps {
//   plans: PlanDefinition[];
// }

// /** map state to props */
// const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
//   const planDefinitionsArray = getPlanDefinitionsArray(state);

//   return {
//     plans: planDefinitionsArray,
//   };
// };

// /** map dispatch to props */
// const mapDispatchToProps = { fetchPlans: fetchPlanDefinitions };

// /** Connected ActiveFI component */
// const ConnectedPlanDefinitionList = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(PlanDefinitionList);

// export default ConnectedPlanDefinitionList;
