/** Color enumerations for Tasks business status
 * and action codes
 */
import { BLACK, GREEN, RED, YELLOW } from '../colors';

export interface ColorMapsTypes {
  BLACK: string | string[];
  GREEN: string | string[];
  RED: string | string[];
  YELLOW: string | string[];
}

const defaultColorMaps: ColorMapsTypes = {
  BLACK: 'Not Eligible',
  GREEN: 'Complete',
  RED: ['Incomplete', 'In Progress'],
  YELLOW: 'Not Visited',
};

export const CASE_CONFIRMATION: ColorMapsTypes = {
  ...defaultColorMaps,
  RED: ['Incomplete', 'Refused'],
};

export const RACD_REGISTER_FAMILY: ColorMapsTypes = {
  ...defaultColorMaps,
  RED: ['Incomplete', 'Refused'],
};

export const MOSQUITO_COLLECTION: ColorMapsTypes = {
  ...defaultColorMaps,
};

export const LARVAL_DIPPING: ColorMapsTypes = {
  ...defaultColorMaps,
};

export const IRS: ColorMapsTypes = {
  ...defaultColorMaps,
  BLACK: 'Not Sprayable',
  RED: ['Not Sprayed', 'Refused'],
};

export const BEDNET_DISTRIBUTION: ColorMapsTypes = {
  ...defaultColorMaps,
};

export const BLOOD_SCREENING = {
  ...defaultColorMaps,
  RED: ['Refused'],
};
