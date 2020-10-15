import { DrillDownColumn } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils/';
import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Cell } from 'react-table';
import { BreadCrumbProps } from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED } from '../../../../configs/env';
import {
  ASSIGN_PLANS,
  END_DATE,
  HOME,
  INTERVENTION,
  PLAN_STATUS,
  START_DATE,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import { ASSIGN_PLAN_URL, HOME_URL } from '../../../../constants';
import { InterventionType, PlanRecord, PlanStatus } from '../../../../store/ducks/plans';
import {
  createConnectedOpenSRPPlansList,
  OpenSRPPlanListViewProps,
} from '../../InterventionPlan/PlanningView/helpers/OpenSRPPlansList';
import { draftPlansPageBodyFactory } from '../../InterventionPlan/PlanningView/helpers/utils';

/** assign plans table columns */
export const tableColumns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Cell: (cell: Cell<PlanRecord>) => {
      const original = cell.row.original as Dictionary;
      return (
        <Link to={`${ASSIGN_PLAN_URL}/${original.plan_id}`} key={original.plan_id}>
          {cell.value}
        </Link>
      );
    },
    Header: TITLE,
    accessor: 'plan_title',
  },
  {
    Header: INTERVENTION,
    accessor: 'plan_intervention_type',
    maxWidth: 30,
    minWidth: 10,
  },
  {
    Header: START_DATE,
    accessor: 'plan_effective_period_start',
    maxWidth: 30,
    minWidth: 10,
  },
  {
    Header: END_DATE,
    accessor: 'plan_effective_period_end',
    maxWidth: 30,
    minWidth: 10,
  },
  {
    Cell: (cell: Cell<PlanRecord>) => {
      return planStatusDisplay[cell.value] || null;
    },
    Header: PLAN_STATUS,
    accessor: 'plan_status',
    maxWidth: 30,
    minWidth: 10,
  },
];

// container/view that lists assignment plans..
const ConnectedOpenSRPPlansList = createConnectedOpenSRPPlansList();

/** list assignment plans */
export const OpenSRPPlansList = (props: RouteComponentProps) => {
  const pageTitle = ASSIGN_PLANS;
  const homePage = {
    label: HOME,
    url: HOME_URL,
  };
  const breadCrumbProps: BreadCrumbProps = {
    currentPage: {
      label: pageTitle,
      url: ASSIGN_PLAN_URL,
    },
    pages: [homePage],
  };

  const renderBody = draftPlansPageBodyFactory({
    breadCrumbProps,
    newPlanUrl: '',
    pageTitle,
  });

  const opensrpListProps: Partial<OpenSRPPlanListViewProps> & RouteComponentProps = {
    ...props,
    interventionTypes: ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED as InterventionType[],
    planStatuses: [PlanStatus.ACTIVE],
    renderBody,
    sortByDate: true,
    tableColumns,
  };

  return <ConnectedOpenSRPPlansList {...opensrpListProps} />;
};
