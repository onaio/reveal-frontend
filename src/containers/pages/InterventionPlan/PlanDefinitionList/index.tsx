import { DrillDownTable, DrillDownTableProps } from '@onaio/drill-down-table-v7';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { createChangeHandler, SearchForm } from '../../../../components/forms/Search';
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
import plansByUserReducer, {
  makePlansByUserNamesSelector,
  reducerName as plansByUserReducerName,
} from '../../../../store/ducks/opensrp/planIdsByUser';
import { TableColumns } from './utils';
import { renderInFilterFactory, defaultOptions } from '../../../../components/Table/DrillDownFilters/utils';

/** register the plan definitions reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);
reducerRegistry.register(plansByUserReducerName, plansByUserReducer);

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchPlanDefinitions;
  plans: PlanDefinition[];
  service: typeof OpenSRPService;
  userName: string | null;
}

/** Plans filter selector */
const plansDefinitionsArraySelector = makePlanDefinitionsArraySelector(
  'planDefinitionsById',
  'date'
);

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
      loadPlansByUserFilter(props.userName).catch(err => displayError(err));
    }
  }, [props.userName]);

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, []);

  const tableProps: Pick<
    DrillDownTableProps<PlanDefinition>,
    | 'columns'
    | 'data'
    | 'loading'
    | 'loadingComponent'
    | 'renderInBottomFilterBar'
    | 'renderInTopFilterBar'
    | 'useDrillDown'
  > = {
    columns: TableColumns,
    data: plans,
    loading,
    loadingComponent: Loading,
    renderInBottomFilterBar: renderInFilterFactory({
      history: props.history,
      location: props.location,
      showColumnHider: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      history: props.history,
      location: props.location,
      ...defaultOptions,
    }),
    useDrillDown: false,
  };

  const searchFormChangeHandler = createChangeHandler(QUERY_PARAM_TITLE, props);

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
        <SearchForm placeholder={SEARCH} onChangeHandler={searchFormChangeHandler} />
      </div>
      <UserSelectFilter serviceClass={props.service} />
      <Row>
        <Col>
          <DrillDownTable {...tableProps} />
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
  const planIds = makePlansByUserNamesSelector()(state, { userName });
  const planDefinitionsArray = plansDefinitionsArraySelector(state, {
    planIds,
    title: searchedTitle,
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
