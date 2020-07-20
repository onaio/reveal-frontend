import { DrillDownColumn } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils/dist/types/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell, Row } from 'react-table';
import {
  INTERVENTION_TYPE_LABEL,
  LAST_MODIFIED,
  STATUS_HEADER,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay, UseContext } from '../../../../configs/settings';
import { PLAN_UPDATE_URL } from '../../../../constants';
import { PlanRecord } from '../../../../store/ducks/plans';

export const TableColumns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Cell: (cell: Cell<PlanRecord>) => {
      const original = cell.row.original;
      return (
        <Link to={`${PLAN_UPDATE_URL}/${original.id}`} key={original.id}>
          {cell.value}
        </Link>
      );
    },
    Header: TITLE,
    accessor: 'plan_title',
    minWidth: 200,
  },
  {
    Cell: ({ value }: Cell<PlanRecord>) => {
      const typeUseContext = value.filter((e: any) => e.code === 'interventionType');
      return typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : null;
    },
    Header: INTERVENTION_TYPE_LABEL,
    accessor: 'plan_useContext',
    maxWidth: 40,
    minWidth: 10,
    sortType: (rowA: Row<PlanRecord>, rowB: Row<PlanRecord>, columnId: string) => {
      /** custom sort function based useContext */
      const getIntervention = (row: Row<PlanRecord>) => {
        const interventionPlanContext = (row.original as Dictionary)[columnId].filter(
          (context: UseContext) => context.code === 'interventionType'
        );
        return interventionPlanContext.length > 0
          ? interventionPlanContext[0].valueCodableConcept
          : '';
      };
      return getIntervention(rowA) > getIntervention(rowB) ? 1 : -1;
    },
  },
  {
    Cell: (cell: Cell<PlanRecord>) => {
      return planStatusDisplay[cell.value] || null;
    },
    Header: STATUS_HEADER,
    accessor: 'plan_status',
    maxWidth: 30,
    minWidth: 10,
  },
  {
    Header: LAST_MODIFIED,
    accessor: 'plan_date',
    maxWidth: 30,
    minWidth: 20,
  },
];
