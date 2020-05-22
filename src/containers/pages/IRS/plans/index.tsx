import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Cell, Column } from 'react-table';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { RowHeightFilter } from '../../../../components/forms/FilterForm/RowHeightFilter';
import {SearchForm} from '../../../../components/forms/Search';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import { DrillDownTablev7 } from '../../../../components/Table/DrillDown';
import { RenderFiltersInBarOptions } from '../../../../components/Table/DrillDown';
import { SUPERSET_IRS_REPORTING_PLANS_SLICE } from '../../../../configs/env';
import {
  DATE_CREATED,
  END_DATE,
  HOME,
  IRS_PLANS,
  SEARCH,
  START_DATE,
  STATUS_HEADER,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import { HOME_URL, QUERY_PARAM_TITLE, REPORT_IRS_PLAN_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { getQueryParams } from '../../../../helpers/utils';
import supersetFetch from '../../../../services/superset';
import IRSPlansReducer, {
  fetchIRSPlans,
  IRSPlan,
  makeIRSPlansArraySelector,
  reducerName as IRSPlansReducerName,
} from '../../../../store/ducks/generic/plans';

/** register the plan definitions reducer */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

/** interface for PlanList props */
interface PlanListProps {
  fetchPlans: typeof fetchIRSPlans;
  plans: IRSPlan[];
  service: typeof supersetFetch;
}

/** Simple component that loads the new plan form and allows you to create a new plan */
const IRSPlansList = (props: PlanListProps & RouteComponentProps) => {
  const { fetchPlans, plans, service } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const pageTitle: string = IRS_PLANS;
  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: REPORT_IRS_PLAN_URL,
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
      await service(SUPERSET_IRS_REPORTING_PLANS_SLICE).then((result: IRSPlan[]) =>
        fetchPlans(result)
      );
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(error => displayError(error));
  }, []);

  const columns: Array<Column<IRSPlan>> = [
    {
      Cell: (cell: Cell<IRSPlan>) => {
        const original = cell.row.original;
        return <Link to={`${REPORT_IRS_PLAN_URL}/${original.plan_id}`}>{cell.value}</Link>;
      },
      Header: TITLE,
      accessor: 'plan_title',
    },
    {
      Header: DATE_CREATED,
      accessor: 'plan_date',
    },
    {
      Header: START_DATE,
      accessor: 'plan_effective_period_start',
    },
    {
      Header: END_DATE,
      accessor: 'plan_effective_period_end',
    },
    {
      Header: STATUS_HEADER,
      accessor: (d: IRSPlan) => planStatusDisplay[d.plan_status] || d.plan_status,
      id: 'plan_status',
    },
  ];

  const tableProps = {
    LoadingComponent: Loading,
    columns,
    data: plans,
    loading,
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
      </Row>
      <hr />
      <Row>
        <Col>
          <DrillDownTablev7 {...tableProps} />
        </Col>
      </Row>
    </div>
  );
};

/** Declare default props for IRSPlansList */
const defaultProps: PlanListProps = {
  fetchPlans: fetchIRSPlans,
  plans: [],
  service: supersetFetch,
};

IRSPlansList.defaultProps = defaultProps;

export { IRSPlansList };

/** Connect the component to the store */

/** interface to describe props from mapStateToProps */
interface DispatchedStateProps {
  plans: IRSPlan[];
}

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): DispatchedStateProps => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const IRSPlansArray = makeIRSPlansArraySelector()(state, { plan_title: searchedTitle });

  return {
    plans: IRSPlansArray,
  };
};

/** map dispatch to props */
const mapDispatchToProps = { fetchPlans: fetchIRSPlans };

/** Connected ActiveFI component */
const ConnectedIRSPlansList = connect(mapStateToProps, mapDispatchToProps)(IRSPlansList);

export default ConnectedIRSPlansList;
