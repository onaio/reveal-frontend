import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';

import {
  FlexObject,
  MapConfigs,
  SiteConfig,
  SiteConfigApp,
  SiteConfigAppMapconfig,
} from '../../helpers/utils';
import store from '../../store';
import './gisida.css';

// Temporary Object containing different map config params
// todo - dynamically generate these from somewhere
const configs: MapConfigs = {
  '13': {
    accessToken: 'pk.eyJ1Ijoib25hIiwiYSI6IlVYbkdyclkifQ.0Bz-QOOXZZK01dq4MuMImQ',
    apiAccessToken: '138a7ff6dfdcb5b4e41eb2d39bcc76ce5d296e89',
    appName: 'Test Map',
    layers: [
      'https://raw.githubusercontent.com/onaio/cycloneidai-2019-data/master/moz/province-admin/province-admin.json',
    ],
    mapConfig: {
      center: [33.852072, -18.850944],
      container: 'map',
      style: 'mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c',
      zoom: 6.5,
    },
  },
  '14': {
    accessToken: 'pk.eyJ1Ijoib25hIiwiYSI6IlVYbkdyclkifQ.0Bz-QOOXZZK01dq4MuMImQ',
    apiAccessToken: '138a7ff6dfdcb5b4e41eb2d39bcc76ce5d296e89',
    appName: 'Test Map 2',
    layers: [
      'https://raw.githubusercontent.com/onaio/zim-data/master/boundaries-labels/province/province-admin.json',
      'https://raw.githubusercontent.com/onaio/zim-data/master/boundaries-labels/district/district-admin.json',
    ],
    mapConfigCenter: [27.199728142287427, -18.94022942134295],
    mapConfigContainer: 'map',
    mapConfigStyle: 'mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c',
    mapConfigZoom: 5.76,
  },
  '15': {
    accessToken: 'pk.eyJ1Ijoib25hIiwiYSI6IlVYbkdyclkifQ.0Bz-QOOXZZK01dq4MuMImQ',
    apiAccessToken: '138a7ff6dfdcb5b4e41eb2d39bcc76ce5d296e89',
    appName: 'Test Map 3',
    center: [69.13155473084771, 34.50960383103761],
    layers: ['/config/layers/province-admin.json'],
    style: 'mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c',
    zoom: 10.695873279884117,
  },
};

/** Returns a single layer configuration */
const LayerStore = (layer: any) => {
  if (typeof layer === 'string') {
    return layer;
  }
  // todo - dynamically build layer configs based on layerObj params and layer type defaults
};

/** Returns a single `site-config` object for a Gisida Map  */
const ConfigStore = (options: FlexObject) => {
  // Define basic config properties
  const { accessToken, apiAccessToken, appName, mapConfig: mbConfig, layers } = options;
  // Define flattened APP.mapConfig properties
  const { mapConfigCenter, mapConfigContainer, mapConfigStyle, mapConfigZoom } = options;
  // Define non-flattened APP.Config properties
  const { center, container, style, zoom } = mbConfig || options;

  // Build options for mapbox-gl-js initialization
  const mapConfig: SiteConfigAppMapconfig = {
    center: center || mapConfigCenter || [0, 0],
    container: container || mapConfigContainer || 'map',
    style: style || mapConfigStyle || 'mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c',
    zoom: zoom || mapConfigZoom || 0,
  };
  // Build APP options for Gisida
  const APP: SiteConfigApp = {
    accessToken,
    apiAccessToken,
    appName,
    mapConfig,
  };
  // Build SiteConfig
  const config: SiteConfig = {
    APP,
    LAYERS: layers.map(LayerStore),
  };
  return config;
};

class GisidaWrapper extends React.Component<FlexObject> {
  constructor(props: FlexObject) {
    super(props);
    const initialState = store.getState();
    const { id } = props;
    // 1. Register mapReducers in reducer registery;
    if (!initialState.APP && ducks.APP) {
      reducerRegistry.register('APP', ducks.APP.default);
    }
    if (!initialState['map-1'] && ducks.MAP) {
      reducerRegistry.register('map-1', ducks.MAP.default);
    }

    // 2. Build/Load site-config js
    if (typeof id !== 'undefined' && typeof configs[id] !== 'undefined') {
      const config = ConfigStore(configs[id]);

      // 3. Initialize Gisida stores
      store.dispatch(Actions.initApp(config.APP));
      loadLayers('map-1', store.dispatch, config.LAYERS);
    }
  }

  public render() {
    const currentState = store.getState();
    const doRenderMap = typeof currentState['map-1'] !== 'undefined';
    const mapId = this.props.mapId || 'map-1';

    return doRenderMap ? <Map mapId={mapId} store={store} handlers={this.props.handlers} /> : null;
  }
}

export default GisidaWrapper;
