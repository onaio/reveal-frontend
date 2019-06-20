import { EventData } from './mapbox';

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

  if (
    features &&
    features[0] &&
    features[0].geometry &&
    features[0].geometry.coordinates &&
    features[0].properties &&
    features[0].properties.action_code &&
    features[0].layer.type !== 'line'
  ) {
    const coordinates =
      features[0].layer.type === 'fill' ? event.lngLat : features[0].geometry.coordinates.slice();
    const description = features[0].properties.action_code;
    /** Ensure that if the map is zoomed out such that multiple
     * copies of the feature are visible,
     * the popup appears over the copy being pointed to
     */

    while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(window.maps[0]);
    // Change the cursor to a pointer when the mouse is over the states layer.
  }
}
