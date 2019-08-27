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
import { MAP_ID } from '../../constants';
import { EventData } from '../mapbox';
import { FlexObject } from '../utils';
import './handlers.css';

/** declare globals interface */
declare global {
  interface Window {
    maps: mapboxgl.Map[];
  }
  const mapboxgl: typeof mapboxgl;
}
/** FeatureWithLayer Interface extends Feature, Adds layer prop which is missing on Feature */
export interface FeatureWithLayer extends Feature {
  layer: FlexObject;
}
export function popupHandler(event: EventData) {
  /** currentGoal is currently not being used but we  may  use it in the future  */
  const features = event.target.queryRenderedFeatures(event.point) as FeatureWithLayer[];
  let description: string = '';
  const goalIds: string[] = [];
  features.forEach((feature: FeatureWithLayer) => {
    /**
     * Geometry type is a union of seven types.
     * Unfortunately, not all of those types include the coordinates property
     * Let's exclude GeometryCollection which has no coordinates for our case
     */
    if (
      feature &&
      feature.geometry &&
      (feature.geometry as
        | Point
        | MultiPoint
        | LineString
        | MultiLineString
        | Polygon
        | MultiPolygon).coordinates &&
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
