import { DrillDownColumn } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils/dist/types/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell, Row } from 'react-table';
import { PLAN_LIST_SHOW_FI_REASON_COLUMN } from '../../../../configs/env';
import {
  FOCUS_INVESTIGATION_STATUS_REASON,
  INTERVENTION_TYPE_LABEL,
  LAST_MODIFIED,
  REACTIVE,
  ROUTINE_TITLE,
  STATUS_HEADER,
  TITLE,
} from '../../../../configs/lang';
import { planStatusDisplay, UseContext } from '../../../../configs/settings';
import {
  CASE_TRIGGERED,
  FI_REASON_CODE,
  INTERVENTION_TYPE_CODE,
  PLAN_UPDATE_URL,
  ROUTINE,
} from '../../../../constants';
import { PlanRecord } from '../../../../store/ducks/plans';

/**
 * sort plan UseContext values
 * @param {Row<PlanRecord>} rowA - table props
 * @param {Row<PlanRecord>} rowB - table props
 * @param {string} code - Plan use context code
 */
const sortUseContext = (rowA: Row<PlanRecord>, rowB: Row<PlanRecord>, code: string) => {
  /** custom sort function based useContext */
  const getIntervention = (row: Row<PlanRecord>) => {
    const interventionPlanContext = (row.original as Dictionary).plan_useContext.filter(
      (context: UseContext) => context.code === code
    );
    return interventionPlanContext.length > 0 ? interventionPlanContext[0].valueCodableConcept : '';
  };
  return getIntervention(rowA) > getIntervention(rowB) ? 1 : -1;
};

/**
 *
 * @param {UseContext[]} value - List of plan use contexts
 * @param {string} code - Plan use context code
 */
const getUseContext = (value: UseContext[], code: string) => {
  const typeUseContext = value.filter((e: any) => e.code === code);
  if (typeUseContext[0]?.valueCodableConcept === CASE_TRIGGERED) {
    return REACTIVE;
  }
  if (typeUseContext[0]?.valueCodableConcept === ROUTINE) {
    return ROUTINE_TITLE;
  }
  return typeUseContext.length > 0 ? typeUseContext[0].valueCodableConcept : null;
};

// plan intervention type column
const interventionTypeColumn = {
  Cell: ({ value }: Cell<PlanRecord>) => getUseContext(value, INTERVENTION_TYPE_CODE),
  Header: INTERVENTION_TYPE_LABEL,
  accessor: 'plan_useContext',
  id: 'plan_use_context_intervention_type',
  maxWidth: 40,
  minWidth: 10,
  sortType: (rowA: Row<PlanRecord>, rowB: Row<PlanRecord>) =>
    sortUseContext(rowA, rowB, INTERVENTION_TYPE_CODE),
} as DrillDownColumn<PlanRecord>;

// plan FI reason column
const fiReasonColumns = {
  Cell: ({ value }: Cell<PlanRecord>) => getUseContext(value, FI_REASON_CODE),
  Header: FOCUS_INVESTIGATION_STATUS_REASON,
  accessor: 'plan_useContext',
  id: 'plan_use_context_fi_reason',
  maxWidth: 40,
  minWidth: 10,
  sortType: (rowA: Row<PlanRecord>, rowB: Row<PlanRecord>) =>
    sortUseContext(rowA, rowB, FI_REASON_CODE),
} as DrillDownColumn<PlanRecord>;

const interventionOrFiReasonColumn = PLAN_LIST_SHOW_FI_REASON_COLUMN
  ? fiReasonColumns
  : interventionTypeColumn;

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
  interventionOrFiReasonColumn,
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
