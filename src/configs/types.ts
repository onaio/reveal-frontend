import {
  adminLayerColors,
  GREEN_THRESHOLD,
  JurisdictionLevels,
  ORANGE_THRESHOLD,
  YELLOW_THRESHOLD,
} from './settings';

// threshold types
export type GREEN_THRESHOLD = typeof GREEN_THRESHOLD;
export type YELLOW_THRESHOLD = typeof YELLOW_THRESHOLD;
export type ORANGE_THRESHOLD = typeof ORANGE_THRESHOLD;

// admin layer color type
export type adminLayerColorsType = typeof adminLayerColors[number];

// jurisdiction types
export type JurisdictionTypes = typeof JurisdictionLevels[number];

/** ISO 3166-alpha-2 admin codes */
export type ADMN0_PCODE =
  | 'TH'
  | 'ZM'
  | 'ra Zambia'
  | 'NA'
  | 'BW'
  | 'Chadiza'
  | 'Sinda'
  | 'Katete'
  | 'Siavonga'
  | 'Lop Buri'
  | 'Oddar Meanchey Province'
  | 'Lusaka';

// tslint:disable-next-line:no-empty-interface
export interface EmptyObject {}
