import { Dictionary } from '@onaio/utils';
import mapboxgl, { EventData, LngLat, Map } from 'mapbox-gl';
import { BLACK, GREY, TASK_GREEN, TASK_ORANGE, TASK_RED, TASK_YELLOW } from '../../../../colors';
import { STATUS_HEADER } from '../../../../configs/lang';
import { circleLayerConfig, fillLayerConfig, lineLayerConfig } from '../../../../configs/settings';
import { FEATURE } from '../../../../constants';
import { STRUCTURE_LAYER } from '../../../../constants';
import { GenericJurisdiction } from '../../../../store/ducks/generic/jurisdictions';
import { StructureFeatureCollection } from '../../../../store/ducks/generic/structures';

/** The default indicator stop */
export const defaultIndicatorStop = [
  ['Sprayed', TASK_GREEN],
  ['Not Sprayed', TASK_RED],
  ['Partially Sprayed', TASK_ORANGE],
  ['Not Visited', TASK_YELLOW],
  ['Not Eligible', BLACK],
];

/** IRS Indicator stops
 * These are all the indicator stops for IRS that we know about.
 */
export const IRSIndicatorStops: { [key: string]: string[][] } = {
  namibia2019: defaultIndicatorStop,
  zambia2019: [
    ['Complete', TASK_GREEN],
    ['Not Sprayed', TASK_RED],
    ['Partially Sprayed', TASK_GREEN],
    ['Not Visited', TASK_YELLOW],
    ['Not Eligible', BLACK],
  ],
};

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
          <p>Name: {{structure_name}}</p>
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

export const mapOnClickHandler = (map: Map, event: EventData) => {
  const features = event.target.queryRenderedFeatures(event.point) as Dictionary[];
  let description: string = '';
  features.forEach((feature: any) => {
    if (
      feature &&
      feature.geometry &&
      feature.geometry.coordinates &&
      feature.properties &&
      feature.properties.business_status
    ) {
      description += `<p class="heading">${FEATURE}</b></p>`;
      description += `<p>${STATUS_HEADER}: ${feature.properties.business_status}</p><br/><br/>`;
    }
  });
  if (description.length) {
    description = '<div style=min-width:150px>' + description + '</div>';
    const coordinates: LngLat = event.lngLat;
    while (Math.abs(event.lngLat.lng - coordinates.lng) > 180) {
      coordinates.lng += event.lngLat.lng > coordinates.lng ? 360 : -360;
    }
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  }
};
