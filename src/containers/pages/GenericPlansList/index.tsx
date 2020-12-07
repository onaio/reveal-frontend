import { DrillDownTable } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../components/page/Loading';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../components/Table/NoDataComponent';
import {
  DATE_CREATED,
  END_DATE,
  HOME,
  START_DATE,
  STATUS_HEADER,
  TITLE,
} from '../../../configs/lang';
import { planStatusDisplay } from '../../../configs/settings';
import { HOME_URL, QUERY_PARAM_TITLE } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { DefaultDrillDownPropsType } from '../../../helpers/utils';
import supersetFetch from '../../../services/superset';
import { genericFetchPlans, GenericPlan } from '../../../store/ducks/generic/plans';
import { fetchSMCPlans, SMCPLANType } from '../../../store/ducks/generic/SMCPlans';
import './index.css';

/** interface for GenericPlanList props */
export interface GenericPlanListProps {
  fetchPlans: typeof genericFetchPlans | typeof fetchSMCPlans;
  pageTitle: string;
  pageUrl: string;
  plans: GenericPlan[] | SMCPLANType[];
  service: typeof supersetFetch;
  supersetReportingSlice: string;
}

/** Simple component that loads a list of plans passed to it */
export const GenericPlansList = (props: GenericPlanListProps & RouteComponentProps) => {
  const { fetchPlans, plans, service, pageUrl, pageTitle, supersetReportingSlice } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
      url: pageUrl,
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
      await service(supersetReportingSlice).then((result: GenericPlan[]) => {
        fetchPlans(result);
      });
    } catch (e) {
      // do something with the error?
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(error => displayError(error));
  }, []);

  const columns = [
    {
      Cell: (planObj: Cell<GenericPlan>) => {
        const original = planObj.row.original;
        return (
          <Link to={`${pageUrl}/${original.plan_id}`} key={original.plan_id}>
            {original.plan_title}
          </Link>
        );
      },
      Header: TITLE,
      accessor: 'plan_title',
      minWidth: 660,
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
      accessor: (d: Dictionary) => planStatusDisplay[d.plan_status] || d.plan_status,
      id: 'plan_status',
    },
  ];

  const drillDownProps: DefaultDrillDownPropsType = {
    columns,
    data: plans,
    loading,
    loadingComponent: Loading,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      componentProps: props,
      queryParam: QUERY_PARAM_TITLE,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
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
      </Row>
      <hr />
      <Row>
        <Col>
          <DrillDownTable {...drillDownProps} />
        </Col>
      </Row>
    </div>
  );
};
