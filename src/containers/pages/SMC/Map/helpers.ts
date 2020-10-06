import GeojsonExtent from '@mapbox/geojson-extent';
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
import { GisidaProps } from '../../../../components/GisidaWrapper';
import { circleLayerConfig, fillLayerConfig, lineLayerConfig } from '../../../../configs/settings';
import { MAIN_PLAN, STRUCTURE_LAYER } from '../../../../constants';
import { GenericJurisdiction } from '../../../../store/ducks/generic/jurisdictions';
import { StructureFeatureCollection } from '../../../../store/ducks/generic/structures';
import { Jurisdiction } from '../../../../store/ducks/jurisdictions';

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

/** Utility function to build structure layer
 * @param {StructureFeatureCollection} structures - Feature Collection of structures
 * @param {string[][]} indicatorStops - the indicator stops
 */
export const structuresLayerBuilder = (
  structures: StructureFeatureCollection,
  indicatorStops: string[][] = defaultIndicatorStop
) => {
  const structuresLayers: Dictionary[] = [];

  const structuresPopup: Dictionary = {
    body: `<div>
          <p class="heading">{{structure_type}}</p>
          <p>Status: {{business_status}}</p>
        </div>`,
    join: ['structure_jurisdiction_id', 'structure_jurisdiction_id'],
  };

  const structureStatusColors = {
    default: GREY,
    property: 'business_status',
    stops: indicatorStops,
    type: 'categorical',
  };

  // build circle layers if structures are points
  const structureCircleLayer = {
    ...circleLayerConfig,
    filter: ['==', '$type', 'Point'],
    id: `${STRUCTURE_LAYER}-circle`,
    paint: {
      ...circleLayerConfig.paint,
      'circle-color': structureStatusColors,
      'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15.75, 2.5, 20.8, 50],
      'circle-stroke-color': structureStatusColors,
      'circle-stroke-opacity': 1,
    },
    popup: structuresPopup,
    source: {
      ...circleLayerConfig.source,
      data: {
        data: JSON.stringify(structures),
        type: 'stringified-geojson',
      },
      type: 'geojson',
    },
    visible: true,
  };
  structuresLayers.push(structureCircleLayer);

  // build fill / line layers if structures are polygons
  const structuresFillLayer = {
    ...fillLayerConfig,
    filter: ['==', '$type', 'Polygon'],
    id: `${STRUCTURE_LAYER}-fill`,
    paint: {
      ...fillLayerConfig.paint,
      'fill-color': structureStatusColors,
      'fill-outline-color': structureStatusColors,
    },
    popup: structuresPopup,
    source: {
      ...fillLayerConfig.source,
      data: {
        ...fillLayerConfig.source.data,
        data: JSON.stringify(structures),
      },
    },
    visible: true,
  };
  structuresLayers.push(structuresFillLayer);

  const structuresLineLayer = {
    ...lineLayerConfig,
    filter: ['==', '$type', 'Polygon'],
    id: `${STRUCTURE_LAYER}-line`,
    paint: {
      'line-color': structureStatusColors,
      'line-opacity': 1,
      'line-width': 2,
    },
    source: {
      ...lineLayerConfig.source,
      data: {
        ...lineLayerConfig.source.data,
        data: JSON.stringify(structures),
      },
    },
  };
  structuresLayers.push(structuresLineLayer);

  return structuresLayers;
};

/** Get Gisida Wrapper Props
 * @param {Jurisdiction} jurisdiction - the jurisdiction (with geojson field)
 * @param {StructureFeatureCollection} structures - Feature Collection of structures
 * @param {string[][]} indicatorStops - the indicator stops
 */
export const getGisidaWrapperProps = (
  jurisdiction: Jurisdiction,
  structures: StructureFeatureCollection | null,
  indicatorStops: string[][] = defaultIndicatorStop
): GisidaProps | null => {
  if (!jurisdiction.geojson) {
    return null;
  }
  const layers: Dictionary[] = [];

  // define line layer for Jurisdiction outline
  const jurisdictionLineLayer = {
    ...lineLayerConfig,
    id: `${MAIN_PLAN}-${jurisdiction.jurisdiction_id}`,
    source: {
      ...lineLayerConfig.source,
      data: {
        ...lineLayerConfig.source.data,
        data: JSON.stringify(jurisdiction.geojson),
      },
    },
    visible: true,
  };
  layers.push(jurisdictionLineLayer);

  // Define structures layers
  let structuresLayers: Dictionary[] = [];
  if (structures) {
    structuresLayers = structuresLayerBuilder(structures, indicatorStops);
  }

  // define feature collection of all geoms being rendered
  const featureCollection =
    !structures || !structures.features || !structures.features.length
      ? { features: [jurisdiction.geojson], type: 'FeatureCollection' }
      : {
          ...structures,
          features: [...structures.features, jurisdiction.geojson],
        };
  // define bounds for gisida map position
  const bounds = GeojsonExtent(featureCollection);

  for (const structureLayer of structuresLayers) {
    layers.push(structureLayer);
  }

  const gisidaWrapperProps: GisidaProps = {
    bounds,
    currentGoal: null,
    geoData: null,
    goal: null,
    handlers: [],
    layers,
    pointFeatureCollection: null,
    polygonFeatureCollection: null,
    structures: null,
  };
  return gisidaWrapperProps;
};

/** Get breadcrumbs for a jurisdiction object
 * This uses the jurisdiction_name_path and jurisdiction_path fields to get
 * the breadcrumbs of the parents of a given jurisdiction object
 * @param {GenericJurisdiction} jurisdiction - the jurisdiction in question
 * @param {string} urlPath - the url path that we append the jurisdiction id to
 */
export const getJurisdictionBreadcrumbs = (
  jurisdiction: GenericJurisdiction,
  urlPath: string = '/'
) => {
  const result = [];

  for (let i = 0; i < jurisdiction.jurisdiction_name_path.length; i++) {
    let url = urlPath;
    if (jurisdiction.jurisdiction_path[i]) {
      url = `${urlPath}/${jurisdiction.jurisdiction_path[i]}`;
    }
    result.push({
      label: jurisdiction.jurisdiction_name_path[i],
      url,
    });
  }

  return result;
};

/** Get indicator rows */
export const getIndicatorRows = (defaultRows: IndicatorRows, focusArea: Dictionary) => {
  const rows: Dictionary[] = [];
  defaultRows.forEach((row: IndicatorRowItem) => {
    const value = focusArea ? (focusArea as any)[row.value] || 0 : 0;
    const listDisplay =
      focusArea && row.listDisplay
        ? (focusArea as any)[row.listDisplay as string] || undefined
        : undefined;

    // if focusArea. does not have notSprayed_reasons_counts; skip
    if (listDisplay) {
      const notSprayedCounts = JSON.parse(listDisplay);
      if (Object.entries(notSprayedCounts).length === 0) {
        return;
      }
    }

    rows.push({
      ...row,
      ...{
        denominator: focusArea ? (focusArea as any)[row.denominator] || 0 : 0,
        listDisplay,
        numerator: focusArea ? (focusArea as any)[row.numerator] || 0 : 0,
        value: Math.round(value * 100),
      },
    });
  });
  return rows;
};
