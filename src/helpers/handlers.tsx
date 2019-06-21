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

/** Having features as any type is not most desirable this has been qued up as part of technical debt payment */
export function popupHandler(event: EventData) {
  const features = event.target.queryRenderedFeatures(event.point) as any;
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
      // /** Dirty & very Mangy code */
      // let taskid;
      // taskid = feature.layer.id;
      // if (taskid.includes('-')) {
      //   taskid = taskid.split('-');
      //   taskid.shift();
      //   taskid = taskid.join('-');
      // }
      description += `<p class="heading"> ${feature.properties.action_code}</b></p> <p> ${
        feature.properties.task_business_status
      }</p><br/><br/>`;
    }
  });
  if (description.length) {
    description = '<div>' + description + '</div>';
    const coordinates: any = event.lngLat;
    /** Ensure that if the map is zoomed out such that multiple
     * copies of the feature are visible,
     * the popup appears over the copy being pointed to
     */

    while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    // to do map container_id should come from props incase we have many maps to show
    const loadedMap =
      window.maps[window.maps.map((d: FlexObject) => d._container.id).indexOf(MAP_ID)];
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(loadedMap);
    // Change the cursor to a pointer when the mouse is over the states layer.
  }
}
