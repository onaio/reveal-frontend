// container/view that lists draft plans. part of planning tool.
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { BreadCrumbProps } from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { DRAFT_PLANS, HOME } from '../../../../../configs/lang';
import { HOME_URL, NEW_PLANNING_PLAN_URL, PLANNING_VIEW_URL } from '../../../../../constants';
import { PlanStatus } from '../../../../../store/ducks/plans';
import {
  createConnectedOpenSRPPlansList,
  OpenSRPPlanListViewProps,
} from '../helpers/OpenSRPPlansList';
import { draftPageColumns, draftPlansPageBodyFactory } from '../helpers/utils';

const ConnectedOpenSRPPlansList = createConnectedOpenSRPPlansList();

/** list draft plans */
export const DraftPlans = (props: RouteComponentProps) => {
  const pageTitle = DRAFT_PLANS;
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: DRAFT_PLANS,
      url: PLANNING_VIEW_URL,
    },
    pages: [homePage],
  };

  const renderBody = draftPlansPageBodyFactory({
    breadCrumbProps,
    newPlanUrl: NEW_PLANNING_PLAN_URL,
    pageTitle,
  });

  const opensrpListProps: Partial<OpenSRPPlanListViewProps> & RouteComponentProps = {
    ...props,
    planStatuses: [PlanStatus.DRAFT],
    renderBody,
    tableColumns: draftPageColumns,
  };

  return <ConnectedOpenSRPPlansList {...opensrpListProps} />;
};
