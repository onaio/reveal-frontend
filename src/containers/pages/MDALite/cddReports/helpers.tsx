import { Cell } from 'react-table';
import { indicatorThresholdsMDALite } from '../../../../configs/settings';
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
