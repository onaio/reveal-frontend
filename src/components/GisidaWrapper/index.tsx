import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import { Actions, ducks, GisidaMap, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import { some } from 'lodash';
import { FillPaint, LinePaint, Map as mbMap, Style, SymbolPaint } from 'mapbox-gl';
import * as React from 'react';
import { GREY } from '../../colors';
import Loading from '../../components/page/Loading/index';
import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN, GISIDA_TIMEOUT } from '../../configs/env';
import {
  circleLayerConfig,
  fillLayerConfig,
  lineLayerConfig,
  symbolLayerConfig,
} from '../../configs/settings';
import { APP, MAIN_PLAN, MAP_ID, STRUCTURE_LAYER } from '../../constants';
import { displayError } from '../../helpers/errors';
import { EventData } from '../../helpers/mapbox';
import { ConfigStore, FeatureCollection } from '../../helpers/utils';
import store from '../../store';
import { Goal, setCurrentGoal } from '../../store/ducks/goals';
import { Jurisdiction, JurisdictionGeoJSON } from '../../store/ducks/jurisdictions';
import { StructureGeoJSON } from '../../store/ducks/structures';
import { TaskGeoJSON } from '../../store/ducks/tasks';
import './gisida.css';

/** handlers Interface */
export interface Handlers {
  layer?: string[];
  name: string;
  type: string;
  method: (e: EventData) => void;
}

/** LineLayerObj Interface  */
export interface LineLayerObj {
  id: string;
  paint: LinePaint;
  source: {
    data?: {
      data: string;
      type: string;
    };
    layer?: string;
    type: string;
    url?: string;
  };
  type: 'line';
  visible: boolean;
}
/** PointLayerObj Interface  */
export interface PointLayerObj {
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
export interface FillLayerObj {
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
  initMapWithoutFC: boolean | false;
  initMapWithStructures: boolean;
}
/** GisidaWrapper Props Interface */
export interface GisidaProps {
  bounds?: any[];
  currentGoal?: string | null;
  pointFeatureCollection: FeatureCollection<TaskGeoJSON> | null;
  polygonFeatureCollection: FeatureCollection<TaskGeoJSON> | null;
  geoData: Jurisdiction | null;
  goal?: Goal[] | null;
  handlers: Handlers[];
  layers?: LineLayerObj[] | FillLayerObj[] | PointLayerObj[] | Dictionary[];
  structures: FeatureCollection<StructureGeoJSON> | null;
  minHeight?: string;
  basemapStyle?: string | Style;
}

/** Returns a single layer configuration */
const LayerStore = (layer: Dictionary) => {
  if (typeof layer === 'string') {
    return layer;
  }
  return layer;
};

/** default props for ActiveFI Map component */
export const defaultGisidaProps: GisidaProps = {
  currentGoal: null,
  geoData: null,
  goal: null,
  handlers: [],
  pointFeatureCollection: null,
  polygonFeatureCollection: null,
  structures: null,
};

/** Wrapper component for Gisida-powered maps */
class GisidaWrapper extends React.Component<GisidaProps, GisidaState> {
  public static defaultProps = defaultGisidaProps;
  constructor(props: GisidaProps) {
    super(props);
    const initialState = store.getState();
    this.state = {
      bounds: this.props.bounds || [],
      doInitMap: false,
      doRenderMap: false,
      geoData: this.props.geoData || false,
      initMapWithStructures: false,
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
    const pointFeatures: TaskGeoJSON[] =
      (this.props.pointFeatureCollection && this.props.pointFeatureCollection.features) || [];
    const polygonFeatures: TaskGeoJSON[] =
      (this.props.polygonFeatureCollection && this.props.polygonFeatureCollection.features) || [];
    /** Init map without features if no features were proped in,
     * features.some will return true if features array has atleast one
     * object that evaluates to true
     */
    if (!some(pointFeatures) && !some(polygonFeatures)) {
      this.setState({
        initMapWithoutFC: true,
      });
    }
  }

  public componentDidMount() {
    const pointFeatures: TaskGeoJSON[] =
      (this.props.pointFeatureCollection && this.props.pointFeatureCollection.features) || [];
    const polygonFeatures: TaskGeoJSON[] =
      (this.props.polygonFeatureCollection && this.props.polygonFeatureCollection.features) || [];

    if (this.props.layers && this.props.layers.length) {
      this.setState(
        { doInitMap: true, initMapWithoutFC: true, initMapWithStructures: true },
        () => {
          // Dirty work around! Arbitrary delay to allow style load before adding layers
          setTimeout(() => {
            this.initMap(null, null);
          }, GISIDA_TIMEOUT);
        }
      );
    } else if (!this.state.locations) {
      this.setState(
        {
          doInitMap: true,
          initMapWithoutFC: false,
        },
        () => {
          this.getLocations(this.props.geoData).catch(error => displayError(error));
        }
      );
    }
    /** Handles Map without structures Render map with jurisdiction only  */
    if (
      (!some(pointFeatures) &&
        !some(polygonFeatures) &&
        !this.state.initMapWithoutFC &&
        this.state.locations) ||
      (this.props.goal === null && !(this.props.layers && this.props.layers.length))
    ) {
      this.setState(
        { doInitMap: true, initMapWithoutFC: true, initMapWithStructures: true },
        () => {
          // Dirty work around! Arbitrary delay to allow style load before adding layers
          setTimeout(() => {
            this.initMap(null, null);
          }, GISIDA_TIMEOUT);
        }
      );
    }
  }

  public componentWillReceiveProps(nextProps: GisidaProps) {
    if (
      JSON.stringify(this.props.geoData) !== JSON.stringify(nextProps.geoData) &&
      this.state.doRenderMap
    ) {
      this.setState(
        {
          doRenderMap: false,
          geoData: nextProps.geoData || false,
          locations: false,
        },
        () => {
          this.getLocations(nextProps.geoData).catch(error => displayError(error));
        }
      );
    }
    const pointFeatures: TaskGeoJSON[] =
      (this.props.pointFeatureCollection && this.props.pointFeatureCollection.features) || [];
    const polygonFeatures: TaskGeoJSON[] =
      (this.props.polygonFeatureCollection && this.props.polygonFeatureCollection.features) || [];
    /** If there are no pointFeatureCollection & polygonFeatureCollection and init map with structures is false
     * and location data is set
     * and this structures aren't equal to next structures
     * or currentGoals have changed and data
     */
    if (
      (!some(pointFeatures) &&
        !some(polygonFeatures) &&
        this.state.locations &&
        !this.state.initMapWithStructures &&
        this.props.structures !== nextProps.structures &&
        nextProps.structures &&
        nextProps.structures.features.length) ||
      (this.props.currentGoal !== nextProps.currentGoal &&
        !some(pointFeatures) &&
        !some(polygonFeatures))
    ) {
      this.setState(
        { doInitMap: true, initMapWithoutFC: true, initMapWithStructures: true },
        () => {
          // Dirty work around! Arbitrary delay to allow style load before adding layers
          setTimeout(() => {
            this.initMap(null, null);
          }, GISIDA_TIMEOUT);
        }
      );
    }
  }

  public componentWillUpdate(nextProps: Dictionary) {
    const pointFeatures: TaskGeoJSON[] =
      (this.props.pointFeatureCollection && this.props.pointFeatureCollection.features) || [];
    const polygonFeatures: TaskGeoJSON[] =
      (this.props.polygonFeatureCollection && this.props.polygonFeatureCollection.features) || [];
    /** condition1: features are present, point features or polygon features present
     * condition2: currentGoal changed and either of locations or doInitMap is truthy
     * if condition1 and condition2 execute
     */
    if (
      (some(pointFeatures) || some(polygonFeatures)) &&
      nextProps.currentGoal !== this.props.currentGoal &&
      (this.state.locations || this.state.doInitMap)
    ) {
      if (document.querySelectorAll('.mapboxgl-popup').length) {
        document.querySelectorAll('.mapboxgl-popup').forEach(el => el.remove());
      }
      this.setState({ doInitMap: false, initMapWithoutFC: false }, () => {
        this.initMap(
          pointFeatures.length ? nextProps.pointFeatureCollection : null,
          polygonFeatures.length ? nextProps.polygonFeatureCollection : null
        );
      });
    }
  }
  public componentWillUnmount() {
    store.dispatch(setCurrentGoal(null));
    const stateOnUnmount = store.getState();
    Object.keys(stateOnUnmount[MAP_ID].layers).forEach((layer: string) => {
      if (stateOnUnmount[MAP_ID].layers[layer].visible) {
        store.dispatch(Actions.toggleLayer(MAP_ID, stateOnUnmount[MAP_ID].layers[layer].id, false));
      }
    });
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
      this.setState({ locations, doInitMap: true, bounds, initMapWithoutFC: false });
    }
  }

  // Define map site-config object to init the store
  private initMap(
    pointFeatureCollection?: FeatureCollection<TaskGeoJSON> | null,
    polygonFeatureCollection?: FeatureCollection<TaskGeoJSON> | null
  ) {
    const builtGeometriesContainer:
      | PointLayerObj[]
      | LineLayerObj[]
      | FillLayerObj[]
      | Dictionary = [];

    /** Goals with icons array  */
    const goalsWithSymbols = [
      'Mosquito_Collection_Min_3_Traps',
      'Larval_Dipping_Min_3_Sites',
      'Case_Confirmation',
    ];
    /**  Deal with structures */
    const { structures } = this.props;
    if (structures) {
      const structureLayer: FillLayerObj = {
        ...fillLayerConfig,
        id: STRUCTURE_LAYER,
        paint: {
          ...fillLayerConfig.paint,
          'fill-color': GREY,
          'fill-outline-color': GREY,
        },
        source: {
          ...fillLayerConfig.source,
          data: {
            ...fillLayerConfig.source.data,
            data: JSON.stringify(structures),
          },
        },
        visible: true,
      };
      builtGeometriesContainer.push(structureLayer, {
        ...lineLayerConfig,
        id: `${STRUCTURE_LAYER}-line`,
        paint: {
          'line-color': GREY,
          'line-opacity': 1,
          'line-width': 2,
        },
        source: {
          ...lineLayerConfig.source,
          data: {
            ...lineLayerConfig.source.data,
            data: JSON.stringify(structures),
          },
        },
      });
    }
    // handle Point layer types
    if (pointFeatureCollection) {
      /** Build symbol layers to render on top of circle layers */
      goalsWithSymbols.forEach((goal: string) => {
        if (goal === this.props.currentGoal) {
          const iconGoal = this.props.currentGoal.includes('Mosquito_Collection')
            ? 'mosquito'
            : this.props.currentGoal.includes('Larval_Dipping')
            ? 'larval'
            : 'case-confirmation';
          builtGeometriesContainer.push({
            ...symbolLayerConfig,
            id: `${this.props.currentGoal}-symbol`,
            layout: {
              'icon-image': iconGoal,
              'icon-size': this.props.currentGoal.includes('Case_Confirmation') ? 0.045 : 0.03,
            },
            source: {
              ...symbolLayerConfig.source,
              data: {
                ...symbolLayerConfig.source.data,
                data: JSON.stringify(pointFeatureCollection),
              },
            },
          });
        }
      });
      builtGeometriesContainer.push({
        ...circleLayerConfig,
        id: `${this.props.currentGoal}-point`,
        paint: {
          ...circleLayerConfig.paint,
          'circle-color': ['get', 'color'],
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 1,
        },
        source: {
          ...circleLayerConfig.source,
          data: {
            ...circleLayerConfig.source.data,
            data: JSON.stringify(pointFeatureCollection),
          },
        },
      });
    }
    // Handle fill layers
    if (polygonFeatureCollection) {
      /** Build symbol layers to render on top of circle layers */
      goalsWithSymbols.forEach((goal: string) => {
        if (goal === this.props.currentGoal) {
          const iconGoal = this.props.currentGoal.includes('Mosquito_Collection')
            ? 'mosquito'
            : this.props.currentGoal.includes('Larval_Dipping')
            ? 'larval'
            : 'case-confirmation';
          builtGeometriesContainer.push({
            ...symbolLayerConfig,
            id: `${this.props.currentGoal}-symbol`,
            layout: {
              'icon-image': iconGoal,
              'icon-size': this.props.currentGoal.includes('Case_Confirmation') ? 0.045 : 0.03,
            },
            source: {
              ...symbolLayerConfig.source,
              data: {
                ...symbolLayerConfig.source.data,
                data: JSON.stringify(polygonFeatureCollection),
              },
            },
          });
        }
      });
      builtGeometriesContainer.push(
        {
          ...fillLayerConfig,
          id: `${this.props.currentGoal}-fill`,
          paint: {
            ...fillLayerConfig.paint,
            'fill-color': ['get', 'color'],
            'fill-outline-color': ['get', 'color'],
          },
          source: {
            ...fillLayerConfig.source,
            data: {
              ...fillLayerConfig.source.data,
              data: JSON.stringify(polygonFeatureCollection),
            },
          },
        },
        {
          ...lineLayerConfig,
          id: `${this.props.currentGoal}-fill-line`,
          paint: {
            'line-color': ['get', 'color'],
            'line-opacity': 1,
            'line-width': 2,
          },
          source: {
            ...lineLayerConfig.source,
            data: {
              ...lineLayerConfig.source.data,
              data: JSON.stringify(polygonFeatureCollection),
            },
          },
        }
      );
    }
    const { geoData, layers: Layers } = this.props;
    const { locations, bounds } = this.state;
    let layers: LineLayerObj[] | FillLayerObj[] | PointLayerObj[] | Dictionary = [];

    if (geoData) {
      layers = [
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
    } else if (Layers && Layers.length) {
      layers = [...Layers];
    } else {
      return false;
    }

    // Build the site-config object for Gisida
    const config = ConfigStore(
      {
        appName:
          (locations && locations.properties && locations.properties.jurisdiction_name) ||
          'Reveal Map',
        bounds: bounds.length && bounds,
        boxZoom: !!!(this.props.handlers && this.props.handlers.length),
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
      store.dispatch(Actions.initApp(config.APP));
      /** Make all selected tasks visible by changing the visible flag to true */
      const visibleLayers = config.LAYERS.map((l: Dictionary) => {
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

      // toggle off layers that aren't structures, main plan and currentGoal layers

      if (Object.keys(currentState[MAP_ID].layers).length > 1) {
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
            !layer.id.includes(MAIN_PLAN) &&
            !layer.id.includes(STRUCTURE_LAYER)
          ) {
            store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, false));
          }
        }
      }
    });
  }
}
export default GisidaWrapper;
