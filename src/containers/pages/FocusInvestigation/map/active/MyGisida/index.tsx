import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import { Actions, ducks, GisidaMap, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import { Map as mbMap } from 'mapbox-gl';
import * as React from 'react';
// import './gisida.css';
import {
  FillLayerObj,
  LineLayerObj,
  PointLayerObj,
} from '../../../../../../components/GisidaWrapper';
import Loading from '../../../../../../components/page/Loading/index';
import { GISIDA_MAPBOX_TOKEN, GISIDA_ONADATA_API_TOKEN } from '../../../../../../configs/env';
import {
  APP,
  MAIN_PLAN,
  MAP_ID,
  RACD_REGISTER_FAMILY_ID,
  STRUCTURE_LAYER,
} from '../../../../../../constants';
import { ConfigStore } from '../../../../../../helpers/utils';
import store from '../../../../../../store';

/** Returns a single layer configuration */
// WHY ???
const LayerStore = (layer: Dictionary) => {
  if (typeof layer === 'string') {
    return layer;
  }
  return layer;
};

const initialState = store.getState();

if (!initialState.APP && ducks.APP) {
  reducerRegistry.register(APP, ducks.APP.default);
}
if (!initialState[MAP_ID] && ducks.MAP) {
  reducerRegistry.register(MAP_ID, ducks.MAP.default);
}

export function GWrapper(props: any) {
  // Define map site-config object to init the store
  console.log('GWrapper', props);
  const [renderMap, setRenderMap] = React.useState<boolean>(false);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    console.log('GWRAPPER, in effect', props);
    initMap();

    return () => {mounted.current = true}
  }, []);



  /** we let the component render as it does, only we add another useeffect
   * such that on the first render we save the layers and the current goal
   * on the second
   */
  /** special case on the default currentGoalId where the currentGoalId
   * does not change but the layers change.
   */

  // React.useEffect(() => {
  //   console.log('&&&&&&&&&&&&&&&&&&&&&&&');
  //   if (props.currentGoalId === RACD_REGISTER_FAMILY_ID) {
  //     initMap();
  //   }
  // }, [props.layers]);

  // React.useEffect(() => {
  //   const currentState = store.getState();
  //   if (Object.keys(currentState[MAP_ID].layers).length > 1) {
  //     const allLayers = Object.keys(currentState[MAP_ID].layers);
  //     let eachLayer: string;
  //     for (eachLayer of allLayers) {
  //       const layer = currentState[MAP_ID].layers[eachLayer];
  //       /** Filter out the main plan layer and the current selected goal tasks
  //        *  so we toggle off previously selected layers in the store
  //        */
  //       if (
  //         layer.visible &&
  //         !layer.id.includes(props.currentGoal) &&
  //         !layer.id.includes(MAIN_PLAN) &&
  //         !layer.id.includes(STRUCTURE_LAYER)
  //       ) {
  //         store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, false));
  //       }
  //     }
  //   }
  // }, [])

  const { minHeight } = props || '80vh';
  const nowState = store.getState();
  const mapId = MAP_ID;
  const doRenderMap = typeof nowState[mapId] !== 'undefined';

  if (!doRenderMap) {
    return <Loading minHeight={minHeight} />;
  }
  console.log('Going into render');
  
  return <Map mapId={mapId} store={store} handlers={props.handlers} />;


  function initMap() {
    const builtGeometriesContainer:
      | PointLayerObj[]
      | LineLayerObj[]
      | FillLayerObj[]
      | Dictionary = [];

    const { layers } = props;

    // setRenderMap(true);
    const config = ConfigStore(
      {
        appName:
          // (locations && locations.properties && locations.properties.jurisdiction_name) ||
          'Reveal Map',
        bounds: props.bounds.length && props.bounds,
        boxZoom: !!!(props.handlers && props.handlers.length),
        layers: [...layers],
        style: props.basemapStyle,
      },
      GISIDA_MAPBOX_TOKEN,
      GISIDA_ONADATA_API_TOKEN,
      LayerStore
    );
    // Build the site-config object for Gisida
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
        console.log('Starting interval', map);
        if (map && map.isStyleLoaded) {
          console.log('VisibleLayers', visibleLayers, props.layers);
          loadLayers(MAP_ID, store.dispatch, visibleLayers);
          window.clearInterval(styleLoadInterval);
        } else if (new Date().getTime() > styleLoadIntervalTimeout) {
          console.log('Map not loaded interval timed out');
          window.clearInterval(styleLoadInterval);
        }
      }
    }, 500);

    // toggle off layers that aren't structures, main plan and currentGoal layers

  //   if (Object.keys(currentState[MAP_ID].layers).length > 1) {
  //     const allLayers = Object.keys(currentState[MAP_ID].layers);
  //     let eachLayer: string;
  //     for (eachLayer of allLayers) {
  //       layer = currentState[MAP_ID].layers[eachLayer];
  //       /** Filter out the main plan layer and the current selected goal tasks
  //        *  so we toggle off previously selected layers in the store
  //        */
  //       if (
  //         layer.visible &&
  //         !layer.id.includes(props.currentGoal) &&
  //         !layer.id.includes(MAIN_PLAN) &&
  //         !layer.id.includes(STRUCTURE_LAYER)
  //       ) {
  //         store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, false));
  //       }
  //     }
  //   }
  }
}
