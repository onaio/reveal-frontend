import ListView from '@onaio/list-view';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { createChangeHandler, SearchForm } from '../../../components/forms/Search';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../components/page/Loading';
import {
  DATE_CREATED,
  END_DATE,
  HOME,
  SEARCH,
  START_DATE,
  STATUS_HEADER,
  TITLE,
} from '../../../configs/lang';
import { planStatusDisplay } from '../../../configs/settings';
import { HOME_URL, QUERY_PARAM_TITLE } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import supersetFetch from '../../../services/superset';
import { fetchMDAPointPlans } from '../../../store/ducks/generic/MDAPointPlans';
import { fetchIRSPlans, GenericPlan } from '../../../store/ducks/generic/plans';

/** interface for GenericPlanList props */
export interface GenericPlanListProps {
  fetchPlans: typeof fetchIRSPlans | typeof fetchMDAPointPlans;
  pageTitle: string;
  pageUrl: string;
  plans: GenericPlan[];
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

  const listViewData = (planList: GenericPlan[]) =>
    planList.map(planObj => {
      return [
        <Link to={`${pageUrl}/${planObj.plan_id}`} key={planObj.plan_id}>
          {planObj.plan_title}
        </Link>,
        planObj.plan_date,
        planObj.plan_effective_period_start,
        planObj.plan_effective_period_end,
        planStatusDisplay[planObj.plan_status] || planObj.plan_status,
      ];
    });

  if (loading === true) {
    return <Loading />;
  }

  const listViewProps = {
    data: listViewData(plans),
    headerItems: [TITLE, DATE_CREATED, START_DATE, END_DATE, STATUS_HEADER],
    tableClass: 'table table-bordered plans-list',
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
      </Row>
      <hr />
      <SearchForm placeholder={SEARCH} onChangeHandler={searchFormChangeHandler} />

      <Row>
        <Col>
          <ListView {...listViewProps} />
        </Col>
      </Row>
    </div>
  );
};
