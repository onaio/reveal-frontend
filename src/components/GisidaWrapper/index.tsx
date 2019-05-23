import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';
import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN } from '../../configs/env';
import { MAP_ID, STRINGIFIED_GEOJSON } from '../../constants';
import { ConfigStore, FlexObject } from '../../helpers/utils';
import store from '../../store';
import { Jurisdiction } from '../../store/ducks/jurisdictions';
import './gisida.css';

interface GisidaState {
  bounds: number[];
  locations: FlexObject | false;
  doInitMap: boolean;
  doRenderMap: boolean;
  geoData: Jurisdiction;
}

/** Returns a single layer configuration */
const LayerStore = (layer: FlexObject) => {
  if (typeof layer === 'string') {
    return layer;
  }
  return layer;
  // todo - dynamically build layer configs based on layerObj params and layer type defaults
};

class GisidaWrapper extends React.Component<FlexObject, GisidaState> {
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
    if (!initialState[MAP_ID] && ducks.MAP) {
      reducerRegistry.register(MAP_ID, ducks.MAP.default);
    }
  }

  public componentDidMount() {
    if (!this.state.locations) {
      this.setState(() => {
        this.getLocations(this.props.geoData);
      });
    }
  }

  public componentWillReceiveProps(nextProps: FlexObject) {
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
    const mapId = this.props.mapId || MAP_ID;
    const doRenderMap = this.state.doRenderMap && typeof currentState[mapId] !== 'undefined';
    if (!doRenderMap) {
      return null;
    }

    return <Map mapId={mapId} store={store} handlers={this.props.handlers} />;
  }

  // 2. Get relevant goejson locations
  private async getLocations(geoData: Jurisdiction | null) {
    // 2a. Asynchronously obtain geometries as geojson object
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
    const { geoData } = this.props;
    const { locations, bounds } = this.state;
    if (!locations) {
      return false;
    }
    /* commented below dynamic layer building */
    // 3b. Define layers for config
    // todo - dynamically create the layers we need

    // 3c. Start with the default/first layer
    // const jurisdictionLayer = singleJurisdictionLayerConfig;
    // const jurisdictionLayerId = `single-jurisdiction-${geoData.jurisdiction_id}`;
    // const jurisdictionLayer_source_data = locations && JSON.stringify(locations);
    // console.log(geoData && geoData.jurisdiction_id);
    // export const layerBuilder = (
    //   jurisdictionLayer: FlexObject,
    //   paint: FlexObject | null,
    //   jurisdictionLayerId: string | null,
    //   jurisdictionLayer_source_data: FlexObject | null,
    // ) => {
    //   let allLayers = [];
    //   jurisdictionLayer.id = jurisdictionLayerId ? `single-jurisdiction-${jurisdictionLayerId}` : jurisdictionLayer.id;
    //   jurisdictionLayer.paint = paint ? jurisdictionLayer.paint = paint : jurisdictionLayer.paint;
    //   jurisdictionLayer.source.data

    // };
    const layers = [
      {
        id: `single-jurisdiction-${geoData.jurisdiction_id}`,
        paint: {
          'line-color': '#FFDC00',
          'line-opacity': 1,
          'line-width': 3,
        },
        source: {
          data: {
            data: JSON.stringify(locations),
            type: STRINGIFIED_GEOJSON,
          },
          type: 'geojson',
        },
        type: 'line',
        visible: true,
      },
    ];
    // 3b. Build the site-config object for Gisida
    const config = ConfigStore(
      {
        appName: locations,
        bounds,
        layers,
      },
      GISIDA_MAPBOX_TOKEN,
      GISIDA_ONADATA_API_TOKEN,
      LayerStore
    );

    this.setState({ doRenderMap: true }, () => {
      // 4. Initialize Gisida stores
      store.dispatch(Actions.initApp(config.APP));
      loadLayers(MAP_ID, store.dispatch, config.LAYERS);

      // optional onInit handler function - higher order state management, etc
      if (this.props.onInit) {
        this.props.onInit();
      }
    });
  }
}

export default GisidaWrapper;
