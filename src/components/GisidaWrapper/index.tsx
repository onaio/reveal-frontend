import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import { FillPaint, LinePaint, SymbolPaint } from 'mapbox-gl';
import * as React from 'react';
import Loading from '../../components/page/Loading/index';
import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN } from '../../configs/env';
import { circleLayerConfig, fillLayerConfig } from '../../configs/settings';
import {
  APP,
  DEFAULT_LAYER_LINE_OPACITY,
  DEFAULT_LAYER_LINE_WIDTH,
  DEFAULT_LINE_TYPE,
  FEATURE,
  FEATURE_COLLECTION,
  GEOJSON,
  MAIN_PLAN,
  MAP_ID,
  MULTI_POLYGON,
  NO_GEOMETRIES_RESPONSE,
  POINT,
  POLYGON,
  STRINGIFIED_GEOJSON,
} from '../../constants';
import { ConfigStore, FlexObject } from '../../helpers/utils';
import store from '../../store';
import { Goal } from '../../store/ducks/goals';
import { Jurisdiction, JurisdictionGeoJSON } from '../../store/ducks/jurisdictions';
import { Task } from '../../store/ducks/tasks';
import { jurisdictions } from '../../store/ducks/tests/fixtures';
import './gisida.css';

/** handlers Interface */
interface Handlers {
  name: string;
  type: string;
  method: (e: any) => void;
}
/** Layer Interfaces Types don't leverage typescript full potential */
/** LineLayerObj Interface  */
interface LineLayerObj {
  id: string;
  paint: LinePaint;
  source: {
    data: {
      data: string;
      type: string;
    };
    type: string;
  };
  type: 'line';
  visible: boolean;
}
/** PointLayerObj Interface  */
interface PointLayerObj {
  id: string;
  layout: {
    'icon-image': string;
    'icon-size': number;
  };
  minzoom: number;
  paint: SymbolPaint;
  source: {
    data: {
      data: string;
      type: string;
    };
    minzoom: number;
    type: string;
  };
  type: 'symbol';
  visible: boolean;
}
/** FillLayerObj Interface */
interface FillLayerObj {
  id: string;
  paint: FillPaint;
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

/** GisidaWrapper state interface */
interface GisidaState {
  bounds: number[];
  locations: JurisdictionGeoJSON | false;
  doInitMap: boolean;
  doRenderMap: boolean;
  geoData: Jurisdiction;
  hasGeometries: boolean | false;
  tasks: Task[] | null;
  initMapWithoutTasks: boolean | false;
  renderTasks: boolean | false;
}
/** GisidaWrapper Props Interface */
interface GisidaProps {
  currentGoal?: string | null;
  geoData: Jurisdiction;
  goal?: Goal[] | null;
  handlers: Handlers[];
  tasks: Task[] | null;
  minHeight?: string;
}

/** Returns a single layer configuration */
const LayerStore = (layer: FlexObject) => {
  if (typeof layer === 'string') {
    return layer;
  }
  return layer;
};
/** default props for ActiveFI Map component */
export const defaultGisidaProps: GisidaProps = {
  currentGoal: null,
  geoData: jurisdictions[0],
  goal: null,
  handlers: [],
  tasks: null,
};
class GisidaWrapper extends React.Component<GisidaProps, GisidaState> {
  public static defaultProps = defaultGisidaProps;
  constructor(props: GisidaProps) {
    super(props);
    const initialState = store.getState();
    this.state = {
      bounds: [],
      doInitMap: false,
      doRenderMap: false,
      geoData: this.props.geoData || false,
      hasGeometries: false,
      initMapWithoutTasks: false,
      locations: false,
      renderTasks: false,
      tasks: this.props.tasks || null,
    };

    // 1. Register mapReducers in reducer registery;
    if (!initialState.APP && ducks.APP) {
      reducerRegistry.register(APP, ducks.APP.default);
    }
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

  public componentWillReceiveProps(nextProps: GisidaProps) {
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

    if (
      (!(nextProps.tasks && nextProps.tasks.length) && !this.state.initMapWithoutTasks) ||
      typeof nextProps.tasks === 'undefined'
    ) {
      this.setState({ doInitMap: true, initMapWithoutTasks: true }, () => {
        // Dirty work around! Arbitrary delay to allow style load before adding layers
        setTimeout(() => {
          this.initMap(null);
        }, 3000);
      });
    }
  }

  public componentWillUpdate(nextProps: GisidaProps) {
    if (
      (nextProps.tasks &&
        nextProps.tasks.length &&
        (nextProps.currentGoal !== this.props.currentGoal &&
          (this.state.locations || this.state.doInitMap))) ||
      typeof nextProps.currentGoal === 'undefined'
    ) {
      this.setState({ doInitMap: false, initMapWithoutTasks: false }, () => {
        this.initMap(nextProps.tasks);
      });
    }
  }

  public render() {
    const { minHeight } = this.props || '80vh';
    const currentState = store.getState();
    const mapId = MAP_ID;
    const doRenderMap = this.state.doRenderMap && typeof currentState[mapId] !== 'undefined';
    if (!doRenderMap) {
      return <Loading minHeight={minHeight} />;
    }
    return <Map mapId={mapId} store={store} handlers={this.props.handlers} />;
  }

  // Get relevant goejson locations
  private async getLocations(geoData: Jurisdiction | null) {
    // Determine map bounds from locations geoms
    let locations: JurisdictionGeoJSON | false = false;
    if (geoData && geoData.geojson && geoData.geojson.geometry) {
      locations = geoData.geojson;
    }
    if (locations) {
      const bounds = GeojsonExtent(locations);
      this.setState({ locations, doInitMap: true, bounds });
    }
  }

  // Define map site-config object to init the store
  private initMap(tasks: Task[] | null) {
    // filter out tasks with null geoms
    tasks = tasks && tasks.filter((task: Task) => task.geojson.geometry !== null);
    if (tasks && tasks.length > 0) {
      const points: Task[] = [];
      // handle geometries of type polygon or multipolygon
      tasks.forEach((element: Task) => {
        if (
          (element.geojson.geometry && element.geojson.geometry.type === POLYGON) ||
          (element.geojson &&
            element.geojson.geometry &&
            element.geojson.geometry.type === MULTI_POLYGON)
        ) {
          let fillLayer: FillLayerObj | null = null;
          fillLayer = {
            ...fillLayerConfig,
            id: `${element.goal_id}-${element.task_identifier}`,
            source: {
              ...fillLayerConfig.source,
              data: {
                ...fillLayerConfig.source.data,
                data: JSON.stringify(element.geojson),
              },
            },
          };
          symbolLayers.push(fillLayer);
        }
        if (element.geojson.geometry && element.geojson.geometry.type === POINT) {
          // push type point tasks to points list
          points.push(element);
        }
      });

      if (points.length > 0) {
        // build a feature collection for points
        let featureColl = {};
        featureColl = {
          features: points.map((point: Task) => {
            const propsObj = {
              ...(point.geojson && point.geojson.properties),
            };
            return {
              geometry: {
                ...point.geojson.geometry,
              },
              properties: propsObj,
              type: FEATURE,
            };
          }),
          type: FEATURE_COLLECTION,
        };
        symbolLayers.push({
          ...circleLayerConfig,
          id: this.props.currentGoal,
          paint: {
            ...circleLayerConfig.paint,
            'circle-color': ['get', 'color'],
          },
          source: {
            ...circleLayerConfig.source,
            data: {
              ...circleLayerConfig.source.data,
              data: JSON.stringify(featureColl),
            },
          },
        });

        this.setState({
          hasGeometries: true,
        });
      }
    } else if (tasks && !(tasks.length > 0)) {
      alert(NO_GEOMETRIES_RESPONSE);
      this.setState({
        hasGeometries: false,
      });
    }
    const { geoData } = this.props;
    const { locations, bounds } = this.state;
    if (!locations) {
      return false;
    }
    const layers: LineLayerObj[] | FillLayerObj[] | PointLayerObj[] | FlexObject = [
      {
        id: `${MAIN_PLAN}-${geoData.jurisdiction_id}`,
        paint: {
          'line-color': '#FFDC00',
          'line-opacity': DEFAULT_LAYER_LINE_OPACITY,
          'line-width': DEFAULT_LAYER_LINE_WIDTH,
        },
        source: {
          data: {
            data: JSON.stringify(locations),
            type: STRINGIFIED_GEOJSON,
          },
          type: GEOJSON,
        },
        type: DEFAULT_LINE_TYPE,
        visible: true,
      },
    ];
    if (symbolLayers.length) {
      symbolLayers.forEach((value: LineLayerObj | FillLayerObj | PointLayerObj) => {
        layers.push(value);
      });
    }
    // Build the site-config object for Gisida
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
      // Initialize Gisida stores
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

      // load visible layers to store
      loadLayers(MAP_ID, store.dispatch, visibleLayers);

      // handles tasks with geometries
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
            !layer.id.includes(MAIN_PLAN)
          ) {
            store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, false));
          }
        }
        // handle tasks with no geometries
      } else if (!this.state.hasGeometries && Object.keys(currentState[MAP_ID].layers).length > 1) {
        Object.keys(currentState[MAP_ID].layers).forEach((l: string) => {
          layer = currentState[MAP_ID].layers[l];
          if (layer.visible && !layer.id.includes(MAIN_PLAN)) {
            activeIds.push(layer.id);
          }
        });
        if (activeIds.length) {
          activeIds.forEach((a: string) => {
            store.dispatch(Actions.toggleLayer(MAP_ID, a, false));
          });
        }
      }
    });
  }
}
export default GisidaWrapper;
