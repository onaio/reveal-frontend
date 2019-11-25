/** This is the main configuration module
 *
 * **** IMPORT RULES ****
 * To avoid circular imports or anything of that nature, the only imports from the Reveal
 * code base allowed in this module are from the following modules:
 *  - constants
 *  - envs
 *  - colors
 *  - types
 *
 * **** CODE RULES ****
 * To keep things simple, the code in this module should be simple statements.  Use of
 * functions is discouraged and should only be done if there is no other way.
 */
import { Providers } from '@onaio/gatekeeper';
import { Color } from 'csstype';
import { Expression, LngLatBoundsLike } from 'mapbox-gl';
import {
  ActionReasonType,
  GoalPriorityType,
  GoalUnit,
  PlanActionCodesType,
  PlanActivities,
  UseContextCodesType,
} from '../containers/forms/PlanForm/types';
import {
  DOMAIN_NAME,
  ENABLE_ONADATA_OAUTH,
  ENABLE_OPENSRP_OAUTH,
  ONADATA_ACCESS_TOKEN_URL,
  ONADATA_AUTHORIZATION_URL,
  ONADATA_CLIENT_ID,
  ONADATA_OAUTH_STATE,
  ONADATA_USER_URL,
  OPENSRP_ACCESS_TOKEN_URL,
  OPENSRP_AUTHORIZATION_URL,
  OPENSRP_CLIENT_ID,
  OPENSRP_OAUTH_STATE,
  OPENSRP_USER_URL,
} from './env';
import { JurisdictionTypes } from './types';

/** Interfaces */

/** Interface for a Focus Investigation Classification */
export interface Classification {
  code: string;
  name: string;
  description: string;
}

/** Interface that describes location items */
export interface LocationItem {
  identifier: string /** Should match the name of the column in data */;
  level: number /** The HDX-compliant level of the location in the hierarchy */;
  name: string /** The name of the location */;
}

/** Authentication Configs */
const providers: Providers = {};

if (ENABLE_OPENSRP_OAUTH) {
  providers.OpenSRP = {
    accessTokenUri: OPENSRP_ACCESS_TOKEN_URL,
    authorizationUri: OPENSRP_AUTHORIZATION_URL,
    clientId: OPENSRP_CLIENT_ID,
    redirectUri: `${DOMAIN_NAME}/oauth/callback/OpenSRP/`,
    scopes: ['read', 'write'],
    state: OPENSRP_OAUTH_STATE,
    userUri: OPENSRP_USER_URL,
  };
}

if (ENABLE_ONADATA_OAUTH) {
  providers.Ona = {
    accessTokenUri: ONADATA_ACCESS_TOKEN_URL,
    authorizationUri: ONADATA_AUTHORIZATION_URL,
    clientId: ONADATA_CLIENT_ID,
    redirectUri: `${DOMAIN_NAME}/oauth/callback/Ona/`,
    scopes: ['read', 'write'],
    state: ONADATA_OAUTH_STATE,
    userUri: ONADATA_USER_URL,
  };
}

export { providers };

/** Location configs */

/** Location item hierarchy
 * This is a list of locations.  The "level" field will be used to sort the
 * locations hierarchically, from lowest to highest.
 */
export const locationHierarchy: LocationItem[] = [
  {
    identifier: 'province',
    level: 1,
    name: 'Province',
  },
  {
    identifier: 'district',
    level: 2,
    name: 'District',
  },
  {
    identifier: 'canton',
    level: 3,
    name: 'Canton',
  },
  {
    identifier: 'village',
    level: 4,
    name: 'Village',
  },
];

/** Focus investigation configs */
/** Allowed FI Status values */
export const FIStatuses = ['A1', 'A2', 'B1', 'B2'] as const;

/** Allowed FI Status values */
export const FIReasons = ['Routine', 'Case Triggered'] as const;

/** Allowed goal priority values */
export const goalPriorities = ['low-priority', 'medium-priority', 'high-priority'] as const;

/** Allowed action Reason values */
export const actionReasons = ['Investigation', 'Routine'] as const;

/** Allowed useContext Code values */
export const useContextCodes = [
  'interventionType',
  'fiStatus',
  'fiReason',
  'opensrpEventId',
  'caseNum',
  'taskGenerationStatus',
] as const;

/** Plan activity code values */
export const PlanActionCodes = [
  'BCC',
  'IRS',
  'Bednet Distribution',
  'Blood Screening',
  'Case Confirmation',
  'RACD Register Family',
  'Larval Dipping',
  'Mosquito Collection',
] as const;

/** Allowed taskGenerationStatus values */
export const taskGenerationStatuses = ['True', 'False'] as const;

/** Plan Action Timing Period */
export interface PlanActionTimingPeriod {
  end: string;
  start: string;
}

/** Plan Action subjectCodableConcept */
export interface PlanActionsubjectCodableConcept {
  text: string;
}

/** Plan Action */
export interface PlanAction {
  code: PlanActionCodesType;
  description: string;
  goalId: string;
  identifier: string;
  prefix: number;
  reason: ActionReasonType;
  subjectCodableConcept: PlanActionsubjectCodableConcept;
  taskTemplate: string;
  timingPeriod: PlanActionTimingPeriod;
  title: string;
}

/** Plan Goal detailQuantity */
export interface PlanGoaldetailQuantity {
  comparator: '>=';
  unit: GoalUnit;
  value: number;
}

/** Plan Goal Detail */
export interface PlanGoalDetail {
  detailQuantity: PlanGoaldetailQuantity;
}

/** Plan Goal Target */
export interface PlanGoalTarget {
  due: string;
  detail: PlanGoalDetail;
  measure: string;
}

/** Plan Goal */
export interface PlanGoal {
  description: string;
  id: string;
  priority: GoalPriorityType;
  target: PlanGoalTarget[];
}

/** Plan Activity */
export interface PlanActivity {
  action: PlanAction;
  goal: PlanGoal;
}

/** Plan activity title values */
export const PlanActivityTitles = [
  'caseConfirmation',
  'familyRegistration',
  'bloodScreening',
  'bednetDistribution',
  'larvalDipping',
  'mosquitoCollection',
  'BCC',
  'IRS',
] as const;

/** default plan activities */
export const planActivities: PlanActivities = {
  BCC: {
    action: {
      code: 'BCC',
      description: 'Conduct BCC activity',
      goalId: 'BCC_Focus',
      identifier: '',
      prefix: 99,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Operational_Area',
      },
      taskTemplate: 'BCC_Focus',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Behaviour Change Communication',
    },
    goal: {
      description: 'Complete at least 1 BCC activity for the operational area',
      id: 'BCC_Focus',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 1,
            },
          },
          due: '',
          measure: 'Number of BCC Activities Completed',
        },
      ],
    },
  },
  IRS: {
    action: {
      code: 'IRS',
      description: 'Visit each structure in the operational area and attempt to spray',
      goalId: 'IRS',
      identifier: '',
      prefix: 7,
      reason: 'Routine',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'Spray_Structures',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Spray Structures',
    },
    goal: {
      description: 'Spray structures in the operational area',
      id: 'IRS',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 90,
            },
          },
          due: '',
          measure: 'Percent of structures sprayed',
        },
      ],
    },
  },
  bednetDistribution: {
    action: {
      code: 'Bednet Distribution',
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      goalId: 'RACD_bednet_distribution',
      identifier: '',
      prefix: 4,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'Bednet_Distribution',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Bednet Distribution',
    },
    goal: {
      description: 'Visit 100% of residential structures in the operational area and provide nets',
      id: 'RACD_bednet_distribution',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: 'Percent of residential structures received nets',
        },
      ],
    },
  },
  bloodScreening: {
    action: {
      code: 'Blood Screening',
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      goalId: 'RACD_Blood_Screening',
      identifier: '',
      prefix: 3,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Person',
      },
      taskTemplate: 'RACD_Blood_Screening',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Blood screening',
    },
    goal: {
      description:
        'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
      id: 'RACD_Blood_Screening',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERSON,
              value: 100,
            },
          },
          due: '',
          measure: 'Number of registered people tested',
        },
      ],
    },
  },
  caseConfirmation: {
    action: {
      code: 'Case Confirmation',
      description: 'Confirm the index case',
      goalId: 'Case_Confirmation',
      identifier: '',
      prefix: 1,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Operational_Area',
      },
      taskTemplate: 'Case_Confirmation',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Case Confirmation',
    },
    goal: {
      description: 'Confirm the index case',
      id: 'Case_Confirmation',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.CASE,
              value: 1,
            },
          },
          due: '',
          measure: 'Number of cases confirmed',
        },
      ],
    },
  },
  familyRegistration: {
    action: {
      code: 'RACD Register Family',
      description:
        'Register all families & family members in all residential structures enumerated (100%) within the operational area',
      goalId: 'RACD_register_families',
      identifier: '',
      prefix: 2,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Residential_Structure',
      },
      taskTemplate: 'RACD_register_families',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Family Registration',
    },
    goal: {
      description:
        'Register all families & family members in all residential structures enumerated (100%) within the operational area',
      id: 'RACD_register_families',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.PERCENT,
              value: 100,
            },
          },
          due: '',
          measure: 'Percent of residential structures with full family registration',
        },
      ],
    },
  },
  larvalDipping: {
    action: {
      code: 'Larval Dipping',
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      goalId: 'Larval_Dipping',
      identifier: '',
      prefix: 5,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Breeding_Site',
      },
      taskTemplate: 'Larval_Dipping',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Larval Dipping',
    },
    goal: {
      description: 'Perform a minimum of three larval dipping activities in the operational area',
      id: 'Larval_Dipping',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '',
          measure: 'Number of larval dipping activities completed',
        },
      ],
    },
  },
  mosquitoCollection: {
    action: {
      code: 'Mosquito Collection',
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      goalId: 'Mosquito_Collection',
      identifier: '',
      prefix: 6,
      reason: 'Investigation',
      subjectCodableConcept: {
        text: 'Mosquito_Collection_Point',
      },
      taskTemplate: 'Mosquito_Collection_Point',
      timingPeriod: {
        end: '',
        start: '',
      },
      title: 'Mosquito Collection',
    },
    goal: {
      description:
        'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
      id: 'Mosquito_Collection',
      priority: 'medium-priority',
      target: [
        {
          detail: {
            detailQuantity: {
              comparator: '>=',
              unit: GoalUnit.ACTIVITY,
              value: 3,
            },
          },
          due: '',
          measure: 'Number of mosquito collection activities completed',
        },
      ],
    },
  },
};

/** UseContext - interface for PlanPayload.useContext[] items */
export interface UseContext {
  code: UseContextCodesType;
  valueCodableConcept: string;
}

/** interface that describes plan definition objects from OpenSRP */
export interface PlanDefinition {
  action: PlanAction[];
  date: string;
  effectivePeriod: {
    end: string;
    start: string;
  };
  goal: PlanGoal[];
  identifier: string;
  jurisdiction: Array<{
    code: string;
  }>;
  name: string;
  serverVersion?: number;
  status: string;
  title: string;
  useContext: UseContext[];
  version: string;
}

/** Focus Investigation case classifications */
export const FIClassifications: Classification[] = [
  {
    code: 'A1',
    description: 'Indigenous case recorded within the last year.',
    name: 'Active',
  },
  {
    code: 'A2',
    description: 'No indigenous case during the last year, but withing the last 3 years.',
    name: 'Residual Non-Active',
  },
  {
    code: 'B1',
    description: 'Receptive area but no indigenous cases within the last 3 years.',
    name: 'Cleared Receptive',
  },
  {
    code: 'B2',
    description: 'Non-receptive area.',
    name: 'Cleared Non-Receptive',
  },
];

/** Indicators configs */

// thresholds
export const GREEN_THRESHOLD = 0.9;
export const YELLOW_THRESHOLD = 0.2;
export const ORANGE_THRESHOLD = 0.8;

// 1-3-7 thresholds
export const ONE = 0;
export const ZERO = 0;

/** Line layer configuration */
export const lineLayerConfig = {
  id: 'single-jurisdiction',
  paint: {
    'line-color': '#FFDC00',
    'line-opacity': 1,
    'line-width': 3,
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    type: 'geojson',
  },
  type: 'line',
  visible: false,
};

export const jurisdictionSelectionTooltipHint: string =
  'Shift+Click a Jurisdiction to toggle its selection';

/** Fill opacity configuration */
export const structureFillOpacity: Expression = [
  'match',
  ['get', 'task_business_status'],
  ['Not Visited'],
  0.7,
  ['Not Sprayed', 'Incomplete', 'In Progress'],
  0.7,
  ['Sprayed'],
  0.7,
  ['Not Sprayable'],
  1,
  0.75,
];

/** Jurisdiction Selection Map Layer Style Settings */
export const fullySelectedJurisdictionOpacity: number = 0.9;
export const partiallySelectedJurisdictionOpacity: number = 0.6;
export const deselectedJurisdictionOpacity: number = 0.3;

/** Fill layer configuration */
export const fillLayerConfig = {
  id: 'single-jurisdiction',
  paint: {
    'fill-color': '#FFDC00',
    'fill-opacity': structureFillOpacity,
    'fill-outline-color': '#FFDC00',
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    type: 'geojson',
  },
  type: 'fill',
  visible: false,
};

/** Circle layer configuration */
export const circleLayerConfig = {
  categories: {
    color: '#ff0000',
  },
  id: 'single-jurisdiction',
  paint: {
    'circle-color': '#FFDC00',
    'circle-opacity': 0.7,
    'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15.75, 2.5, 20.8, 50],
    'circle-stroke-width': 2,
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    type: 'geojson',
  },
  type: 'circle',
  visible: false,
};

/** Symbol layer configuration */
export const symbolLayerConfig = {
  id: 'symbollayers',
  layout: {
    'icon-image': 'mosquito',
    'icon-size': 2,
  },
  paint: {
    'text-color': '#0000ff',
    'text-halo-blur': 1,
    'text-halo-color': '#fff',
    'text-halo-width': 1.3,
  },
  source: {
    data: {
      data: {
        coordinates: [],
        type: 'Point',
      },
      type: 'stringified-geojson',
    },
    minzoom: 5.2,
    type: 'geojson',
  },
  type: 'symbol',
};

/** Default colors layer fill colors per administrative level */
export const adminLayerColors = ['black', 'red', 'orange', 'yellow', 'green'];

/** interface describing indicator threshold item */
export interface IndicatorThresholdItem {
  color: Color;
  name: string;
  orEquals?: boolean;
  value: number;
}

/** interface describing threshold configs for IRS report indicators */
export interface IndicatorThresholds {
  [key: string]: IndicatorThresholdItem;
}

/** IRS Reporting configs */
export const indicatorThresholdsIRS: IndicatorThresholds = {
  GREEN_THRESHOLD: {
    color: '#2ECC40',
    name: 'Green',
    value: 1,
  },
  GREY_THRESHOLD: {
    color: '#dddddd',
    name: 'Grey',
    value: 0.2,
  },
  RED_THRESHOLD: {
    color: '#FF4136',
    name: 'Red',
    orEquals: true,
    value: 0.75,
  },
  YELLOW_THRESHOLD: {
    color: '#FFDC00',
    name: 'Yellow',
    value: 0.9,
  },
};
/** END IRS Reporting configs */

/** interface describing base configs for irs reporting configurations */
export interface IrsReportingConfig {
  indicatorThresholds: IndicatorThresholds;
}

/* tslint:disable:object-literal-sort-keys */
/** The actual configuration object controlling how IRS Reporting is handled for different clients */
export const irsReportingCongif: {
  [key: string]: IrsReportingConfig;
} = {
  // Namibia Structures Configs
  [process.env.REACT_APP_SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE_NA as string]: {
    indicatorThresholds: indicatorThresholdsIRS,
  } as IrsReportingConfig,
};
/* tslint:enable:object-literal-sort-keys */

/** END IRS Reporting interfaces */

/** Interfaces describing administrative hierarchy via ISO 3166 admin codes */
export interface ADMN0 {
  ADMN0_PCODE: string;
  ADMN0_EN: string;
}
export interface ADMN1 extends ADMN0 {
  ADMN1_PCODE: string;
  ADMN1_EN: string;
}
export interface ADMN2 extends ADMN1 {
  ADMN2_PCODE: string;
  ADMN2_EN: string;
}
export interface ADMN3 extends ADMN2 {
  ADMN3_PCODE: string;
  ADMN3_EN: string;
}

export const baseTilesetGeographicLevel: number = 1; // this tells the Jurisdiction Selection map at which geographic level to start rendering administrative fill layers
export const JurisdictionLevels = ['administrative', 'operational'] as const;
export interface Tileset {
  idField: string; // the feature property corresponding with jurisdiction_id (for joining)
  jurisdictionType: JurisdictionTypes; // Admin or OA/FA/SA
  labelField?: string; // the feature property corresponding with the display name
  layer: string; // the Mapbox tileset-layer name
  parentIdField: string; // the feature property corresponding with parent_id (for joining)
  url: string; // the Mapbox tileset url
}
/** interface describing basic country level information */
export interface JurisdictionsByCountry extends ADMN0 {
  // the GPS extents of given geometry(s)
  bounds?: LngLatBoundsLike;

  // the top level jurisdiction_Ids from OpenSRP
  // this is most useful for instances where tilesets DO NOT match the OpenSRP hierarchy
  jurisdictionIds: string[];

  // the top level jurisdiction_id of the country
  jurisdictionId: string;

  // the UUID of the Jurisdiction from the
  id?: string;

  // list of tilesets used for administrative boundaries
  tilesets?: Tileset[];
}
/** Country Jurisdictions definition for Zambia */
export const ZambiaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Zambia',
  ADMN0_PCODE: 'ZM',
  bounds: [28.20209213900005, -15.549759923999941, 32.755632835000085, -13.718855579980357],
  jurisdictionId: '',
  jurisdictionIds: ['2939', '2940', '2942', '2942', '2953', '2954'],
  tilesets: [],
};

/** Country Jurisdictions definition for Thailand */
export const ThailandAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Thailand',
  ADMN0_PCODE: 'TH',
  bounds: [[105.63681192, 5.61285098], [97.34380713, 20.46483364]],
  jurisdictionId: '',
  jurisdictionIds: [
    '64301afa-e973-447b-a88c-4da20025c76f',
    '7f204867-fab0-4246-a97c-92e0b936cab6',
    '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
  ],
  tilesets: [
    {
      idField: 'ADM0_EN',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      // labelField: '',
      layer: 'TH_0',
      parentIdField: '',
      url: 'mapbox://thailandbvbd.6o8cg6kd',
    },
    {
      idField: 'ADM1_EN',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      // labelField: '',
      layer: 'TH_1',
      parentIdField: 'ADM0_EN',
      url: 'mapbox://thailandbvbd.91ktth0q',
    },
  ],
};

/** Country Jurisdictions definition for Namibia - WIP */
const NamibiaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Namibia',
  ADMN0_PCODE: 'NA',
  bounds: [[11.76, -28.97], [25.26, -16.95]],
  jurisdictionId: 'f45b9380-c970-4dd1-8533-9e95ab12f128',
  jurisdictionIds: [],
  tilesets: [
    {
      idField: 'jurisdictionId',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      labelField: 'name',
      layer: 'NA_0',
      parentIdField: 'name',
      url: 'mapbox://thailandbvbd.8k701kz0',
    },
    {
      idField: 'jurisdictionId',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      labelField: 'name',
      layer: 'NA_1',
      parentIdField: 'parentId',
      url: 'mapbox://thailandbvbd.4pm7lyll',
    },
    {
      idField: 'jurisdictionId',
      jurisdictionType: JurisdictionLevels[0] as JurisdictionTypes,
      labelField: 'name',
      layer: 'NA_2',
      parentIdField: 'parentId',
      url: 'mapbox://thailandbvbd.d7wo2nki',
    },
    {
      idField: 'id',
      jurisdictionType: JurisdictionLevels[1],
      labelField: 'name',
      layer: 'NA_3',
      parentIdField: 'parentId',
      url: 'mapbox://thailandbvbd.2gab6o28',
    },
  ],
};

export const BotswanaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Botswana',
  ADMN0_PCODE: 'BW',
  bounds: [19.99953461, -26.90737915, 29.36831093, -17.7808094],
  jurisdictionId: '16a77bba-8777-4bc4-8566-d193cb04af4c',
  jurisdictionIds: [],
  tilesets: [],
};
export const ChadizaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Chadiza',
  ADMN0_PCODE: 'Chadiza',
  bounds: [32.21137675056678, -14.309769922999974, 32.755632835000085, -13.899201952999928],
  jurisdictionId: '2939',
  jurisdictionIds: [],
  tilesets: [],
};
export const SindaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Sinda',
  ADMN0_PCODE: 'Sinda',
  bounds: [28.09754672919825, -16.727876287030366, 28.856324992204744, -16.196615979643692],
  jurisdictionId: '2941',
  jurisdictionIds: [],
  tilesets: [],
};
export const KateteAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Katete',
  ADMN0_PCODE: 'Katete',
  bounds: [31.796349266000046, -14.376530907999832, 32.32032420000019, -13.718855579980357],
  jurisdictionId: '2940',
  jurisdictionIds: [],
  tilesets: [],
};
export const SiavongaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Siavonga',
  ADMN0_PCODE: 'Siavonga',
  bounds: [28.09754672919825, -16.727876287030366, 28.856324992204744, -16.196615979643692],
  jurisdictionId: '3954',
  jurisdictionIds: [],
  tilesets: [],
};
export const LopBuriAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Lop Buri',
  ADMN0_PCODE: 'Lop Buri',
  bounds: [100.41996838300008, 14.646843667000041, 101.40442895400008, 15.756128613000044],
  jurisdictionId: '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
  jurisdictionIds: [],
  tilesets: [],
};
export const OddarMeancheyProvinceAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Oddar Meanchey Province',
  ADMN0_PCODE: 'Oddar Meanchey Province',
  bounds: [103.0318109980105, 13.87666596238883, 104.5085170565606, 14.440129974021772],
  jurisdictionId: 'f8863022-ff88-4c22-b2d1-83f59f31b874',
  jurisdictionIds: [],
  tilesets: [],
};
export const LusakaAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Lusaka',
  ADMN0_PCODE: 'Lusaka',
  bounds: [28.20209213900005, -15.549759923999941, 28.488907821000048, -15.31976316599997],
  jurisdictionId: '2942',
  jurisdictionIds: [],
  tilesets: [],
};
export const ราชอาณาจักรไทยAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'ราชอาณาจักรไทย',
  ADMN0_PCODE: 'ราชอาณาจักรไทย',
  bounds: [97.685, 15.117, 99.529, 17.917],
  jurisdictionId: 'ef33a6d9-aaaa-44ad-91b7-583ab3fcdb22',
  jurisdictionIds: [],
};
export const TakAdmin0: JurisdictionsByCountry = {
  ADMN0_EN: 'Tak',
  ADMN0_PCODE: 'Tak',
  bounds: [97.685, 15.117, 99.529, 17.917],
  jurisdictionId: '5e37d232-d471-4ac1-b8a6-f5215a8aa117',
  jurisdictionIds: [],
};

/** dictionary of JurisdictionsByCountry by country code */
export const CountriesAdmin0 = {
  BW: BotswanaAdmin0,
  Chadiza: ChadizaAdmin0,
  Katete: KateteAdmin0,
  ['Lop Buri']: LopBuriAdmin0,
  Lusaka: LusakaAdmin0,
  NA: NamibiaAdmin0,
  ['Oddar Meanchey Province']: OddarMeancheyProvinceAdmin0,
  Siavonga: SiavongaAdmin0,
  Sinda: SindaAdmin0,
  TH: ThailandAdmin0,
  Tak: TakAdmin0,
  ZM: ZambiaAdmin0,
  ราชอาณาจักรไทย: ราชอาณาจักรไทยAdmin0,
};
/** Columns for various Plans */
/** complete reactive columns with no data */
export const emptyCompleteReactivePlans = [
  {
    Header: 'Name',
    columns: [{}],
  },
  {
    Header: 'Date Completed',
    columns: [{}],
  },
  {
    Header: 'Case Notif. Date',
    columns: [{}],
  },
  {
    Header: 'Case Class.',
    columns: [{}],
  },
];
/** complete routine columns with no data */
export const emptyCompleteRoutinePlans = [
  {
    Header: 'Name',
    columns: [{}],
  },
  {
    Header: 'Start Date',
    columns: [{}],
  },
  {
    Header: 'End Date',
    columns: [{}],
  },
  {
    Header: 'Date Completed',
    columns: [{}],
  },
];
/** current reactive columns with no data */
export const emptyCurrentReactivePlans = [
  {
    Header: 'Name',
    columns: [{}],
  },
  {
    Header: 'FI Status',
    columns: [{}],
  },
  {
    Header: 'Case Notif. Date',
    columns: [{}],
  },
  {
    Header: 'Case Class.',
    columns: [{}],
  },
];
/** current routine columns with no data */
export const emptyCurrentRoutinePlans = [
  {
    Header: 'Name',
    columns: [{}],
  },
  {
    Header: 'FI Status',
    columns: [{}],
  },
  {
    Header: 'Province',
    columns: [{}],
  },
  {
    Header: 'District',
    columns: [{}],
  },
  {
    Header: 'Canton',
    columns: [{}],
  },
  {
    Header: 'Village',
    columns: [{}],
  },
  {
    Header: 'Focus Area',
    columns: [{}],
  },
  {
    Header: 'Status',
    columns: [{}],
  },
  {
    Header: 'Start Date',
    columns: [{}],
  },
  {
    Header: 'End Date',
    columns: [{}],
  },
];
/** current reactive columns with data */
export const currentReactivePlansColumns = [
  {
    Header: 'Case Notif. Date',
    columns: [
      {
        Header: '',
        accessor: 'caseNotificationDate',
        minWidth: 90,
      },
    ],
  },
  {
    Header: 'Case Class.',
    columns: [
      {
        Header: '',
        accessor: 'caseClassification',
      },
    ],
  },
];
/** current routine columns with data */
export const currentRoutinePlansColumn = [
  {
    Header: 'Status',
    columns: [
      {
        Header: '',
        accessor: 'status',
        maxWidth: 60,
      },
    ],
  },
  {
    Header: 'Start Date',
    columns: [
      {
        Header: '',
        accessor: 'plan_effective_period_start',
        minWidth: 80,
      },
    ],
  },
  {
    Header: 'End Date',
    columns: [
      {
        Header: '',
        accessor: 'plan_effective_period_end',
      },
    ],
  },
];
/** complete reactive columns with data */
export const completeReactivePlansColumn = [
  {
    Header: 'End Date',
    columns: [
      {
        Header: '',
        accessor: 'plan_effective_period_end',
      },
    ],
  },
  {
    Header: 'Case Notif. Date',
    columns: [
      {
        Header: '',
        accessor: 'caseNotificationDate',
        minWidth: 90,
      },
    ],
  },
  {
    Header: 'Case Class.',
    columns: [
      {
        Header: '',
        accessor: 'caseClassification',
      },
    ],
  },
];
/** complete routine columns with data */
export const completeRoutinePlansColumn = [
  {
    Header: 'Start Date',
    columns: [
      {
        Header: '',
        accessor: 'plan_effective_period_start',
        minWidth: 80,
      },
    ],
  },
  {
    Header: 'End Date',
    columns: [
      {
        Header: '',
        accessor: 'plan_effective_period_end',
      },
    ],
  },
  {
    Header: 'Date Completed',
    columns: [
      {
        Header: '',
        accessor: 'plan_effective_period_end',
      },
    ],
  },
];
/** Date completed field not there in the current plan  */
export const dateCompletedColumn = [
  {
    Header: 'Date Completed',
    columns: [
      {
        Header: '',
        accessor: 'date_completed',
        minWidth: 80,
      },
    ],
  },
];
// status column
export const statusColumn = [
  {
    Header: 'FI Status',
    columns: [
      {
        Header: '',
        accessor: 'plan_status',
        minWidth: 80,
      },
    ],
  },
];

// icons to add to map
export const imgArr = [
  {
    id: 'case-confirmation',
    imageUrl:
      'https://raw.githubusercontent.com/onaio/reveal-frontend/master/src/assets/images/case-confirmation.png',
  },
  {
    id: 'larval',
    imageUrl:
      'https://raw.githubusercontent.com/onaio/reveal-frontend/master/src/assets/images/larval.png',
  },
  {
    id: 'mosquito',
    imageUrl:
      'https://raw.githubusercontent.com/onaio/reveal-frontend/master/src/assets/images/mosquito.png',
  },
];
