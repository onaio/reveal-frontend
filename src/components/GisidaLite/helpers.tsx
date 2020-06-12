import { center as turfCenter, FeatureCollection as TurfFeatureCollection } from '@turf/turf';

/** Get the centre coordinates from a feature collection */
export const getCenter = (fc: TurfFeatureCollection): [number, number] | undefined => {
  const center = turfCenter(fc);
  return center.geometry
    ? [center.geometry.coordinates[0], center.geometry.coordinates[1]]
    : undefined;
};

const visibleLayer = { visibility: 'visible' }; // { visibility: 'none' } hides it

export const lineLayerTemplate = {
  data: null,
  id: 'id',
  lineLayout: visibleLayer,
  linePaint: {
    'line-color': '#FFDC00',
    'line-opacity': 1,
    'line-width': 3,
  },
  type: 'line',
};

export const circleLayerTemplate = {
  circleLayout: visibleLayer,
  circlePaint: {
    'circle-color': '#FFDC00',
    'circle-opacity': 0.7,
    'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15.75, 2.5, 20.8, 50],
    'circle-stroke-width': 2,
  },
  data: null,
  id: 'id',
  type: 'circle',
};

export const fillLayerTemplate = {
  data: null,
  fillLayout: visibleLayer,
  fillPaint: {
    'fill-color': '#FFDC00',
    'fill-outline-color': '#FFDC00',
  },
  id: 'id',
  type: 'fill',
};
