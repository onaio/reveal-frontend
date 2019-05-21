import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';

import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN } from '../../configs/env'; // this isn't working T_T
import { FlexObject, SiteConfig, SiteConfigApp, SiteConfigAppMapconfig } from '../../helpers/utils';
import store from '../../store';
import { GeoJSON } from '../../store/ducks/geojson';
import './gisida.css';

interface GisidaState {
  bounds: number[];
  locations: FlexObject | false;
  doInitMap: boolean;
  doRenderMap: boolean;
  // id: number;
  geoData: GeoJSON[];
}

// stand-in Async func to return geojson for feature + children

// const LocationsFetcher = (id: string, geoData: GeoJSON[]) => {
//   let l;
//   const features: any[] = [];
//   // find primary feature from id
//   for (l = 0; l < geoData.length; l += 1) {
//     if (geoData[l].jurisdiction_id === id) {
//       features.push(geoData[l]);
//       break;
//     }
//   }

//   // if primary feature isn't found
//   if (!features.length) {
//     // return all top level geoms
//     for (l = 0; l < geoData.length; l += 1) {
//       if (geoData[l].jurisdiction_parent_id) {
//         features.push(geoData[l]);
//       }
//     }
//   } else {
//     // find direct children of primary feature
//     for (l = 0; l < geoData.length; l += 1) {
//       if (geoData[l].jurisdiction_parent_id === id) {
//         features.push(geoData[l]);
//       }
//     }
//   }
//   // return geojson shapped data
//   return {
//     features,
//     type: 'FeatureCollection',
//   };
// };

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
    mapConfigFitBoundsOptions,
  } = options;
  // Define non-flattened APP.Config properties
  const { center, container, style, zoom, bounds, fitBoundsOptions } = mbConfig || options;

  // Build options for mapbox-gl-js initialization
  let mapConfig: SiteConfigAppMapconfig = {
    container: container || mapConfigContainer || 'map',
    style: style || mapConfigStyle || 'mapbox://styles/mapbox/satellite-v9',
  };
  if (bounds || mapConfigBounds) {
    mapConfig = {
      ...mapConfig,
      bounds: bounds || mapConfigBounds,
      fitBoundsOptions: fitBoundsOptions || mapConfigFitBoundsOptions || { padding: 20 },
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
      doRenderMap: false,
      geoData: this.props.geoData || false,
      locations: this.props.locations || false,
    };

    // 1. Register mapReducers in reducer registery;
    if (!initialState.APP && ducks.APP) {
      reducerRegistry.register('APP', ducks.APP.default);
    }
    // Make map-1 more dynamic
    if (!initialState['map-1'] && ducks.MAP) {
      reducerRegistry.register('map-1', ducks.MAP.default);
    }

  public componentDidMount() {
    if (!this.state.locations) {
      this.setState(() => {
        this.getLocations(this.props.geoData);
      });
    }
  }

  public componentWillReceiveProps(nextProps: any) {
    /** check for types */
    if (this.props.geoData !== nextProps.geoData) {
      this.setState(
        {
          doRenderMap: false,
          geoData: nextProps.geoData,
          locations: false,
        },
        () => {
          this.getLocations(nextProps.geoData);
        }
      );
    }
  }

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
    const doRenderMap = this.state.doRenderMap && typeof currentState[mapId] !== 'undefined';
    if (!doRenderMap) {
      return null;
    }

    return <Map mapId={mapId} store={store} handlers={this.props.handlers} />;
  }

  // 2. Get relevant goejson locations
  private async getLocations(geoData: any | null) {
    // 2a. Asynchronously obtain geometries as geojson object
    /* DIRTY HACKY checks */
    // if (geoData && geoData.length && typeof geoData[0].geometry !== 'object') {
    //   geoData.map((item: any) => {
    //     item.geometry = JSON.parse(item.geometry);
    //   });
    // }
    // /**  DIRTY HACK store takes longer than expected */
    // const locations =
    //   geoData && geoData.length && typeof geoData[0].geometry !== 'string'
    //     ? LocationsFetcher(id, geoData)
    //     : false;
    // // 2b. Determine map bounds from locations geoms
    let locations;
    if (geoData && geoData.geometry) {
      locations =
        typeof geoData.geometry !== 'string' ? geoData.geometry : JSON.parse(geoData.geometry);
    } else {
      locations = false;
    }
    const bounds = locations ? GeojsonExtent(locations) : null;
    if (locations) {
      this.setState({ locations, doInitMap: true, bounds });
    }
  }

  // 3. Define map site-config object to init the store
  private initMap() {
    const { locations, bounds } = this.state;
    if (!locations) {
      return false;
    }
    // 3b. Define layers for config
    // todo - dynamically create the layers we need
    const layers = [
      {
        id: 'default-geoms',
        paint: {
          // 'line-color': 'white',
          // 'line-opacity': 1,
          // 'line-width': 1,
          'fill-color': 'rgba(0,116,217,0.5)',
          'fill-outline-color': 'white',
        },
        source: {
          data: {
            data: JSON.stringify(locations),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        type: 'fill',
        visible: true,
      },
    ];
    // 3b. Build the site-config object for Gisida
    const config = ConfigStore({
      appName: locations,
      bounds,
      layers,
    });

    this.setState({ doRenderMap: true }, () => {
      // 4. Initialize Gisida stores
      store.dispatch(Actions.initApp(config.APP));
      loadLayers('map-1', store.dispatch, config.LAYERS);

      // optional onInit handler function - higher order state management, etc
      if (this.props.onInit) {
        this.props.onInit();
      }
    });
  }
}

export default GisidaWrapper;
