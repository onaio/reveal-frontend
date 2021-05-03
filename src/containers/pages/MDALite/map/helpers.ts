import { TASK_GREEN, TASK_ORANGE, TASK_YELLOW } from '../../../../colors';
import { IndicatorThresholdItemPercentage } from '../../../../helpers/utils';

/** The default indicator stop */
export const defaultIndicatorStop = [
  ['Completed', TASK_GREEN],
  ['Visited but not completed', TASK_ORANGE],
  ['Not Visited', TASK_YELLOW],
];

/** IRS Lite Indicator stops
 * These are all the indicator stops for IRS Lite that we know about.
 */
export const MDALiteIndicatorStops: { [key: string]: string[][] } = {
  kenya2021: defaultIndicatorStop,
};

/** interface to describe and indicator row item */
export interface MDAIndicatorRowItem {
  accessor: string;
  denominator?: string | number;
  description?: string;
  listDisplay?: boolean;
  numerator?: string | number;
  percentage?: string;
  title: string;
  value?: any;
}

/** the indicator row type */
export type IndicatorRows = MDAIndicatorRowItem[];

/** IRS Indicator rows
 * These are all the indicator rows for IRS that we know about.
 */
export const MDAIndicatorRows: { [key: string]: IndicatorRows } = {
  kenya2021: [
    {
      accessor: 'treatment_coverage',
      denominator: 'official_population',
      description: '',
      numerator: 'total_all_genders',
      title: 'Treatment Coverage (Census)',
    },
    {
      accessor: 'other_pop_coverage',
      denominator: 'other_pop_target',
      description: '',
      numerator: 'total_all_genders',
      title: 'Other Pop Coverage (Unofficial)',
    },
    {
      accessor: 'total_all_genders',
      listDisplay: true,
      title: 'Total Treated',
    },
    {
      accessor: 'adminstered',
      listDisplay: true,
      title: 'Drugs Administered',
    },
    {
      accessor: 'damaged',
      listDisplay: true,
      title: 'Drugs Damaged',
    },
  ],
};

export const getMDAIndicatorRows = (indicatorRows: any, subcountyData: any) => {
  const rowOfInterest = [...indicatorRows];
  const data = subcountyData[0] || {};
  indicatorRows.forEach((item: any, idx: number) => {
    const rowValue = data[item.accessor] || 0;
    let percentage = '0%';
    if (!indicatorRows.listDisplay) {
      percentage = IndicatorThresholdItemPercentage(data[item.accessor] || 0) || '0%';
    }
    rowOfInterest[idx] = {
      ...item,
      denominator: data[item.denominator] || '0',
      numerator: data[item.numerator] || '0',
      percentage: percentage.replace('%', ''),
      value: rowValue,
    };
  });
  return rowOfInterest;
};
