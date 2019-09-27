import { BLACK, GREY, TASK_GREEN, TASK_ORANGE, TASK_RED, TASK_YELLOW } from '../../../../colors';
import {
  circleLayerConfig,
  fillLayerConfig,
  irsReportingCongif,
  IrsReportingStructuresConfig,
  lineLayerConfig,
} from '../../../../configs/settings';
import { STRUCTURE_LAYER } from '../../../../constants';
import { FlexObject } from '../../../../helpers/utils';
import { StructureFeatureCollection } from '../../../../store/ducks/IRS/structures';

const indicatorStopsNA = [
  ['Complete', TASK_GREEN],
  ['Not Sprayed', TASK_RED],
  ['Partially Sprayed', TASK_ORANGE],
  ['Not Visited', TASK_YELLOW],
  ['Not Eligible', BLACK],
];

export const structuresLayerBuilder = (structures: StructureFeatureCollection) => {
  const structuresLayers: FlexObject[] = [];
  const layerType = structures.features[0].geometry && structures.features[0].geometry.type;
  const structuresPopup: FlexObject = {
    body: `<div>
          <p class="heading">{{structure_type}}</p>
          <p>Status: {{business_status}}</p>
        </div>`,
    join: ['jurisdiction_id', 'jurisdiction_id'],
  };

  const structureStatusColors = {
    default: GREY,
    property: 'business_status',
    stops: indicatorStopsNA,
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
