import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import LinkToNewPlans from '../../../../components/LinkToNewPlans';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { PlanDefinition } from '../../../../configs/settings';
import {
  HOME,
  HOME_URL,
  OPENSRP_PLANS,
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  PLANS,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import planDefinitionReducer, {
  fetchPlanDefinitions,
  getPlanDefinitionsArray,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';

/** register the plan definitions reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchPlanDefinitions;
  plans: PlanDefinition[];
  service: typeof OpenSRPService;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const PlanDefinitionList = (props: PlanListProps) => {
  const { fetchPlans, plans, service } = props;
  const [loading, setLoading] = useState<boolean>(true);

  const apiService = new service(OPENSRP_PLANS);

  const pageTitle: string = PLANS;

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: PLAN_LIST_URL,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(plans.length < 1); // only set loading when there are no plans
      const planObjects = await apiService.list();
      fetchPlans(planObjects);
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

  const listViewProps = {
    data: plans.map(planObj => {
      const typeUseContext = planObj.useContext.filter(e => e.code === 'interventionType');

      return [
        <Link to={`${PLAN_UPDATE_URL}/${planObj.identifier}`} key={planObj.identifier}>
          {planObj.title}
        </Link>,
        typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : '',
        planObj.status,
        planObj.date,
      ];
    }),
    headerItems: ['Title', 'Intervention Type', 'Status', 'Last Modified'],
    tableClass: 'table table-bordered plans-list',
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{pageTitle}</h3>
        </Col>
        <Col md={4}>
          <LinkToNewPlans
            className="focus-investigation btn btn-primary float-right mt-3 mb-3"
            text="Add Plan"
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <ListView {...listViewProps} />
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for PlanDefinitionList */
const defaultProps: PlanListProps = {
  fetchPlans: fetchPlanDefinitions,
  plans: [],
  service: OpenSRPService,
};

PlanDefinitionList.defaultProps = defaultProps;

export { PlanDefinitionList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plans: PlanDefinition[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>): DispatchedStateProps => {
  const planDefinitionsArray = getPlanDefinitionsArray(state);

  return {
    plans: planDefinitionsArray,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchPlanDefinitions };

/** Connected ActiveFI component */
const ConnectedPlanDefinitionList = connect(
  mapStateToProps,
  mapDispatchToProps
)(PlanDefinitionList);

export default ConnectedPlanDefinitionList;
