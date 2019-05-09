import * as GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';

import {
  FlexObject,
  // MapConfigs,
  SiteConfig,
  SiteConfigApp,
  SiteConfigAppMapconfig,
} from '../../helpers/utils';
import store from '../../store';
import './gisida.css';

interface GisidaState {
  bounds: number[];
  locations: FlexObject | false;
  doInitMap: boolean;
}

// stand-in Async func to return geojson for feature + children
const LocationsFetcher = (id: number) =>
  fetch('/config/data/opensrplocations.json')
    .then(res => res.json())
    .then(Locations => {
      let l;
      const features = [];

      // find primary feature from id
      for (l = 0; l < Locations.length; l += 1) {
        if (Number(Locations[l].id) === id) {
          features.push(Locations[l]);
          break;
        }
      }

      // if primary feature isn' found
      if (!features.length) {
        return false;
      } // throw an error

      // find direct children of primary feature
      for (l = 0; l < Locations.length; l += 1) {
        if (Number(Locations[l].properties.parentId) === id) {
          features.push(Locations[l]);
        }
      }

      // return geojson shapped data
      return {
        features,
        type: 'FeatureCollection',
      };
    });

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
  const {
    mapConfigCenter,
    mapConfigContainer,
    mapConfigStyle,
    mapConfigZoom,
    mapConfigBounds,
  } = options;
  // Define non-flattened APP.Config properties
  const { center, container, style, zoom, bounds } = mbConfig || options;

  // Build options for mapbox-gl-js initialization
  let mapConfig: SiteConfigAppMapconfig = {
    container: container || mapConfigContainer || 'map',
    style: style || mapConfigStyle || 'mapbox://styles/ona/cjestgt7ldbet2sqnqth4xx8c',
  };
  if (bounds || mapConfigBounds) {
    mapConfig = {
      ...mapConfig,
      bounds: bounds || mapConfigBounds,
    };
  } else {
    mapConfig = {
      ...mapConfig,
      center: center || mapConfigCenter || [0, 0],
      zoom: zoom || mapConfigZoom || 0,
    };
  }
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
    this.state = {
      bounds: [],
      doInitMap: false,
      locations: this.props.locations || false,
    };

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

  public componentDidUpdate() {
    if (this.state.locations && this.state.doInitMap) {
      this.setState({ doInitMap: false }, () => {
        this.initMap();
      });
    }
  }

  public render() {
    const currentState = store.getState();
    const doRenderMap = typeof currentState['map-1'] !== 'undefined';
    const mapId = this.props.mapId || 'map-1';
    const doRenderMap = typeof currentState[mapId] !== 'undefined';
    if (!doRenderMap) {
      return null;
    }

    return <Map mapId={mapId} store={store} handlers={this.props.handlers} />;
  }

  // 2. Get relevant goejson locations
  private async getLocations(id: number | undefined) {
    if (Number.isNaN(Number(id))) {
      this.setState({ locations: false });
    } else {
      const locations = await LocationsFetcher(Number(id));
      const bounds = GeojsonExtent(locations);

      // const bbountds = GetBounds(locations);
      // console.log(bounds);
      // debugger;
      this.setState({ locations, doInitMap: true, bounds });
    }
  }

  // 3. Define options for map config
  private initMap() {
    const { locations, bounds } = this.state;
    if (!locations) {
      return false;
    }
    // 3a. Determine map bounds from locations geoms
    // 3b. Define layers
    const layers = [
      {
        id: 'default-geoms',
        paint: {
          'line-color': '#888',
          'line-opacity': 1,
          'line-width': 1,
        },
        source: {
          data: {
            data: JSON.stringify(locations),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        type: 'line',
        visible: true,
      },
    ];

    const config = ConfigStore({
      appName: locations.features[0].properties.name,
      bounds,
      layers,
    });

    return doRenderMap ? <Map mapId={mapId} store={store} handlers={this.props.handlers} /> : null;
  }
}

export default GisidaWrapper;
