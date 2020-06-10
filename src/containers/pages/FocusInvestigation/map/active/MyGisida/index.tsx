import GeojsonExtent from '@mapbox/geojson-extent';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import { Actions, ducks, GisidaMap, loadLayers } from 'gisida';
import { Map } from 'gisida-react';
import { some } from 'lodash';
import { FillPaint, LinePaint, Map as mbMap, Style, SymbolPaint } from 'mapbox-gl';
import * as React from 'react';
import { GREY } from '../../../../../../colors';
import Loading from '../../../../../../components/page/Loading/index';
import {
  GISIDA_MAPBOX_TOKEN,
  GISIDA_ONADATA_API_TOKEN,
  GISIDA_TIMEOUT,
} from '../../../../../../configs/env';
import {
  circleLayerConfig,
  fillLayerConfig,
  lineLayerConfig,
  symbolLayerConfig,
} from '../../../../../../configs/settings';
import {
  APP,
  MAIN_PLAN,
  MAP_ID,
  MAPBOXGL_POPUP,
  STRUCTURE_LAYER,
} from '../../../../../../constants';
import { displayError } from '../../../../../../helpers/errors';
import { EventData } from '../../../../../../helpers/mapbox';
import { ConfigStore, FeatureCollection } from '../../../../../../helpers/utils';
import store from '../../../../../../store';
import { Goal, setCurrentGoal } from '../../../../../../store/ducks/goals';
import { Jurisdiction, JurisdictionGeoJSON } from '../../../../../../store/ducks/jurisdictions';
import { StructureGeoJSON } from '../../../../../../store/ducks/structures';
import { TaskGeoJSON } from '../../../../../../store/ducks/tasks';
// import './gisida.css';
import {
  PointLayerObj,
  LineLayerObj,
  FillLayerObj,
} from '../../../../../../components/GisidaWrapper';
import { selectorState } from '../../../../OrganizationViews/SingleOrganizationView/tests/fixtures';
import { currentGoal } from '../../../../../../store/ducks/tests/fixtures';

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
  const [renderMap, setRenderMap] = React.useState<boolean>(false);

  React.useEffect(() => {
    initMap(props.pointFeatureCollection, props.polygonFeatureCollection);
  }, []);

  const gz = React.useCallback(
    (config, layers) => {
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
            !layer.id.includes(props.currentGoal) &&
            !layer.id.includes(MAIN_PLAN) &&
            !layer.id.includes(STRUCTURE_LAYER)
          ) {
            store.dispatch(Actions.toggleLayer(MAP_ID, layer.id, false));
          }
        }
      }
    },
    [props.currentGoal]
  );

  const { minHeight } = props || '80vh';
  const nowState = store.getState();
  const mapId = MAP_ID;
  const doRenderMap = renderMap && typeof nowState[mapId] !== 'undefined';

  if (!doRenderMap) {
    return <Loading minHeight={minHeight} />;
  }
  return <Map mapId={mapId} store={store} handlers={props.handlers} />;

  function getLocations(geoData: Jurisdiction | null) {
    // Determine map bounds from locations geoms
    let locations: JurisdictionGeoJSON | false = false;
    let bounds: number[] = [];
    if (geoData && geoData.geojson && geoData.geojson.geometry) {
      locations = geoData.geojson;
    }
    if (locations) {
      bounds = GeojsonExtent(locations);
    }
    return { locations, bounds };
  }

  function initMap(
    pointFeatureCollection?: FeatureCollection<TaskGeoJSON> | null,
    polygonFeatureCollection?: FeatureCollection<TaskGeoJSON> | null
  ) {
    debugger;
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
    const { structures } = props;
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
        if (goal === props.currentGoal) {
          const iconGoal = props.currentGoal.includes('Mosquito_Collection')
            ? 'mosquito'
            : props.currentGoal.includes('Larval_Dipping')
            ? 'larval'
            : 'case-confirmation';
          builtGeometriesContainer.push({
            ...symbolLayerConfig,
            id: `${props.currentGoal}-symbol`,
            layout: {
              'icon-image': iconGoal,
              'icon-size': props.currentGoal.includes('Case_Confirmation') ? 0.045 : 0.03,
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
        id: `${props.currentGoal}-point`,
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
        if (goal === props.currentGoal) {
          const iconGoal = props.currentGoal.includes('Mosquito_Collection')
            ? 'mosquito'
            : props.currentGoal.includes('Larval_Dipping')
            ? 'larval'
            : 'case-confirmation';
          builtGeometriesContainer.push({
            ...symbolLayerConfig,
            id: `${props.currentGoal}-symbol`,
            layout: {
              'icon-image': iconGoal,
              'icon-size': props.currentGoal.includes('Case_Confirmation') ? 0.045 : 0.03,
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
          id: `${props.currentGoal}-fill`,
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
          id: `${props.currentGoal}-fill-line`,
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

    const { geoData, layers: Layers } = props;

    const { locations, bounds }: any = getLocations(geoData);

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

    setRenderMap(true);
    const config = ConfigStore(
      {
        appName:
          (locations && locations.properties && locations.properties.jurisdiction_name) ||
          'Reveal Map',
        bounds: bounds.length && bounds,
        boxZoom: !!!(props.handlers && props.handlers.length),
        layers,
        style: props.basemapStyle,
      },
      GISIDA_MAPBOX_TOKEN,
      GISIDA_ONADATA_API_TOKEN,
      LayerStore
    );
    // Build the site-config object for Gisida
    gz(config, layers)
  }

  
}
