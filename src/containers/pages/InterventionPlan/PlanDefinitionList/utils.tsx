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
import { PlanDefinition, planStatusDisplay, UseContext } from '../../../../configs/settings';
import { PLAN_UPDATE_URL } from '../../../../constants';

export const TableColumns: Array<DrillDownColumn<PlanDefinition>> = [
  {
    Cell: (cell: Cell<PlanDefinition>) => {
      const original = cell.row.original;
      return (
        <Link to={`${PLAN_UPDATE_URL}/${original.identifier}`} key={original.identifier}>
          {cell.value}
        </Link>
      );
    },
    Header: TITLE,
    accessor: 'title',
    minWidth: 200,
  },
  {
    Cell: ({ value }: Cell<PlanDefinition>) => {
      const typeUseContext = value.filter((e: any) => e.code === 'interventionType');
      return typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : null;
    },
    Header: INTERVENTION_TYPE_LABEL,
    accessor: 'useContext',
    maxWidth: 40,
    minWidth: 10,
    sortType: (rowA: Row<PlanDefinition>, rowB: Row<PlanDefinition>, columnId: string) => {
      /** custom sort function based useContext */
      const getIntervention = (row: Row<PlanDefinition>) => {
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
    Cell: (cell: Cell<PlanDefinition>) => {
      return planStatusDisplay[cell.value] || null;
    },
    Header: STATUS_HEADER,
    accessor: 'status',
    maxWidth: 30,
    minWidth: 10,
  },
  {
    Header: LAST_MODIFIED,
    accessor: 'date',
    maxWidth: 30,
    minWidth: 20,
  },
];
