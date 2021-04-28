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
  zambia2020: defaultIndicatorStop,
};

/** interface to describe and indicator row item */
export interface MDAIndicatorRowItem {
  accessor: string;
  denominator?: string | number;
  description?: string;
  hideBar?: boolean;
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
  zambia2020: [
    {
      accessor: 'treatment_coverage',
      denominator: 'totstruct',
      description: '',
      numerator: 'sprayed',
      title: 'Treatment Coverage (Census)',
    },
    {
      accessor: 'other_pop_coverage',
      denominator: 'targstruct',
      description: '',
      numerator: 'sprayed',
      title: 'Other Pop Coverage (Unofficial)',
    },
    {
      accessor: 'total_all_genders',
      hideBar: true,
      title: 'Total Treated',
    },
    {
      accessor: 'adminstered',
      hideBar: true,
      title: 'Drugs Administered',
    },
    {
      accessor: 'damaged',
      hideBar: true,
      title: 'Drugs Damaged',
    },
  ],
};

export const getMDAIndicatorRows = (indicatorRows: any, subcountyData: any) => {
  const rowOfInterest = [...indicatorRows];
  indicatorRows.forEach((item: any, idx: number) => {
    const rowValue = subcountyData.length ? subcountyData[0][item.accessor] : 0;
    let percentage = '0%';
    if (!indicatorRows.hideBar) {
      percentage =
        IndicatorThresholdItemPercentage(
          subcountyData.length ? subcountyData[0][item.accessor] : 0
        ) || '0%';
    }
    rowOfInterest[idx] = {
      ...item,
      percentage: percentage.replace('%', ''),
      value: rowValue,
    };
  });
  return rowOfInterest;
};
