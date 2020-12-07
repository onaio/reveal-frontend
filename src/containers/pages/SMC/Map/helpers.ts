import { Dictionary } from '@onaio/utils';
import mapboxgl, { EventData, LngLat, Map } from 'mapbox-gl';
import {
  BLACK,
  GREY,
  RED,
  TASK_GREEN,
  TASK_ORANGE,
  TASK_RED,
  TASK_YELLOW,
} from '../../../../colors';
import { STATUS_HEADER } from '../../../../configs/lang';
// import { GisidaProps } from '../../../../components/GisidaWrapper';
import { FEATURE } from '../../../../constants';
import { GenericJurisdiction } from '../../../../store/ducks/generic/jurisdictions';

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
