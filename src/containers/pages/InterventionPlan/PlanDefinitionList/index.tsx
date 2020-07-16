import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { BreadCrumbProps } from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { ADD_PLAN, HOME, PLANS } from '../../../../configs/lang';
import { HOME_URL, NEW_PLAN_URL, PLAN_LIST_URL } from '../../../../constants';
import plansByUserReducer, {
  reducerName as plansByUserReducerName,
} from '../../../../store/ducks/opensrp/planIdsByUser';
import {
  createConnectedOpenSRPPlansList,
  OpenSRPPlanListViewProps,
} from '../PlanningView/helpers/OpenSRPPlansList';
import { draftPlansPageBodyFactory } from '../PlanningView/helpers/utils';
import './index.css';
import { TableColumns } from './utils';

/** register the plan definitions reducer */
reducerRegistry.register(plansByUserReducerName, plansByUserReducer);

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

  const renderBody = draftPlansPageBodyFactory({
    addPlanBtnText: ADD_PLAN,
    breadCrumbProps,
    newPlanUrl: NEW_PLAN_URL,
    pageTitle,
  });

  const opensrpListProps: Partial<OpenSRPPlanListViewProps> & RouteComponentProps = {
    ...props,
    renderBody,
    tableColumns: TableColumns,
    userNameFilter: true,
  };

  return <ConnectedOpenSRPPlansList {...opensrpListProps} />;
};
