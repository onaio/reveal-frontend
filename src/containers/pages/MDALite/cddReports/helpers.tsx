import React from 'react';
import { Cell } from 'react-table';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import { indicatorThresholdsMDALite } from '../../../../configs/settings';
import { QUERY_PARAM_TITLE } from '../../../../constants';
import { getIRSThresholdAdherenceIndicator } from '../../../../helpers/indicators';
import {
  drugDistributionColumns,
  genderReportColumns,
} from '../../GenericJurisdictionReport/helpers';

/** supervisor columns */
export const supervisorColumns = [
  {
    Header: 'Name',
    accessor: 'supervisor_name',
  },
  ...drugDistributionColumns,
];

/** CDD columns */
export const cddReportColumns = [
  {
    Header: 'Name',
    accessor: 'cdd_name',
  },
  ...genderReportColumns,
  {
    Header: 'Name',
    accessor: 'days_worked',
  },
  {
    Cell: (cell: Cell) => getIRSThresholdAdherenceIndicator(cell, indicatorThresholdsMDALite),
    Header: 'Name',
    accessor: 'avarage_per_day',
  },
  ...drugDistributionColumns,
];

type ColumnsType = typeof supervisorColumns | typeof cddReportColumns;
/**
 * gets MDA_lite cdd and supervisor drill down table props
 * @param {ColumnsType} columns - table columns
 * @param {any} data - table data
 */
export const getCddTableProps = (columns: ColumnsType, data: any) => {
  return {
    columns,
    data: data || [],
    identifierField: 'id',
    paginate: false,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      queryParam: QUERY_PARAM_TITLE,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
    resize: true,
    useDrillDown: false,
  };
};
