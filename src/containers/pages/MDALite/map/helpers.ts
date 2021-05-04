import { TASK_GREEN, TASK_ORANGE, TASK_YELLOW } from '../../../../colors';
import { PEOPLE, TABLET } from '../../../../configs/lang';
import { IndicatorThresholdItemPercentage } from '../../../../helpers/utils';

/** The default indicator stop */
export const defaultIndicatorStop = [
  ['Complete', TASK_GREEN],
  ['In Progress', TASK_ORANGE],
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
  unit?: string;
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
      unit: PEOPLE,
    },
    {
      accessor: 'other_pop_coverage',
      denominator: 'other_pop_target',
      description: '',
      numerator: 'total_all_genders',
      title: 'Other Pop Coverage (Unofficial)',
      unit: PEOPLE,
    },
    {
      accessor: 'total_all_genders',
      listDisplay: true,
      title: 'Total Treated',
      unit: PEOPLE,
    },
    {
      accessor: 'adminstered',
      listDisplay: true,
      title: 'Drugs Administered',
      unit: TABLET,
    },
    {
      accessor: 'damaged',
      listDisplay: true,
      title: 'Drugs Damaged',
      unit: TABLET,
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
