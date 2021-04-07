import { DrillDownColumn } from '@onaio/drill-down-table/dist/types';
import { Dictionary } from '@onaio/utils';
import { censusPopColumns, genderReportColumns } from '../../GenericJurisdictionReport/helpers';

/** wards columns */
export const wardColumns: Array<DrillDownColumn<Dictionary>> = [
  {
    Header: 'Name',
    accessor: 'ward_name',
  },
  ...genderReportColumns,
  ...censusPopColumns,
];
