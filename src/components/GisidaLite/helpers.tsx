import { center as turfCenter, FeatureCollection as TurfFeatureCollection } from '@turf/turf';
import { Style } from 'mapbox-gl';
import { DIGITAL_GLOBE_CONNECT_ID } from '../../configs/env';

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

/** Symbol layer configuration */
export const symbolLayerTemplate = {
  data: null,
  id: 'id',
  symbolLayout: {
    'icon-image': 'mosquito',
    'icon-size': 2,
    ...visibleLayer,
  },
  symbolPaint: {
    'text-color': '#0000ff',
    'text-halo-blur': 1,
    'text-halo-color': '#fff',
    'text-halo-width': 1.3,
  },
  type: 'symbol',
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

export const gsLiteStyle: Style | string = DIGITAL_GLOBE_CONNECT_ID
  ? {
      layers: [
        {
          id: 'earthwatch-basemap',
          maxzoom: 22,
          minzoom: 0,
          source: 'diimagery',
          type: 'raster',
        },
      ],
      sources: {
        diimagery: {
          scheme: 'tms',
          tileSize: 256,
          tiles: [
            `https://access.maxar.com/earthservice/tmsaccess/tms/1.0.0/DigitalGlobe:ImageryTileService@EPSG:3857@png/{z}/{x}/{y}.png?connectId=${DIGITAL_GLOBE_CONNECT_ID}`,
          ],
          type: 'raster',
        },
      },
      version: 8,
    }
  : 'mapbox://styles/mapbox/satellite-v9';
