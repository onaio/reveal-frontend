import { DrillDownColumn } from '@onaio/drill-down-table';
import { Dictionary } from '@onaio/utils';
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
