import { LngLat, Map, Point } from 'mapbox-gl';

/** interface for mapbox Event */
export interface EventData {
  type: string;
  target: Map;
  originalEvent: Event;
  point: Point;
  lngLat: LngLat;
}
