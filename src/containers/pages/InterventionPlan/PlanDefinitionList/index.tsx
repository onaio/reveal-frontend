import React from 'react';
import { RouteComponentProps } from 'react-router';
import { BreadCrumbProps } from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HIDDEN_PLAN_STATUSES } from '../../../../configs/env';
import { ADD_PLAN, HOME, PLANS } from '../../../../configs/lang';
import { HOME_URL, NEW_PLAN_URL, PLAN_LIST_URL, QUERY_PARAM_USER } from '../../../../constants';
import { getPlanStatusToDisplay, getQueryParams } from '../../../../helpers/utils';
import {
  createConnectedOpenSRPPlansList,
  OpenSRPPlanListViewProps,
} from '../PlanningView/helpers/OpenSRPPlansList';
import { draftPlansPageBodyFactory } from '../PlanningView/helpers/utils';
import './index.css';
import { TableColumns } from './utils';

const ConnectedOpenSRPPlansList = createConnectedOpenSRPPlansList();

/** list plans */
export const PlanDefinitionList = (props: RouteComponentProps) => {
  const pageTitle = PLANS;
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: pageTitle,
      url: PLAN_LIST_URL,
    },
    pages: [homePage],
  };

  const planStatuses = getPlanStatusToDisplay(HIDDEN_PLAN_STATUSES);
  const allQueryParams = getQueryParams(props.location);
  const userParam = allQueryParams[QUERY_PARAM_USER] as string;

  const renderBody = draftPlansPageBodyFactory({
    addPlanBtnText: ADD_PLAN,
    breadCrumbProps,
    newPlanUrl: NEW_PLAN_URL,
    pageTitle,
    userParam,
  });

  const opensrpListProps: Partial<OpenSRPPlanListViewProps> & RouteComponentProps = {
    ...props,
    planStatuses,
    renderBody,
    tableColumns: TableColumns,
    userNameFilter: true,
  };

  return <ConnectedOpenSRPPlansList {...opensrpListProps} />;
};
