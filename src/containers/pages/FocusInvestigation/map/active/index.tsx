import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers, prepareLayer } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { AnyAction } from 'redux';

import {
  FlexObject,
  MapConfigs,
  MapProps,
  RouteParams,
  SiteConfig,
  SiteConfigApp,
  SiteConfigAppMapconfig,
} from '../../../../../helpers/utils';
import store from '../../../../../store';
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
    // todo - make local layer files work
    // a) make gisida point to an absolute path
    // b) tell react-router to serve the <layer>.json files
    layers: ['province-admin'],
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

/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<RouteComponentProps<RouteParams> & MapProps, {}> {
  constructor(props: RouteComponentProps<RouteParams> & MapProps) {
    super(props);
    const initialState = store.getState();
    const { id } = props.match.params;
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
    const mapName = (currentState.APP && currentState.APP.appName) || '';
    const doRenderMap = typeof currentState['map-1'] !== 'undefined';

    return (
      <div>
        <h2 className="page-title mt-4 mb-5">Map View: {mapName}</h2>
        <div className="map">
          {doRenderMap ? (
            <Map mapId={'map-1'} store={store} handlers={this.buildHandlers()} />
          ) : null}
        </div>
      </div>
    );
  }

  private loadLayerFunc(
    resObj: FlexObject,
    layerId: number,
    mapId: string,
    dispatch: (action: AnyAction) => void
  ): void {
    const layerObj = { ...resObj };
    layerObj.id = layerId;
    layerObj.loaded = false;
    dispatch(Actions.addLayer(mapId, layerObj));
    if (layerObj.visible && !layerObj.loaded) {
      prepareLayer(mapId, layerObj, dispatch);
    }
  }

  private loadLayers(mapId: string, layers: FlexObject[], dispatch: (action: AnyAction) => void) {
    let layer;
    if (Array.isArray(layers) && layers.length) {
      for (let l = 0; l < layers.length; l += 1) {
        layer = layers[l];
        this.loadLayerFunc(layer, l, mapId, dispatch);
      }
    }
  }

  private buildHandlers() {
    const { MAP } = this.props;
    const handlers = [
      {
        method: function drillDownClick(e: any) {
          if (e.originalEvent.shiftKey) {
            return false;
          }
          const features = e.target.queryRenderedFeatures(e.point);
          const feature = features.find((d: any) => d.layer.id === MAP.activeLayerId);
          if (e.target.getLayer('region-line') && e.target.getLayer(feature.layer.id)) {
            e.target.setFilter('region-line', [
              'any',
              ['==', 'ADM1_PCODE', feature.properties.ADM1_PCODE],
            ]);
          }
        },
        name: 'drillDownClick',
        type: 'click',
      },
      {
        method: function selectionClick(e: any) {
          if (!e.originalEvent.shiftKey) {
            return false;
          }
        },
        name: 'selectionClick',
        type: 'click',
      },
    ];
    return handlers;
  }
}

export default SingleActiveFIMap;
