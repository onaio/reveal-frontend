import { Dictionary } from '@onaio/utils';
import {
  BLACK,
  GREY,
  RED,
  TASK_GREEN,
  TASK_ORANGE,
  TASK_RED,
  TASK_YELLOW,
} from '../../../../colors';
// import { GisidaProps } from '../../../../components/GisidaWrapper';

/** The default indicator stop */
export const defaultIndicatorStop = [
  ['Completed', TASK_GREEN],
  ['Not Sprayed', TASK_RED],
  ['Partially Sprayed', TASK_ORANGE],
  ['Not Visited', TASK_YELLOW],
  ['Not Eligible', BLACK],
];

/** SMC Indicator stops
 * These are all the indicator stops for IRS that we know about.
 */
export const SMCIndicatorStops: { [key: string]: string[][] } = {
  nigeria2020: [
    ['Complete', TASK_GREEN],
    ['SPAQ Complete', TASK_ORANGE],
    ['SMC Complete', TASK_ORANGE],
    ['No Tasks', GREY],
    ['Not Visited', TASK_YELLOW],
    ['Not Eligible', GREY],
    ['Ineligible', GREY],
    ['Not Dispensed', RED],
  ],
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
export const SMCIndicatorRows: { [key: string]: IndicatorRows } = {
  nigeria2020: [
    {
      denominator: 'total_structures',
      description: 'Percentage of structures found over total',
      numerator: 'total_found_structures',
      title: 'Visitation Coverage Percentage',
      value: 'found_coverage',
    },
    {
      denominator: 'total_structures',
      description: 'Percent of structures distributed over total',
      numerator: 'total_structures_recieved_spaq',
      title: 'Distribution Coverage Percentage',
      value: 'distribution_coverage_total',
    },
    {
      denominator: 'total_found_structures',
      description: 'Percent of structures distributed over found',
      numerator: 'total_structures_recieved_spaq',
      title: 'Structure Distribution Effectiveness',
      value: 'distribution_coverage',
    },
    {
      denominator: 'eligible_children',
      description: 'Percent of eligible children treated over total eligible',
      numerator: 'treated_children',
      title: 'Individual Distribution Effectiveness',
      // unit: 'children',
      value: 'treatment_coverage',
    },
    {
      denominator: 'treated_children',
      description: 'Percent of treated at HF of referrals by CDD over total',
      // listDisplay: 'notsprayed_reasons_counts',
      numerator: 'referred_children',
      title: 'Percentage',
      // unit: 'children treated',
      value: 'referral_treatment_rate',
    },
  ],
};
