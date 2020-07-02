import { DrillDownColumn } from '@onaio/drill-down-table/dist/types';
import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import Button from 'reactstrap/lib/Button';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { CREATE_NEW_PLAN, DATE_CREATED, NAME, STATUS_HEADER } from '../../../../../configs/lang';
import { planStatusDisplay } from '../../../../../configs/settings';
import { ASSIGN_JURISDICTIONS_URL, DRAFT_IRS_PLAN_URL } from '../../../../../constants';
import { PlanRecord } from '../../../../../store/ducks/plans';
import { RenderProp } from './OpenSRPPlansList';

/** Columns definition for IRS drafts page table */
export const commonColumns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Header: DATE_CREATED,
    accessor: 'plan_date',
    maxWidth: 50,
    minWidth: 20,
  },
  {
    Header: STATUS_HEADER,
    accessor: (d: PlanRecord) => planStatusDisplay[d.plan_status] || d.plan_status,
    id: 'plan_status',
    maxWidth: 50,
    minWidth: 20,
  },
];

export const irsDraftPageColumns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Cell: (cell: Cell<PlanRecord>) => {
      const original = cell.row.original;
      return (
        <div>
          <Link to={`${DRAFT_IRS_PLAN_URL}/${original.id || original.plan_id}`}>{cell.value}</Link>
        </div>
      );
    },
    Header: NAME,
    accessor: 'plan_title',
    minWidth: 200,
  },
  ...commonColumns,
];

export const draftPageColumns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Cell: (cell: Cell<PlanRecord>) => {
      const original = cell.row.original;
      return (
        <div>
          <Link to={`${ASSIGN_JURISDICTIONS_URL}/${original.id || original.plan_id}`}>
            {cell.value}
          </Link>
        </div>
      );
    },
    Header: NAME,
    accessor: 'plan_title',
    minWidth: 200,
  },
  ...commonColumns,
];

/** options for when creating the drafts page plans render prop */
interface Options {
  pageTitle: string;
  breadCrumbProps: BreadCrumbProps;
  newPlanUrl: string;
}
/** creates a render prop that receives a render function for the plans list table and
 * renders the whole view.
 */
export const draftPlansPageBodyFactory = (options: Options) => {
  const { pageTitle, breadCrumbProps, newPlanUrl } = options;
  return (renderConnectedTable: RenderProp) => {
    return (
      <div className="mb-5">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <h2 className="page-title">{pageTitle}</h2>
        <Button className="create-plan float-right" color="primary" tag={Link} to={`${newPlanUrl}`}>
          {CREATE_NEW_PLAN}
        </Button>
        {renderConnectedTable()}
        <br />
      </div>
    );
  };
};
