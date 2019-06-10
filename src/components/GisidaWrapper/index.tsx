import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import * as React from 'react';
import Loading from '../../components/page/Loading/index';
import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN } from '../../configs/env';
import { circleLayerConfig, fillLayerConfig, pointLayerConfig } from '../../configs/settings';
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
  hasGeometries: boolean | false;
  tasks: Task;
  initMapWithoutTasks: boolean | false;
  renderTasks: boolean | false;
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
      hasGeometries: false,
      initMapWithoutTasks: false,
      locations: this.props.locations || false,
      renderTasks: false,
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

    if (!(nextProps.tasks && nextProps.tasks.length) && !this.state.initMapWithoutTasks) {
      this.setState({ doInitMap: true, initMapWithoutTasks: true }, () => {
        // Dirty work around! Arbitrary delay to allow style load before adding layers
        setTimeout(() => {
          this.initMap(null);
        }, 3000);
      });
    }
  }

  public componentWillUpdate(nextProps: FlexObject) {
    if (
      nextProps.tasks &&
      nextProps.tasks.length &&
      (nextProps.currentGoal !== this.props.currentGoal &&
        (this.state.locations || this.state.doInitMap))
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
      return <Loading />;
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
    /*sample interface for layerObjs currently not working */

    interface LineLayerObj {
      id: string;
      paint: {
        'line-color': string;
        'line-opacity': number;
        'line-width': number;
      };
      source: {
        data: {
          data: string;
          type: string;
        };
        type: string;
      };
      type: string;
      visible: boolean;
    }

    interface PointLayerObj {
      id: string;
      layout: {
        'icon-image': string;
        'icon-size': number;
      };
      minzoom: number;
      paint: {
        'text-color': string;
        'text-halo-blur': number;
        'text-halo-color': string;
        'text-halo-width': number;
      };
      source: {
        data: {
          data: string;
          type: string;
        };
        minzoom: number;
        type: string;
      };
      type: string;
      visible: boolean;
    }

    interface FillLayerObj {
      id: string;
      paint: {
        'fill-color': string;
        'fill-opacity': number;
        'fill-outline-color': string;
      };
      source: {
        data: {
          data: string;
          type: string;
        };
        type: string;
      };
      type: string;
      visible: boolean;
    }
    const symbolLayers: PointLayerObj[] | LineLayerObj[] | FillLayerObj[] | FlexObject = [];
    if (tasks) {
      // Dirty Hack filter out null geoms
      tasks = tasks.filter((d: Task) => {
        return d.geojson.geometry !== null;
      });
      if (tasks.length > 0) {
        let featureColl = {};
        // pop off null geoms
        let polygons: Task[] = [];
        let points: Task[] = [];
        tasks = tasks.filter((d: Task) => d.geojson.geometry !== null);

        // handle layers types
        polygons = tasks.filter(
          (d: FlexObject) =>
            (d.geojson.geometry && d.geojson.geometry.type === 'Polygon') ||
            d.geojson.geometry.type === 'MultiPolygon'
        );
        points = tasks.filter(
          (d: Task) => d.geojson.geometry && d.geojson.geometry.type === 'Point'
        );

        if (points.length) {
          featureColl = {
            features: points.map((d: FlexObject) => {
              const propsObj = {
                ...(d.geojson && d.geojson.properties),
              };
              return {
                geometry: {
                  ...d.geojson.geometry,
                },
                properties: propsObj,
                type: 'Feature',
              };
            }),
            type: 'FeatureCollection',
          };
          symbolLayers.push({
            ...circleLayerConfig,
            id: `single-jurisdiction-${this.props.currentGoal}`,
            source: {
              ...circleLayerConfig.source,
              data: {
                ...circleLayerConfig.source.data,
                data: JSON.stringify(featureColl),
              },
            },
          });
        }
        if (polygons.length) {
          polygons.forEach((p: Task) => {
            let fillLayer: FillLayerObj | null = null;
            fillLayer = {
              ...fillLayerConfig,
              id: `single-jurisdiction-${p.goal_id}-${p.task_identifier}`,
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
        this.setState({
          hasGeometries: true,
        });
      } else {
        this.setState({
          hasGeometries: false,
        });
        alert('Tasks have no Geometries');
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
    const layers: LineLayerObj[] | FillLayerObj[] | PointLayerObj[] | FlexObject = [
      {
        id: `main-plan-layer-${geoData.jurisdiction_id}`,
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
      symbolLayers.forEach((value: LineLayerObj | FillLayerObj | PointLayerObj) => {
        layers.push(value);
      });
    }
    // 3b. Build the site-config object for Gisida
    const config = ConfigStore(
      {
        appName: locations && locations.properties && locations.properties.jurisdiction_name,
        bounds,
        layers,
      },
      GISIDA_MAPBOX_TOKEN,
      GISIDA_ONADATA_API_TOKEN,
      LayerStore
    );

    this.setState({ doRenderMap: true }, () => {
      // 4. Initialize Gisida stores

      let layer;
      const currentState = store.getState();
      const activeIds: string[] = [];
      store.dispatch(Actions.initApp(config.APP));
      /** Make all selected tasks visible by changing the visible flag to true */
      const visibleLayers = config.LAYERS.map((l: FlexObject) => {
        layer = {
          ...l,
          id: l.id,
          visible: true,
        };
        return layer;
      });

      // const activeLayer = (Object.keys(currentState[MAP_ID].layers).length > 1) ? config.LAYERS : visibleLayers;
      // load visible layers to store
      // if (global.maps[0].is)
      loadLayers(MAP_ID, store.dispatch, visibleLayers);

      // handles layers with geometries
      if (this.state.hasGeometries && Object.keys(currentState[MAP_ID].layers).length > 1) {
        const allLayers = Object.keys(currentState[MAP_ID].layers);
        let eachLayer: string;
        for (eachLayer of allLayers) {
          layer = currentState[MAP_ID].layers[eachLayer];
          /** Filter out the main plan layer and the current selected goal tasks
           *  so we toggle off previously selected layers in the store
           */
          if (
            layer.visible &&
            !layer.id.includes(this.props.currentGoal) &&
            !layer.id.includes('main-plan-layer')
          ) {
            store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, false));
          }
        }
      } else if (!this.state.hasGeometries && Object.keys(currentState[MAP_ID].layers).length > 1) {
        Object.keys(currentState[MAP_ID].layers).forEach((l: string) => {
          layer = currentState[MAP_ID].layers[l];
          if (layer.visible && !layer.id.includes('main-plan-layer')) {
            activeIds.push(layer.id);
          }
        });
        if (activeIds.length) {
          activeIds.forEach((a: string) => {
            store.dispatch(Actions.toggleLayer(MAP_ID, a, false));
          });
        }
      }
      // console.log(
      //   'tasks',
      //   this.props.tasks,
      //   'plan id',
      //   this.props.goal && this.props.goal.plan_id,
      //   'layers??',
      //   currentState[MAP_ID].layers
      // );
      // optional onInit handler function - higher order state management, etc
      // if (store.getState()['map-1']) {
      //   debugger;
      // }
      if (this.props.onInit) {
        this.props.onInit();
      }
    });
  }
}

// const mapStateToProps = (state: FlexObject) => {
//   // pass in the plan id to get plan the get the jurisdicytion_id from the plan
//   let checkRender = null;
//   if (state && state['map-1'] && state['map-1']) {
//     checkRender = state['map-1'].isRendered;
//   }
//   console.log('check if map Render===============>', checkRender);
//   return {
//     checkRender,
//   };
// };
// const ConnectedGisidaWrapper = connect(mapStateToProps)(GisidaWrapper);
export default GisidaWrapper;
