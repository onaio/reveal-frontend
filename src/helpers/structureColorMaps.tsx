/** Color enumerations for Tasks business status
 * and action codes
 */
import {
  BLACK,
  TASK_BLUE as BLUE,
  TASK_GREEN as GREEN,
  TASK_PINK as PINK,
  TASK_PURPLE as PURPLE,
  TASK_RED as RED,
  YELLOW,
} from '../colors';

/** Interface for color maps for all task action_codes */
export interface ColorMapsTypes {
  [key: string]: string[];
}

/** the common color codes */
const defaultColorMaps: ColorMapsTypes = {};
defaultColorMaps[BLACK] = ['Not Eligible'];
defaultColorMaps[GREEN] = ['Complete'];
defaultColorMaps[RED] = ['Incomplete', 'In Progress'];
defaultColorMaps[YELLOW] = ['Not Visited'];

/** color codes for the case confirmation action code */
const CASE_CONFIRMATION: ColorMapsTypes = {
  ...defaultColorMaps,
};
CASE_CONFIRMATION[RED] = ['Incomplete', 'Refused'];

/** color codes for the RACD Register Family action code */
const RACD_REGISTER_FAMILY: ColorMapsTypes = {
  ...defaultColorMaps,
};
RACD_REGISTER_FAMILY[RED] = ['Incomplete', 'Refused'];
RACD_REGISTER_FAMILY[PINK] = ['Complete'];
delete RACD_REGISTER_FAMILY[GREEN] /** Remove the default color for Complete */;

/** color codes for Mosquito Collection action code */
const MOSQUITO_COLLECTION: ColorMapsTypes = {
  ...defaultColorMaps,
};

/** color codes for Larval Dipping action code */
const LARVAL_DIPPING: ColorMapsTypes = {
  ...defaultColorMaps,
};

/** color codes for IRS action code */
const IRS: ColorMapsTypes = {
  ...defaultColorMaps,
};
IRS[GREEN] = ['Sprayed'];
IRS[BLACK] = ['Not Sprayable'];
IRS[RED] = ['Not Sprayed', 'Refused'];

/** color code for Bednet Distribution action code */
const BEDNET_DISTRIBUTION: ColorMapsTypes = {
  ...defaultColorMaps,
};
BEDNET_DISTRIBUTION[RED] = ['Incomplete', 'Refused'];
BEDNET_DISTRIBUTION[BLUE] = ['Complete'];
delete BEDNET_DISTRIBUTION[GREEN] /** Remove the default color for Complete */;

/** color codes for Blood Screening action code */
const BLOOD_SCREENING: ColorMapsTypes = {
  ...defaultColorMaps,
};
BLOOD_SCREENING[RED] = ['Incomplete', 'Refused'];
BLOOD_SCREENING[PURPLE] = ['Complete'];
delete BLOOD_SCREENING[GREEN] /** Remove the default color for Complete */;

export const colorMaps = {
  BEDNET_DISTRIBUTION,
  BLOOD_SCREENING,
  CASE_CONFIRMATION,
  IRS,
  LARVAL_DIPPING,
  MOSQUITO_COLLECTION,
  RACD_REGISTER_FAMILY,
};
