import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { PlanDefinition } from '../../../../configs/settings';
import { HOME, HOME_URL, PLAN_LIST_URL, PLANS } from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import planDefinitionReducer, {
  fetchPlanDefinitions,
  getPlanDefinitionsArray,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';

/** register the goals reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchPlanDefinitions;
  plans: PlanDefinition[] | null;
  service: typeof OpenSRPService;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const PlanDefinitionList = (props: PlanListProps) => {
  const { fetchPlans, plans, service } = props;

  const apiService = new service('/plans');

  apiService
    .list()
    .then((e: PlanDefinition[]) => {
      fetchPlans(e);
    })
    .catch((e: Error) => {
      // do something with the error?
    });

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

  if (!plans) {
    return <Loading />;
  }

  const listViewProps = {
    data: plans.map(planObj => {
      const typeUseContext = planObj.useContext.filter(e => e.code === 'interventionType');

      return [
        planObj.title,
        typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : '',
        planObj.status,
        planObj.date,
      ];
    }),
    headerItems: ['Title', 'Intervention Type', 'Status', 'Last Modified'],
    tableClass: 'table table-striped plans-list',
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <h3 className="mb-3 page-title">{pageTitle}</h3>
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
  plans: PlanDefinition[] | null;
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
