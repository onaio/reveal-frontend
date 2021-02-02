import { Dictionary } from '@onaio/utils';
import { TASK_GREEN, TASK_RED, TASK_YELLOW } from '../../../../colors';

/** The default indicator stop */
export const defaultIndicatorStop = [
  ['Sprayed', TASK_GREEN],
  ['Not Sprayed', TASK_RED],
  ['Not Visited', TASK_YELLOW],
];

/** IRS Lite Indicator stops
 * These are all the indicator stops for IRS Lite that we know about.
 */
export const IRSLiteIndicatorStops: { [key: string]: string[][] } = {
  zambia2020: defaultIndicatorStop,
};

/** interface to describe and indicator row item */
export interface IndicatorRowItem {
  denominator: string | number;
  description: string;
  listDisplay?: Dictionary | string;
  numerator: string | number;
  title: string;
  unit?: string;
  value: string | number;
}

/** the indicator row type */
export type IndicatorRows = IndicatorRowItem[];

/** IRS Indicator rows
 * These are all the indicator rows for IRS that we know about.
 */
export const IRSIndicatorRows: { [key: string]: IndicatorRows } = {
  zambia2020: [
    {
      denominator: 'totstruct',
      description: 'Percent of Total Structures Sprayed',
      numerator: 'sprayed',
      title: 'Spray Coverage (Effectiveness)',
      value: 'spraycov',
    },
    {
      denominator: 'targstruct',
      description: 'Percent of Targeted Structures Sprayed',
      numerator: 'sprayed',
      title: 'Targeted Spray Coverage (Effectiveness)',
      value: 'spraycovtarg',
    },
    {
      denominator: 'targstruct',
      description: 'Percent of found structures over targeted',
      numerator: 'found',
      title: 'Found Coverage',
      value: 'spraycovtarg',
    },
    {
      denominator: 'found',
      description: 'Percent of structures sprayed over found',
      numerator: 'sprayed',
      title: 'Spray Success Rate (PMI SC)',
      value: 'spraysuccess',
    },
  ],
};
