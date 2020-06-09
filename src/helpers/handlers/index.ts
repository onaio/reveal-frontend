import { Dictionary } from '@onaio/utils';
import {
  Feature,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon,
} from 'geojson';
import { GisidaMap } from 'gisida';
import { LngLat, Map } from 'mapbox-gl';
import { CASE_CONFIRMATION_CODE, MAP_ID } from '../../constants';
import { EventData } from '../mapbox';
import './handlers.css';

/** declare globals interface */
declare global {
  interface Window {
    maps: mapboxgl.Map[];
  }
  const mapboxgl: typeof mapboxgl;
}
/**
 * Geometry type is a union of seven types.
 * For union type we can only access members that are common to all types in the union.
 * Unfortunately, not all of those types include the coordinates property
 * Let's narrow down GeometryCollection which has no coordinates for our case when extending Feature
 * Let's also add layer prop which is missing on Feature
 */
export interface FeatureWithLayer
  extends Feature<Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon> {
  layer: Dictionary;
}

export type PopHandler = (event: EventData) => void;

export function popupHandler(event: EventData, planId: string) {
  /** differentiate between current index cases and historical index cases by use of plan_id
   * current_case will be index_case belonging to this plan
   */
  const features = event.target.queryRenderedFeatures(event.point) as FeatureWithLayer[];
  let description: string = '';
  /** currentGoal is currently not being used but we  may  use it in the future  */
  const goalIds: string[] = [];
  features.forEach((feature: FeatureWithLayer) => {
    if (
      feature &&
      feature.geometry &&
      feature.geometry.coordinates &&
      feature.properties &&
      feature.properties.action_code &&
      feature.layer.type !== 'line' &&
      feature.layer.id &&
      !goalIds.includes(feature.properties.goal_id)
    ) {
      if (feature.properties.goal_id) {
        goalIds.push(feature.properties.goal_id);
      }
      // Splitting into two lines to fix breaking tests
      description += `<p class="heading">${feature.properties.action_code}</b></p>`;
      description += `<p>${feature.properties.task_business_status}</p><br/><br/>`;
      if (
        feature.properties.action_code === CASE_CONFIRMATION_CODE &&
        feature.properties.plan_id !== planId
      ) {
        description = '<strong>Historical index case</strong>';
      }
    }
  });
  if (description.length) {
    description = '<div>' + description + '</div>';
    const coordinates: LngLat = event.lngLat;
    /** Ensure that if the map is zoomed out such that multiple
     * copies of the feature are visible,
     * the popup appears over the copy being pointed to
     */

    while (Math.abs(event.lngLat.lng - coordinates.lng) > 180) {
      coordinates.lng += event.lngLat.lng > coordinates.lng ? 360 : -360;
    }
    // to do map container_id should come from props incase we have many maps to show
    const loadedMap =
      window.maps[window.maps.map((map: Map) => (map as GisidaMap)._container.id).indexOf(MAP_ID)];
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(loadedMap);
  }
}
