import { DrillDownColumn } from '@onaio/drill-down-table/dist/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import { DATE_CREATED, NAME, STATUS_HEADER } from '../../../../configs/lang';
import { planStatusDisplay } from '../../../../configs/settings';
import { DRAFT_IRS_PLAN_URL } from '../../../../constants';
import { PlanRecord } from '../../../../store/ducks/plans';

/** Columns definition for IRS drafts page table */
export const columns: Array<DrillDownColumn<PlanRecord>> = [
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
