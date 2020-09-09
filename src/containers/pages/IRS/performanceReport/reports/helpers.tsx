import { DrillDownColumn, DropDownCellProps } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { RouteParams } from '../../../../../helpers/utils';

const daysWorkedColumn = [
  {
    Header: 'Number Days Worked',
    accessor: 'days_worked',
  },
];

const foundColumn = [
  {
    Header: 'Found',
    accessor: 'found',
  },
];

const sprayedColumn = [
  {
    Header: 'Sprayed',
    accessor: 'sprayed',
  },
];

const averageStructuresColumn = [
  {
    Header: 'Average Structure Per Day',
    accessor: 'avg_sprayed',
  },
];

const averageTimeColumns = [
  {
    Header: 'Average start time',
    accessor: 'start_time',
  },
  {
    Header: 'Average end date',
    accessor: 'end_time',
  },
  {
    Header: 'Duration in field',
    accessor: 'field_duration',
  },
];

const districtColumns = [
  {
    Header: 'District',
    accessor: 'district_name',
    minWidth: 360,
  },
  {
    Header: 'Number of Days Teams in Field',
    accessor: 'days_worked',
  },
  ...averageStructuresColumn,
  ...averageTimeColumns,
];

const dataCollectorsColumns = [
  {
    Header: 'Data Collector',
    accessor: 'data_collector',
    minWidth: 360,
  },
  ...daysWorkedColumn,
  ...averageStructuresColumn,
  ...averageTimeColumns,
];

const sopColumns = [
  {
    Header: 'Spary Operator',
    accessor: 'sop',
    minWidth: 360,
  },
  ...daysWorkedColumn,
  ...foundColumn,
  ...sprayedColumn,
  {
    Header: 'Not Sprayed',
    accessor: 'not_sprayed',
  },
  ...averageStructuresColumn,
  ...averageTimeColumns,
];

const sopByDateColumns = [
  {
    Header: 'Date',
    accessor: 'event_date',
  },
  ...foundColumn,
  ...sprayedColumn,
  {
    Header: 'Refused',
    accessor: 'refused',
  },
  {
    Header: 'Other',
    accessor: 'other_reason',
  },
  {
    Header: 'Total',
    accessor: 'not_sprayed',
  },
  ...averageTimeColumns,
];

/** export all IRS performance table columns */
export const IRSPerfomanceColumns = {
  dataCollectorsColumns,
  districtColumns,
  sopByDateColumns,
  sopColumns,
};

/**
 * gets the columns to be used
 * @param {RouteParams} params
 */
export const getColumnsToUse = (params: RouteParams): Array<DrillDownColumn<Dictionary<{}>>> => {
  const { jurisdictionId, dataCollector, sop } = params;
  if (sop) {
    return IRSPerfomanceColumns.sopByDateColumns;
  }
  if (dataCollector) {
    return IRSPerfomanceColumns.sopColumns;
  }
  if (jurisdictionId) {
    return IRSPerfomanceColumns.dataCollectorsColumns;
  }
  return IRSPerfomanceColumns.districtColumns;
};

/** Interface for linked cell props */
export interface LinkedCellProps extends DropDownCellProps {
  keyToUse?: string;
  linkerField?: string;
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next hierarchical level.
 */
export const IRSPerformanceTableCell: React.ElementType<LinkedCellProps> = (
  props: LinkedCellProps
) => {
  const { cell, cellValue, urlPath, keyToUse, linkerField } = props;
  const original: Dictionary = cell.row.original;
  const linkerFieldValue = linkerField ? original[linkerField] : cellValue;
  const url = urlPath && keyToUse ? `${urlPath}/${original[keyToUse]}` : '';
  return keyToUse && url ? (
    <Link to={url}>{linkerFieldValue}</Link>
  ) : (
    <span>{linkerFieldValue}</span>
  );
};
