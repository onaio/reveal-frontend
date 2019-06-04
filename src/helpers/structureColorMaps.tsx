/** Color enumerations for Tasks business status
 * and action codes
 */
import { BLACK, GREEN, RED, YELLOW } from '../colors';

export interface ColorMapsTypes {
  [key: string]: string | string[];
}

/** the common color codes */
const defaultColorMaps: ColorMapsTypes = {};
defaultColorMaps[BLACK] = 'Not Eligible';
defaultColorMaps[GREEN] = 'Complete';
defaultColorMaps[RED] = ['Incomplete', 'In Progress'];
defaultColorMaps[YELLOW] = 'Not Visited';

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
IRS[BLACK] = 'Not Sprayable';
IRS[RED] = ['Not Sprayed', 'Refused'];

/** color code for Bednet Distribution action code */
const BEDNET_DISTRIBUTION: ColorMapsTypes = {
  ...defaultColorMaps,
};

/** color codes for Blood Screening action code */
const BLOOD_SCREENING = {
  ...defaultColorMaps,
};
BLOOD_SCREENING[RED] = 'Refused';

export default {
  BEDNET_DISTRIBUTION,
  BLOOD_SCREENING,
  CASE_CONFIRMATION,
  IRS,
  LARVAL_DIPPING,
  MOSQUITO_COLLECTION,
  RACD_REGISTER_FAMILY,
};
