import GeojsonExtent from '@mapbox/geojson-extent';
import { Dictionary } from '@onaio/utils';
import { GREY } from '../../../../../colors';
import { GisidaProps } from '../../../../../components/GisidaWrapper';
import {
  circleLayerConfig,
  fillLayerConfig,
  lineLayerConfig,
  symbolLayerConfig,
} from '../../../../../configs/settings';
import {
  CASE_CONFIRMATION_GOAL_ID,
  GOAL_CONFIRMATION_GOAL_ID,
  LARVAL_DIPPING_ID,
  MAIN_PLAN,
  MOSQUITO_COLLECTION_ID,
  STRUCTURE_LAYER,
} from '../../../../../constants';
import { FeatureCollection } from '../../../../../helpers/utils';
import { Jurisdiction } from '../../../../../store/ducks/jurisdictions';
import { StructureGeoJSON } from '../../../../../store/ducks/structures';
import { TaskGeoJSON } from '../../../../../store/ducks/tasks';

/** FILayers - represents layers to be rendered on the FI Map */
export interface FILayers {
  features: FeatureCollection<TaskGeoJSON>;
  id: string;
  layerType: string;
  visible: boolean;
}

/** Get Gisida Wrapper Props
 * @param {Jurisdiction} jurisdiction - the jurisdiction (with geojson field)
 * @param {structures} FeatureCollection<StructureGeoJSON> - represents pre-loaded structures i.e. not added by a user
 */
export const getGisidaWrapperProps = (
  jurisdiction: Jurisdiction,
  structures: FeatureCollection<StructureGeoJSON> | null = null,
  fiLayers: FILayers[] = [],
  currentGoalId: string
): GisidaProps | null => {
  if (!jurisdiction.geojson) {
    return null;
  }
  const layers: Dictionary[] = [];

  // define line layer for Jurisdiction outline
  const jurisdictionLineLayer = {
    ...lineLayerConfig,
    id: `${MAIN_PLAN}-${jurisdiction.jurisdiction_id}`,
    source: {
      ...lineLayerConfig.source,
      data: {
        ...lineLayerConfig.source.data,
        data: JSON.stringify(jurisdiction.geojson),
      },
    },
    visible: true,
  };
  layers.push(jurisdictionLineLayer);

  // define the layer for the pre-loaded structures
  // these need both a fill and a line layer
  const structuresFillLayer = {
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
  const structuresLineLayer = {
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
  };
  layers.push(structuresFillLayer);
  layers.push(structuresLineLayer);

  let iconGoal: string = 'case-confirmation';
  switch (currentGoalId) {
    case MOSQUITO_COLLECTION_ID:
      iconGoal = 'mosquito';
      break;
    case LARVAL_DIPPING_ID:
      iconGoal = 'larval';
      break;
  }

  const goalsWithSymbols = [MOSQUITO_COLLECTION_ID, LARVAL_DIPPING_ID, CASE_CONFIRMATION_GOAL_ID];

  // deal with FI Layers
  fiLayers.forEach(element => {
    const elementIsIndexCase = element.id.includes('index-cases');
    const isGoalWithSymbol = goalsWithSymbols.includes(currentGoalId);
    if (element.layerType === 'symbol' && (isGoalWithSymbol || elementIsIndexCase)) {
      const thisLayer = {
        ...symbolLayerConfig,
        id: element.id,
        layout: {
          'icon-image': iconGoal,
          'icon-size': currentGoalId === GOAL_CONFIRMATION_GOAL_ID ? 0.045 : 0.03,
        },
        source: {
          ...symbolLayerConfig.source,
          data: {
            data: JSON.stringify(element.features),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        visible: element.visible,
      };
      layers.push(thisLayer);
    }

    if (element.layerType === 'circle') {
      const thisLayer = {
        ...circleLayerConfig,
        filter: ['==', '$type', 'Point'],
        id: element.id,
        paint: element.id.includes('historical-index-cases')
          ? {
              ...circleLayerConfig.paint,
              'circle-color': '#ff0000',
              // 'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15.75, 2.5, 20.8, 50],
              'circle-stroke-color': '#ff0000',
              'circle-stroke-opacity': 1,
            }
          : {
              ...circleLayerConfig.paint,
              'circle-color': ['get', 'color'],
              'circle-stroke-color': ['get', 'color'],
              'circle-stroke-opacity': 1,
            },
        source: {
          ...circleLayerConfig.source,
          data: {
            data: JSON.stringify(element.features),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        visible: element.visible,
      };
      layers.push(thisLayer);
    }

    // fill layer
    if (element.layerType === 'fill') {
      const fillLayer = {
        ...fillLayerConfig,
        filter: ['==', '$type', 'Polygon'],
        id: `${element.id}-fill`,
        paint: {
          ...fillLayerConfig.paint,
          'fill-color': ['get', 'color'],
          'fill-outline-color': ['get', 'color'],
        },
        source: {
          ...fillLayerConfig.source,
          data: {
            data: JSON.stringify(element.features),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        visible: element.visible,
      };
      layers.push(fillLayer);
    }
    if (element.layerType === 'line') {
      const polygonLineLayer = {
        ...lineLayerConfig,
        filter: ['==', '$type', 'Polygon'],
        id: `${element.id}-fill-line`,
        paint: {
          'line-color': ['get', 'color'],
          'line-opacity': 1,
          'line-width': 2,
        },
        source: {
          ...lineLayerConfig.source,
          data: {
            data: JSON.stringify(element.features),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        visible: element.visible,
      };
      layers.push(polygonLineLayer);
    }
  });

  // GET BOUNDS
  // define feature collection of all geoms being rendered
  const featureCollection = { features: [jurisdiction.geojson], type: 'FeatureCollection' };
  // define bounds for gisida map position
  const bounds = GeojsonExtent(featureCollection);
  // GET BOUNDS

  const gisidaWrapperProps: GisidaProps = {
    bounds,
    currentGoal: null,
    geoData: null,
    goal: null,
    handlers: [],
    layers,
    pointFeatureCollection: null,
    polygonFeatureCollection: null,
    structures: null,
  };
  return gisidaWrapperProps;
};
