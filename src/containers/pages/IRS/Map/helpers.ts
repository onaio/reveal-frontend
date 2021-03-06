import { Dictionary } from '@onaio/utils';
import mapboxgl, { EventData, LngLat, Map } from 'mapbox-gl';
import { BLACK, TASK_GREEN, TASK_ORANGE, TASK_RED, TASK_YELLOW } from '../../../../colors';
import { STATUS_HEADER } from '../../../../configs/lang';
import { FEATURE } from '../../../../constants';
import { GenericJurisdiction } from '../../../../store/ducks/generic/jurisdictions';

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
  namibia2019: [
    {
      denominator: 'jurisdiction_target',
      description: 'Percent of structures sprayed over targeted',
      numerator: 'structuressprayed',
      title: 'Target Coverage',
      unit: 'room(s)',
      value: 'targetcoverage',
    },
    {
      denominator: 'structuresfound',
      description: 'Percent of structures sprayed over found',
      numerator: 'structuressprayed',
      title: 'Found Coverage',
      unit: 'room(s)',
      value: 'foundcoverage',
    },
  ],
  zambia2019: [
    {
      denominator: 'totstruct',
      description: 'Percent of structures sprayed over total',
      numerator: 'sprayedstruct',
      title: 'Spray Coverage (Effectiveness)',
      value: 'spraycov',
    },
    {
      denominator: 'totstruct',
      description: 'Percent of structures found over total',
      numerator: 'foundstruct',
      title: 'Found Coverage',
      value: 'spraytarg',
    },
    {
      denominator: 'foundstruct',
      description: 'Percent of structures sprayed over found',
      numerator: 'sprayedstruct',
      title: 'Spray Success Rate (PMI SC)',
      value: 'spraysuccess',
    },
    {
      denominator: 'foundstruct',
      description: 'reasons given for not sprayed structures',
      listDisplay: 'notsprayed_reasons_counts',
      numerator: 'sprayedstruct',
      title: 'Reasons for not-sprayed structures',
      unit: 'structures not sprayed',
      value: 'spraysuccess',
    },
  ],
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

/**
 * Add popup on map when a point is clicked
 * @param {Map} map
 * @param {EventData} event
 */
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
