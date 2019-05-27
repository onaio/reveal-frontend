import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';
import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN } from '../../configs/env';
import { fillLayerConfig, lineLayerConfig, pointLayerConfig } from '../../configs/settings';
import { MAP_ID, STRINGIFIED_GEOJSON } from '../../constants';
import { ConfigStore, FlexObject } from '../../helpers/utils';
import store from '../../store';
import { Jurisdiction, JurisdictionGeoJSON } from '../../store/ducks/jurisdictions';
import { Task } from '../../store/ducks/tasks';
import './gisida.css';

/** GisidaWrapper state interface */
interface GisidaState {
  bounds: number[];
  locations: JurisdictionGeoJSON | false;
  doInitMap: boolean;
  doRenderMap: boolean;
  geoData: Jurisdiction;
  tasks: Task;
  initMapWithoutTasks: boolean | false;
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
      initMapWithoutTasks: false,
      locations: this.props.locations || false,
      tasks: this.props.tasks || false,
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

  public componentWillMount() {
    if (!this.props.tasks) {
      this.setState({
        initMapWithoutTasks: true,
      });
    }
  }

  public componentDidMount() {
    if (!this.state.locations) {
      this.setState(
        {
          doInitMap: true,
          initMapWithoutTasks: false,
        },
        () => {
          this.getLocations(this.props.geoData);
        }
      );
    }
  }

  public componentWillReceiveProps(nextProps: FlexObject) {
    /** check for types */
    if (this.props.geoData !== nextProps.geoData && this.state.doRenderMap) {
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
    if (!nextProps.tasks && !this.state.initMapWithoutTasks) {
      this.setState({ doInitMap: true, initMapWithoutTasks: true }, () => {
        this.initMap(null);
      });
    }
  }

  public componentWillUpdate(nextProps: any, nextState: any) {
    if (
      this.state.locations &&
      this.state.doInitMap &&
      (nextProps.tasks && nextProps.tasks.length)
    ) {
      this.setState({ doInitMap: false, initMapWithoutTasks: false }, () => {
        this.initMap(nextProps.tasks);
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
    let locations: JurisdictionGeoJSON | false = false;
    if (geoData && geoData.geojson && geoData.geojson.geometry) {
      locations = geoData.geojson;
    }
    if (locations) {
      const bounds = GeojsonExtent(locations);
      this.setState({ locations, doInitMap: true, bounds });
    }
  }

  // 3. Define map site-config object to init the store
  private initMap(tasks: Task[] | null) {
    const symbolLayers: any[] = [];
    if (tasks) {
      let uniqueId = 0;
      // Dirty Hack filter out null geoms
      tasks = tasks.filter((d: Task) => {
        return d.geojson.geometry !== null;
      });
      if (tasks.length > 0) {
        // pop off null geoms
        let polygons: Task[] = [];
        let points: Task[] = [];
        tasks = tasks.filter((d: Task) => d.geojson.geometry !== null);

        // handle layers types
        polygons = tasks.filter(
          (d: Task) => d.geojson.geometry && d.geojson.geometry.type === 'Polygon'
        );
        points = tasks.filter(
          (d: Task) => d.geojson.geometry && d.geojson.geometry.type === 'Point'
        );

        if (points.length) {
          points.forEach((element: Task) => {
            let geoJSONLayer = null;
            if (element.geojson.geometry) {
              uniqueId++;
              geoJSONLayer = {
                ...pointLayerConfig,
                id: `single-jurisdiction-${uniqueId}`,
                source: {
                  ...pointLayerConfig.source,
                  data: {
                    ...pointLayerConfig.source.data,
                    data: JSON.stringify(element.geojson.geometry),
                  },
                },
              };
            }
            symbolLayers.push(geoJSONLayer);
          });
        }
        if (polygons.length) {
          polygons.forEach((p: Task) => {
            let fillLayer = null;
            uniqueId++;
            fillLayer = {
              ...fillLayerConfig,
              id: `single-jurisdiction-${uniqueId}`,
              source: {
                ...fillLayerConfig.source,
                data: {
                  ...fillLayerConfig.source.data,
                  data: JSON.stringify(p.geojson),
                },
              },
            };
            symbolLayers.push(fillLayer);
          });
        }
      }
    }
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

    if (symbolLayers.length) {
      symbolLayers.forEach(value => {
        layers.push(value);
      });
    }
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
