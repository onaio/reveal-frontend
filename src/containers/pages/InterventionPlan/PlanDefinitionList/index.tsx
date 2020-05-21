import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { SearchForm } from '../../../../components/forms/Search';
import { UserSelectFilter } from '../../../../components/forms/UserFilter';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  ADD_PLAN,
  HOME,
  INTERVENTION_TYPE_LABEL,
  LAST_MODIFIED,
  PLANS,
  SEARCH,
  STATUS_HEADER,
  TITLE,
} from '../../../../configs/lang';
import { PlanDefinition, planStatusDisplay } from '../../../../configs/settings';
import {
  HOME_URL,
  OPENSRP_PLANS,
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  QUERY_PARAM_TITLE,
  QUERY_PARAM_USER,
} from '../../../../constants';
import { loadPlansByUserFilter } from '../../../../helpers/dataLoading/plans';
import { displayError } from '../../../../helpers/errors';
import { getQueryParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import planDefinitionReducer, {
  fetchPlanDefinitions,
  makePlanDefinitionsArraySelector,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';

/** register the plan definitions reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchPlanDefinitions;
  plans: PlanDefinition[];
  service: typeof OpenSRPService;
  userName: string | null;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const PlanDefinitionList = (props: PlanListProps & RouteComponentProps) => {
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
      displayError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (props.userName) {
      loadPlansByUserFilter(props.userName, props.fetchPlans).catch(err => displayError(err));
    }
  }, [props.userName]);

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, []);

  const listViewData = (data: PlanDefinition[]) =>
    data.map(planObj => {
      const typeUseContext = planObj.useContext.filter(e => e.code === 'interventionType');

      return [
        <Link to={`${PLAN_UPDATE_URL}/${planObj.identifier}`} key={planObj.identifier}>
          {planObj.title}
        </Link>,
        typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : '',
        planStatusDisplay[planObj.status] || planObj.status,
        planObj.date,
      ];
    });

  if (loading === true) {
    return <Loading />;
  }

  const listViewProps = {
    data: listViewData(plans),
    headerItems: [TITLE, INTERVENTION_TYPE_LABEL, STATUS_HEADER, LAST_MODIFIED],
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
          <LinkAsButton
            classNameProp="focus-investigation btn btn-primary float-right mt-3 mb-3"
            text={ADD_PLAN}
          />
        </Col>
      </Row>
      <hr />
      <div style={{ display: 'inline-block' }}>
        <SearchForm placeholder={SEARCH} queryParam={QUERY_PARAM_TITLE} />
      </div>
      <UserSelectFilter serviceClass={OpenSRPService} />
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
  userName: null,
};

PlanDefinitionList.defaultProps = defaultProps;

export { PlanDefinitionList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plans: PlanDefinition[];
  userName: string | null;
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const userName = getQueryParams(ownProps.location)[QUERY_PARAM_USER] as string;
  const planDefinitionsArray = makePlanDefinitionsArraySelector()(state, {
    title: searchedTitle,
    userName,
  });

  return {
    plans: planDefinitionsArray,
    userName,
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
