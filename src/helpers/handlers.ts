import { LngLat, Map } from 'mapbox-gl';
import { MAP_ID } from '../constants';
import './handlers.css';
import { EventData } from './mapbox';
import { FlexObject } from './utils';

/** declare globals interface */
declare global {
  interface Window {
    maps: mapboxgl.Map[];
  }
  const mapboxgl: typeof mapboxgl;
}

interface GisidaMap extends Map {
  _container: FlexObject;
}

/** Having features as any type is not most desirable this has been qued up as part of technical debt payment */
export function popupHandler(event: EventData) {
  const features = event.target.queryRenderedFeatures(event.point) as any[];
  let description: string = '';
  features.forEach((feature: any) => {
    if (
      feature &&
      feature.geometry &&
      feature.geometry.coordinates &&
      feature.properties &&
      feature.properties.action_code &&
      feature.layer.type !== 'line' &&
      feature.layer.id
    ) {
      description += `<p class="heading"> ${feature.properties.action_code}</b></p> <p> ${
        feature.properties.task_business_status
      }</p><br/><br/>`;
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
