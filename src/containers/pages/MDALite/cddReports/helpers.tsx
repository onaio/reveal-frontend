import { Dictionary } from '@onaio/utils/dist/types/types';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import { AVERAGE_PER_DAY, DAYS_WORKED, NAME } from '../../../../configs/lang';
import { indicatorThresholdsMDALite } from '../../../../configs/settings';
import { REPORT_MDA_LITE_CDD_REPORT_URL } from '../../../../constants';
import { getIRSThresholdAdherenceIndicator } from '../../../../helpers/indicators';
import {
  drugDistributionColumns,
  genderReportColumns,
} from '../../GenericJurisdictionReport/helpers';

/** supervisor columns */
export const supervisorColumns = [
  {
    Cell: (cell: Cell) => {
      const original: Dictionary = cell.row.original;
      const url = `${REPORT_MDA_LITE_CDD_REPORT_URL}/${original.plan_id}/${original.base_entity_id}/${original.id}`;
      return (
        <Link className="break-text" to={url}>
          {cell.value}
        </Link>
      );
    },
    Header: NAME,
    accessor: 'supervisor_name',
  },
  ...drugDistributionColumns,
];

/** CDD columns */
export const cddReportColumns = [
  {
    Cell: (cell: Cell) => {
      return <div className="break-text">{cell.value}</div>;
    },
    Header: NAME,
    accessor: 'cdd_name',
  },
  ...genderReportColumns,
  {
    Header: DAYS_WORKED,
    accessor: 'days_worked',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALite),
    Header: AVERAGE_PER_DAY,
    accessor: 'avarage_per_day',
  },
  ...drugDistributionColumns,
];

type ColumnsType = typeof supervisorColumns | typeof cddReportColumns;
/**
 * gets MDA_lite cdd and supervisor drill down table props
 * @param {ColumnsType} columns - table columns
 * @param {Dictionary[]} data - table data
 */
export const getCddTableProps = (
  columns: ColumnsType,
  data: Dictionary[],
  props: RouteComponentProps<Dictionary>
) => {
  return {
    columns,
    data: data || [],
    identifierField: 'id',
    paginate: true,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      componentProps: props,
      showColumnHider: false,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
    resize: true,
    useDrillDown: false,
  };
};
