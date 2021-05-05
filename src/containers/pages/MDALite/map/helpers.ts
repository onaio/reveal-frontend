import { Dictionary } from '@onaio/utils';
import { TASK_GREEN, TASK_ORANGE, TASK_YELLOW } from '../../../../colors';
import {
  DRUGS_ADMINISTERED,
  DRUGS_DAMAGED,
  OTHER_POP_COVERAGE,
  PEOPLE,
  TABLET,
  TOTAL_TREATED,
  TREATMENT_COVERAGE_CENSUS,
} from '../../../../configs/lang';
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
      title: TREATMENT_COVERAGE_CENSUS,
      unit: PEOPLE,
    },
    {
      accessor: 'other_pop_coverage',
      denominator: 'other_pop_target',
      description: '',
      numerator: 'total_all_genders',
      title: OTHER_POP_COVERAGE,
      unit: PEOPLE,
    },
    {
      accessor: 'total_all_genders',
      listDisplay: true,
      title: TOTAL_TREATED,
      unit: PEOPLE,
    },
    {
      accessor: 'adminstered',
      listDisplay: true,
      title: DRUGS_ADMINISTERED,
      unit: TABLET,
    },
    {
      accessor: 'damaged',
      listDisplay: true,
      title: DRUGS_DAMAGED,
      unit: TABLET,
    },
  ],
};

export const getMDAIndicatorRows = (indicatorRows: IndicatorRows, subcountyData: Dictionary[]) => {
  const rowOfInterest = [...indicatorRows];
  const data = subcountyData[0] || {};
  indicatorRows.forEach((item: MDAIndicatorRowItem, idx: number) => {
    const rowValue = data[item.accessor] || 0;
    let percentage = '0%';
    if (!item.listDisplay) {
      percentage = IndicatorThresholdItemPercentage(data[item.accessor] || 0) || '0%';
    }
    rowOfInterest[idx] = {
      ...item,
      denominator: item.denominator ? data[item.denominator] : '0',
      numerator: item.numerator ? data[item.numerator] : '0',
      percentage: percentage.replace('%', ''),
      value: rowValue,
    };
  });
  return rowOfInterest;
};
