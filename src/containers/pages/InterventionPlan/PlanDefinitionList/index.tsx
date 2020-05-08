import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils/dist/types/types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Cell, Row as RowType, UseTableOptions } from 'react-table';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { RowHeightFilter } from '../../../../components/forms/FilterForm/RowHeightFilter';
import SearchForm from '../../../../components/forms/Search';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { DrillDownTablev7 } from '../../../../components/Table/DrillDown';
import { RenderFiltersInBarOptions } from '../../../../components/Table/DrillDown';
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
import { PlanDefinition, planStatusDisplay, UseContext } from '../../../../configs/settings';
import {
  HOME_URL,
  OPENSRP_PLANS,
  PLAN_LIST_URL,
  PLAN_UPDATE_URL,
  QUERY_PARAM_TITLE,
} from '../../../../constants';
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
    loadData().catch(err => displayError(err));
  }, []);

  const TableColumns = React.useMemo(
    () => [
      {
        Cell: (cell: Cell<PlanDefinition>) => {
          const original = cell.row.original;
          return (
            <Link to={`${PLAN_UPDATE_URL}/${original.identifier}`} key={original.identifier}>
              {cell.value}
            </Link>
          );
        },
        Header: TITLE,
        accessor: 'title',
      },
      {
        Cell: ({ value }: Cell<PlanDefinition>) => {
          const typeUseContext = value.filter((e: any) => e.code === 'interventionType');
          return typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : null;
        },
        Header: INTERVENTION_TYPE_LABEL,
        accessor: 'useContext',
        sortType: (rowA: RowType, rowB: RowType, columnId: string) => {
          const getIntervention = (row: RowType) => {
            const interventionPlanContext = (row.original as Dictionary)[columnId].filter(
              (context: UseContext) => context.code === 'interventionType'
            );
            return interventionPlanContext.length > 0
              ? interventionPlanContext[0].valueCodableConcept
              : '';
          };
          return getIntervention(rowA) > getIntervention(rowB) ? 1 : -1;
        },
      },
      {
        Cell: (cell: Cell<PlanDefinition>) => {
          return planStatusDisplay[cell.value] || null;
        },
        Header: STATUS_HEADER,
        accessor: 'status',
      },
      {
        Header: LAST_MODIFIED,
        accessor: 'date',
      },
    ],
    []
  );

  const DrillDownTableProps = {
    columns: TableColumns,
    data: plans,
    loading,
    loadingComponent: Loading,
    renderInFilterBar: (options: RenderFiltersInBarOptions) => {
      const changeHandler = (value: string) => options.setRowHeight(value);
      return (
        <>
          <SearchForm placeholder={SEARCH} queryParam={QUERY_PARAM_TITLE} />
          <RowHeightFilter changeHandler={changeHandler} />
        </>
      );
    },
    useDrillDown: false,
  };

  if (loading === true) {
    return <Loading />;
  }

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
      <Row>
        <Col>
          <DrillDownTablev7 {...(DrillDownTableProps as UseTableOptions<PlanDefinition>)} />
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
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const planDefinitionsArray = makePlanDefinitionsArraySelector()(state, {
    title: searchedTitle,
  });

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
