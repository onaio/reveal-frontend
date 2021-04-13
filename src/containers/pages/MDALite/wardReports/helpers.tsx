import { DrillDownColumn } from '@onaio/drill-down-table/dist/types';
import { Dictionary } from '@onaio/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import { NAME } from '../../../../configs/lang';
import { REPORT_MDA_LITE_CDD_REPORT_URL } from '../../../../constants';
import { censusPopColumns, genderReportColumns } from '../../GenericJurisdictionReport/helpers';

/** wards columns */
export const wardColumns: Array<DrillDownColumn<Dictionary>> = [
  {
    Cell: (cell: Cell) => {
      const original: Dictionary = cell.row.original;
      const url = `${REPORT_MDA_LITE_CDD_REPORT_URL}/${original.plan_id}/${original.base_entity_id}`;
      return <Link to={url}>{cell.value}</Link>;
    },
    Header: NAME,
    accessor: 'ward_name',
  },
  ...genderReportColumns,
  ...censusPopColumns,
];
