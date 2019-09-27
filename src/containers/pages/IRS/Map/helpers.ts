import GeojsonExtent from '@mapbox/geojson-extent';
import { BLACK, GREY, TASK_GREEN, TASK_ORANGE, TASK_RED, TASK_YELLOW } from '../../../../colors';
import { GisidaProps } from '../../../../components/GisidaWrapper';
import { circleLayerConfig, fillLayerConfig, lineLayerConfig } from '../../../../configs/settings';
import { MAIN_PLAN, STRUCTURE_LAYER } from '../../../../constants';
import { FlexObject } from '../../../../helpers/utils';
import { IRSJurisdiction } from '../../../../store/ducks/IRS/jurisdictions';
import { StructureFeatureCollection } from '../../../../store/ducks/IRS/structures';
import { Jurisdiction } from '../../../../store/ducks/jurisdictions';

/** Default indicator stops */
const defaultIndicatorStops = [
  ['Complete', TASK_GREEN],
  ['Not Sprayed', TASK_RED],
  ['Partially Sprayed', TASK_ORANGE],
  ['Not Visited', TASK_YELLOW],
  ['Not Eligible', BLACK],
];

/** Utility function to build structure layer
 * @param {StructureFeatureCollection} structures - Feature Collection of structures
 * @param {string[][]} indicatorStops - the indicator stops
 */
export const structuresLayerBuilder = (
  structures: StructureFeatureCollection,
  indicatorStops: string[][] = defaultIndicatorStops
) => {
  const structuresLayers: FlexObject[] = [];
  const layerType = structures.features[0].geometry && structures.features[0].geometry.type;
  const structuresPopup: FlexObject = {
    body: `<div>
          <p class="heading">{{structure_type}}</p>
          <p>Status: {{business_status}}</p>
        </div>`,
    join: ['structure_jurisdiction_id', 'structure_jurisdiction_id'],
  };

  const structureStatusColors = {
    default: GREY,
    property: 'business_status',
    stops: indicatorStops,
    type: 'categorical',
  };

  if (layerType === 'Point') {
    // build circle layers if structures are points
    const structureCircleLayer = {
      ...circleLayerConfig,
      id: `${STRUCTURE_LAYER}-circle`,
      paint: {
        ...circleLayerConfig.paint,
        'circle-color': structureStatusColors,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 2, 14, 4, 16, 8, 20, 12],
        'circle-stroke-color': structureStatusColors,
        'circle-stroke-opacity': 1,
      },
      popup: structuresPopup,
      source: {
        ...circleLayerConfig.source,
        data: {
          data: JSON.stringify(structures),
          type: 'stringified-geojson',
        },
        type: 'geojson',
      },
      visible: true,
    };
    structuresLayers.push(structureCircleLayer);
  } else {
    // build fill / line layers if structures are polygons
    const structuresFillLayer = {
      ...fillLayerConfig,
      id: `${STRUCTURE_LAYER}-fill`,
      paint: {
        ...fillLayerConfig.paint,
        'fill-color': structureStatusColors,
        'fill-outline-color': structureStatusColors,
      },
      popup: structuresPopup,
      source: {
        ...fillLayerConfig.source,
        data: {
          ...fillLayerConfig.source.data,
          data: JSON.stringify(structures),
        },
      },
      visible: true,
    };
    structuresLayers.push(structuresFillLayer);

    const structuresLineLayer = {
      ...lineLayerConfig,
      id: `${STRUCTURE_LAYER}-line`,
      paint: {
        'line-color': structureStatusColors,
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
    structuresLayers.push(structuresLineLayer);
  }
  return structuresLayers;
};

/** Get Gisida Wrapper Props
 * @param {Jurisdiction} jurisdiction - the jurisdiction (with geojson field)
 * @param {StructureFeatureCollection} structures - Feature Collection of structures
 * @param {string[][]} indicatorStops - the indicator stops
 */
export const getGisidaWrapperProps = (
  jurisdiction: Jurisdiction,
  structures: StructureFeatureCollection | null,
  indicatorStops: string[][] = defaultIndicatorStops
): GisidaProps | null => {
  if (!jurisdiction.geojson) {
    return null;
  }
  const layers: FlexObject[] = [];

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

  // Define structures layers
  let structuresLayers: FlexObject[] = [];
  if (structures) {
    structuresLayers = structuresLayerBuilder(structures, indicatorStops);
  }

  // define feature collection of all geoms being rendered
  const featureCollection =
    !structures || !structures.features || !structures.features.length
      ? { features: [jurisdiction.geojson], type: 'FeatureCollection' }
      : {
          ...structures,
          features: [...structures.features, jurisdiction.geojson],
        };
  // define bounds for gisida map position
  const bounds = GeojsonExtent(featureCollection);

  for (const structureLayer of structuresLayers) {
    layers.push(structureLayer);
  }

  const gisidaWrapperProps: GisidaProps = {
    bounds,
    geoData: null,
    handlers: [],
    layers,
    pointFeatureCollection: null,
    polygonFeatureCollection: null,
    structures: null,
  };
  return gisidaWrapperProps;
};

/** Get breadcrumbs for a jurisdiction object
 * This uses the jurisdiction_name_path and jurisdiction_path fields to get
 * the breadcrumbs of the parents of a given jurisdiction object
 * @param {IRSJurisdiction} jurisdiction - the jurisdiction in question
 * @param {string} urlPath - the url path that we append the jurisdiction id to
 */
export const getJurisdictionBreadcrumbs = (
  jurisdiction: IRSJurisdiction,
  urlPath: string = '/'
) => {
  const result = [];

  for (let i = 0; i < jurisdiction.jurisdiction_name_path.length; i++) {
    let url = urlPath;
    if (jurisdiction.jurisdiction_path[i]) {
      url = `${urlPath}/${jurisdiction.jurisdiction_path[i]}`;
    }
    result.push({
      label: jurisdiction.jurisdiction_name_path[i],
      url,
    });
  }

  return result;
};
