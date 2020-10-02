import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DrillDownColumn, DropDownCellProps } from '@onaio/drill-down-table';
import superset, {
  SupersetAdhocFilterOption,
  SupersetSQLFilterOption,
} from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import { SUPERSET_MAX_RECORDS } from '../../../../../configs/env';
import { RouteParams } from '../../../../../helpers/utils';

/** number of days worked  column */
const daysWorkedColumn = {
  Header: 'Number Days Worked',
  accessor: 'days_worked',
};

/** structures found column */
const foundColumn = {
  Header: 'Found',
  accessor: 'found',
  maxWidth: 105,
};

/** structures sprayed column */
const sprayedColumn = {
  Header: 'Sprayed',
  accessor: 'sprayed',
  maxWidth: 105,
};

/** avarage structured sprayed columns */
const averageStructuresColumn = {
  Cell: (cell: Cell) => <div>{Math.round(cell.value)}</div>,
  Header: 'Average Structure Per Day',
  accessor: 'avg_sprayed',
  maxWidth: 105,
};

/** start time, end time and time time duration in the field */
const averageTimeColumns = [
  {
    Header: 'Average Start Time',
    accessor: 'start_time',
  },
  {
    Header: 'Average End Time',
    accessor: 'end_time',
  },
  {
    Header: 'Average Duration in the Field per Day',
    accessor: 'field_duration',
  },
];

/** data quality check columns */
const dataQualityCheck = {
  Cell: (cell: Cell<Dictionary>) => {
    return cell.value ? (
      <FontAwesomeIcon className="check-icon" icon="check" />
    ) : (
      <FontAwesomeIcon className="times-icon" icon="times" />
    );
  },
  Header: 'Data Quality Check',
  accessor: 'data_quality_check',
  maxWidth: 105,
  sortable: false,
};

/** insectside usage rate column */
const insectSideUsageRate = {
  Cell: (cell: Cell) => <div>{(cell.value || 0).toFixed(2)}</div>,
  Header: 'Insectcide Usage Rate*',
  accessor: 'usage_rate',
};

/** District tables columns */
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
  averageStructuresColumn,
  ...averageTimeColumns,
  insectSideUsageRate,
  dataQualityCheck,
];

/** data colecctors table columns */
const dataCollectorsColumns = [
  {
    Header: 'Data Collector',
    accessor: 'data_collector',
    minWidth: 360,
  },
  daysWorkedColumn,
  averageStructuresColumn,
  ...averageTimeColumns,
  insectSideUsageRate,
  dataQualityCheck,
];

/** sprayer operator columns */
const sopColumns = [
  {
    Header: 'Spray Operator',
    accessor: 'sop',
  },
  daysWorkedColumn,
  {
    Header: 'Number of Structures(Latest submission)',
    columns: [
      foundColumn,
      sprayedColumn,
      {
        Header: 'Not Sprayed',
        accessor: 'not_sprayed',
        maxWidth: 105,
      },
    ],
    maxWidth: 345,
  },
  averageStructuresColumn,
  ...averageTimeColumns,
  insectSideUsageRate,
  dataQualityCheck,
  {
    Header: 'Found Difference (Latest Submission)',
    accessor: 'found_diff',
  },
  {
    Header: 'Sprayed Difference (Latest Submission)',
    accessor: 'sprayed_diff',
  },
];

/** sprayer operator dates columns */
const sopByDateColumns = [
  {
    Cell: (cell: Cell) => <span>{cell.row.index + 1}</span>,
    Header: 'Day',
    accessor: 'index',
    id: 'day',
    maxWidth: 80,
  },
  {
    Header: 'Date',
    accessor: 'event_date',
  },
  {
    Header: 'Number of Structures',
    columns: [
      foundColumn,
      sprayedColumn,
      {
        Header: 'Not Sprayed',
        columns: [
          {
            Header: 'Refused',
            accessor: 'refused',
            maxWidth: 105,
          },
          {
            Header: 'Other',
            accessor: 'other_reason',
            maxWidth: 80,
          },
          {
            Header: 'Total',
            accessor: 'not_sprayed',
            maxWidth: 80,
          },
        ],
      },
    ],
  },
  ...averageTimeColumns,
  {
    Header: 'Bottles/Sachets Used',
    accessor: 'bottles_empty',
  },
  dataQualityCheck,
  {
    Header: 'Found Difference',
    accessor: 'found_diff',
  },
  {
    Header: 'Sprayed Difference',
    accessor: 'sprayed_diff',
  },
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
  urlParamField?: string;
  urlPath?: string;
}

/** Component that will be rendered in drop-down table cells showing a link
 * that moves you to the next performance report level.
 */
export const IRSPerformanceTableCell: React.ElementType<LinkedCellProps> = (
  props: LinkedCellProps
) => {
  const { cell, cellValue, urlPath, urlParamField } = props;
  const original: Dictionary = cell.row.original;
  const url = urlPath && urlParamField ? `${urlPath}/${original[urlParamField]}` : '';
  return urlParamField && url ? <Link to={url}>{cellValue}</Link> : <span>{cellValue}</span>;
};

/** defines fields with the router param data */
export enum RouterParamFields {
  dataCollector = 'data_collector',
  jurisdictionId = 'district_id',
  planId = 'plan_id',
  sop = 'sop',
}

/**
 * Generates superset filters
 * @param {RouteParams} params
 * @param {string} currentParam last filter
 */
export const supersetFilters = (params: RouteParams, currentParam: string) => {
  const filters: Array<SupersetSQLFilterOption | SupersetAdhocFilterOption> = [];
  const entries = Object.entries(params);
  for (const [key, value] of entries) {
    if (key && value) {
      filters.push({
        comparator: value,
        operator: '==',
        subject: (RouterParamFields as any)[key],
      });
    }
    if (value === currentParam) {
      break;
    }
  }
  return superset.getFormData(SUPERSET_MAX_RECORDS, filters);
};

/** defines table cell linker field */
export enum LinkerFields {
  dataCollector = 'data_collector',
  districtName = 'district_name',
  eventDate = 'event_date',
  sop = 'sop',
}
