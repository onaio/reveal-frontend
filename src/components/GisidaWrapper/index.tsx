import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Actions, ducks, GisidaMap, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import { some } from 'lodash';
import { FillPaint, LinePaint, Map as mbMap, Style, SymbolPaint } from 'mapbox-gl';
import * as React from 'react';
import { GREY } from '../../colors';
import Loading from '../../components/page/Loading/index';
import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN } from '../../configs/env';
import {
  circleLayerConfig,
  fillLayerConfig,
  lineLayerConfig,
  structureFillColor,
} from '../../configs/settings';
import {
  APP,
  FEATURE_COLLECTION,
  MAIN_PLAN,
  MAP_ID,
  MULTI_POLYGON,
  NO_GEOMETRIES_RESPONSE,
  POINT,
  POLYGON,
} from '../../constants';
import { EventData } from '../../helpers/mapbox';
import { ConfigStore, FeatureCollection, FlexObject } from '../../helpers/utils';
import store from '../../store';
import { Goal } from '../../store/ducks/goals';
import { Jurisdiction, JurisdictionGeoJSON } from '../../store/ducks/jurisdictions';
import { Task, TaskGeoJSON } from '../../store/ducks/tasks';
import './gisida.css';

/** handlers Interface */
export interface Handlers {
  name: string;
  type: string;
  method: (e: EventData) => void;
}

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

/** GisidaWrapper state interface */
interface GisidaState {
  bounds: number[];
  locations: JurisdictionGeoJSON | false;
  doInitMap: boolean;
  doRenderMap: boolean;
  geoData: Jurisdiction | false;
  hasGeometries: boolean | false;
  featureCollection: FeatureCollection<TaskGeoJSON> | null;
  initMapWithoutFC: boolean | false;
}
/** GisidaWrapper Props Interface */
interface GisidaProps {
  currentGoal?: string | null;
  featureCollection: FeatureCollection<TaskGeoJSON> | null;
  geoData: Jurisdiction | null;
  goal?: Goal[] | null;
  handlers: Handlers[];
  structures: Task[] | null;
  minHeight?: string;
  basemapStyle?: string | Style;
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
  featureCollection: null,
  geoData: null,
  goal: null,
  handlers: [],
  structures: null,
};

/** Wrapper component for Gisida-powered maps */
class GisidaWrapper extends React.Component<GisidaProps, GisidaState> {
  public static defaultProps = defaultGisidaProps;
  constructor(props: GisidaProps) {
    super(props);
    const initialState = store.getState();
    this.state = {
      bounds: [],
      doInitMap: false,
      doRenderMap: false,
      featureCollection: this.props.featureCollection || null,
      geoData: this.props.geoData || false,
      hasGeometries: false,
      initMapWithoutFC: false,
      locations: false,
    };

    if (!initialState.APP && ducks.APP) {
      reducerRegistry.register(APP, ducks.APP.default);
    }
    if (!initialState[MAP_ID] && ducks.MAP) {
      reducerRegistry.register(MAP_ID, ducks.MAP.default);
    }
  }

  public componentWillMount() {
    const features: TaskGeoJSON[] =
      (this.props.featureCollection && this.props.featureCollection.features) || [];
    /** Init map without features if no features were proped in,
     * features.some will return true if features array has atleast one
     * object that evaluates to true
     */
    if (!some(features)) {
      this.setState({
        initMapWithoutFC: true,
      });
    }
  }

  public componentDidMount() {
    if (!this.state.locations) {
      this.setState(
        {
          doInitMap: true,
          initMapWithoutFC: false,
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
          geoData: nextProps.geoData || false,
          locations: false,
        },
        () => {
          this.getLocations(nextProps.geoData);
        }
      );
    }
    const features: TaskGeoJSON[] =
      (nextProps.featureCollection && nextProps.featureCollection.features) || [];
    /** If there are no features and init map without features is false
     * and location data is set
     */
    if (!some(features) && !this.state.initMapWithoutFC && this.state.locations) {
      this.setState({ doInitMap: true, initMapWithoutFC: true }, () => {
        // Dirty work around! Arbitrary delay to allow style load before adding layers
        setTimeout(() => {
          this.initMap(null);
        }, 3000);
      });
    }
  }

  public componentWillUpdate(nextProps: FlexObject) {
    const features: TaskGeoJSON[] =
      (nextProps.featureCollection && nextProps.featureCollection.features) || [];
    /** condition1: features are present, some features were passed in
     * condition2: currentGoal changed and either of locations or doInitMap is truthy
     * condition3: currentGoal changed to undefined
     * if condition1 and condition2 or condition3 execute
     */
    if (
      (some(features) &&
        (nextProps.currentGoal !== this.props.currentGoal &&
          (this.state.locations || this.state.doInitMap))) ||
      nextProps.currentGoal === 'undefined'
    ) {
      this.setState({ doInitMap: false, initMapWithoutFC: false }, () => {
        this.initMap(nextProps.featureCollection);
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
  private initMap(featureCollection: FeatureCollection<TaskGeoJSON> | null) {
    const builtGeometriesContainer:
      | PointLayerObj[]
      | LineLayerObj[]
      | FillLayerObj[]
      | FlexObject = [];
    const features: TaskGeoJSON[] = (featureCollection && featureCollection.features) || [];

    // deal with structures
    const { structures } = this.props;
    if (structures) {
      structures.forEach((element: Task) => {
        if (element.geojson.geometry && element.geojson.geometry.type === POLYGON) {
          const structureLayer: FillLayerObj = {
            ...fillLayerConfig,
            id: `structure-${element.task_identifier}`,
            paint: {
              ...fillLayerConfig.paint,
              'fill-color': GREY,
              'fill-outline-color': GREY,
            },
            source: {
              ...fillLayerConfig.source,
              data: {
                ...fillLayerConfig.source.data,
                data: JSON.stringify(element.geojson),
              },
            },
            visible: true,
          };
          builtGeometriesContainer.push(structureLayer);
        }
      });
    }

    if (some(features)) {
      const points: TaskGeoJSON[] = [];
      // handle geometries of type polygon or multipolygon
      features.forEach((feature: TaskGeoJSON) => {
        if (
          (feature.geometry && feature.geometry.type === POLYGON) ||
          (feature && feature.geometry && feature.geometry.type === MULTI_POLYGON)
        ) {
          let fillLayer: FillLayerObj | null = null;
          fillLayer = {
            ...fillLayerConfig,
            id: `${feature.properties.goal_id}-${feature.id}`,
            paint: {
              ...fillLayerConfig.paint,
              'fill-color': ['get', 'color'],
              'fill-outline-color': ['get', 'color'],
            },
            source: {
              ...fillLayerConfig.source,
              data: {
                ...fillLayerConfig.source.data,
                data: JSON.stringify(feature),
              },
            },
          };
          builtGeometriesContainer.push(fillLayer);
        }
        if (feature.geometry && feature.geometry.type === POINT) {
          // push type point tasks to points list
          points.push(feature);
        }
      });

      if (points.length > 0) {
        // build a feature collection for points
        const pointsFeatureCollection = {
          features: points,
          type: FEATURE_COLLECTION,
        };
        builtGeometriesContainer.push({
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
              data: JSON.stringify(pointsFeatureCollection),
            },
          },
        });

        this.setState({
          hasGeometries: true,
        });
      }
    } // else if featureCollection prop was given but with empty features array
    else if (featureCollection && !some(features)) {
      alert(NO_GEOMETRIES_RESPONSE);
      this.setState({
        hasGeometries: false,
      });
    }

    const { geoData } = this.props;
    const { locations, bounds } = this.state;
    if (!locations || !geoData) {
      return false;
    }
    const layers: LineLayerObj[] | FillLayerObj[] | PointLayerObj[] | FlexObject = [
      {
        ...lineLayerConfig,
        id: `${MAIN_PLAN}-${geoData.jurisdiction_id}`,
        source: {
          ...lineLayerConfig.source,
          data: {
            ...lineLayerConfig.source.data,
            data: JSON.stringify(locations),
          },
        },
        visible: true,
      },
    ];
    if (builtGeometriesContainer.length) {
      builtGeometriesContainer.forEach((value: LineLayerObj | FillLayerObj | PointLayerObj) => {
        layers.push(value);
      });
    }
    // Build the site-config object for Gisida
    const config = ConfigStore(
      {
        appName: locations && locations.properties && locations.properties.jurisdiction_name,
        bounds,
        layers,
        style: this.props.basemapStyle,
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
      const styleLoadIntervalTimeout = new Date().getTime() + 10000;
      // wait for map to finish loading, then load layers
      const styleLoadInterval = window.setInterval(() => {
        if (
          window.maps &&
          window.maps.find((e: mbMap) => (e as GisidaMap)._container.id === MAP_ID)
        ) {
          const map = window.maps.find((e: mbMap) => (e as GisidaMap)._container.id === MAP_ID);
          if (map && map.isStyleLoaded) {
            loadLayers(MAP_ID, store.dispatch, visibleLayers);
            window.clearInterval(styleLoadInterval);
          } else if (new Date().getTime() > styleLoadIntervalTimeout) {
            window.clearInterval(styleLoadInterval);
          }
        }
      }, 500);

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
