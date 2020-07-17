import { Registry } from '@onaio/redux-reducer-registry';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { BreadCrumbProps } from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { DRAFTS_PARENTHESIS, HOME, IRS_PLANS } from '../../../../../configs/lang';
import {
  HOME_URL,
  INTERVENTION_IRS_DRAFTS_URL,
  NEW_IRS_PLAN_URL,
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
  MapStateToProps,
  OpenSRPPlanListViewProps,
} from '../helpers/OpenSRPPlansList';
import { draftPlansPageBodyFactory, irsDraftPageColumns } from '../helpers/utils';

/** custom mapState that adds an intervention type filter
 * @param state - the store
 * @param ownProps - the props
 */
const mapStateToProps = (state: Partial<Store>, ownProps: RouteComponentProps): MapStateToProps => {
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

/** create connected list containers using custom mapState and mapDispatch */
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
      label: pageTitle,
      url: INTERVENTION_IRS_DRAFTS_URL,
    },
    pages: [homePage],
  };

  const renderBody = draftPlansPageBodyFactory({
    breadCrumbProps,
    newPlanUrl: NEW_IRS_PLAN_URL,
    pageTitle,
  });

  const opensrpListProps: Partial<OpenSRPPlanListViewProps> & RouteComponentProps = {
    ...props,
    activePlans: [PlanStatus.DRAFT],
    renderBody,
    tableColumns: irsDraftPageColumns,
  };

  return <ConnectedOpenSRPPlansList {...opensrpListProps} />;
};
