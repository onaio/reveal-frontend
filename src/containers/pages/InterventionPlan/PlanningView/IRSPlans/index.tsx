import { Registry } from '@onaio/redux-reducer-registry';
import * as React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import { Store } from 'redux';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  CREATE_NEW_PLAN,
  DRAFT_PLANS,
  DRAFTS_PARENTHESIS,
  HOME,
  IRS_PLANS,
} from '../../../../../configs/lang';
import {
  HOME_URL,
  INTERVENTION_IRS_DRAFTS_URL,
  INTERVENTION_IRS_URL,
  NEW,
  PLAN_RECORD_BY_ID,
  QUERY_PARAM_TITLE,
} from '../../../../../constants';
import { getQueryParams } from '../../../../../helpers/utils';
import {
  InterventionType,
  makePlansArraySelector,
  PlanStatus,
} from '../../../../../store/ducks/plans';
import {
  createConnectedOpenSRPPlansList,
  OpenSRPPlanListViewProps,
  RenderProp,
} from '../helpers/OpenSRPPlansList';
import { irsDraftPageColumns } from '../helpers/utils';

const mapStateToProps = (state: Partial<Store>, ownProps: RouteComponentProps): any => {
  const plansArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);
  const title = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const planStatus = [PlanStatus.DRAFT];
  const plansRecordsArray = plansArraySelector(state as Registry, {
    interventionType: InterventionType.IRS,
    statusList: planStatus,
    title,
  });
  const props = {
    plansArray: plansRecordsArray,
  };
  return props;
};

export const ConnectedOpenSRPPlansList = createConnectedOpenSRPPlansList(mapStateToProps);

/** list IRS plans */
export const IRSPlans = (props: RouteComponentProps) => {
  const pageTitle = `${IRS_PLANS}${DRAFTS_PARENTHESIS}`;
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: DRAFT_PLANS,
      url: INTERVENTION_IRS_DRAFTS_URL,
    },
    pages: [homePage],
  };

  const renderBody = (renderProp: RenderProp) => {
    return (
      <div className="mb-5">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">{pageTitle}</h2>
        {renderProp()}
        <br />
        <Button
          className="create-plan"
          color="primary"
          tag={Link}
          to={`${INTERVENTION_IRS_URL}/${NEW}`}
        >
          {CREATE_NEW_PLAN}
        </Button>
      </div>
    );
  };

  const opensrpListProps: Partial<OpenSRPPlanListViewProps> & RouteComponentProps = {
    ...props,
    renderBody,
    tableColumns: irsDraftPageColumns,
  };

  return <ConnectedOpenSRPPlansList {...opensrpListProps} />;
};
