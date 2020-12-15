import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import { ZambiaKMZ421StructuresJSON } from '../../../../containers/pages/IRS/JurisdictionsReport/fixtures';
import { SMCStructures } from '../../../../containers/pages/SMC/Map/tests/fixtures';
import reducer, {
  addGenericStructure,
  fetchGenericStructures,
  GenericStructure,
  getGenericStructures,
  reducerName,
  removeGenericStructures,
} from '../structures';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

const structureData = superset.processData(fixtures.ZambiaStructures) || [];

describe('reducers/IRS/GenericStructure', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getGenericStructures(store.getState())).toEqual({
      features: [],
      type: 'FeatureCollection',
    });
  });

  it('Fetches generic structures correctly', () => {
    // action creators dispatch
    store.dispatch(fetchGenericStructures('zm-structures', structureData as GenericStructure[]));

    expect(getGenericStructures(store.getState())).toEqual({
      features: [],
      type: 'FeatureCollection',
    });

    // filtering

    // filter by jurisdiction id
    expect(
      getGenericStructures(
        store.getState(),
        'zm-structures',
        '1f1d3077-17c7-445b-acc1-670c009e60cc'
      )
    ).toEqual({ features: [structureData[11].geojson], type: 'FeatureCollection' });

    // filter by plan id
    expect(
      getGenericStructures(
        store.getState(),
        'zm-structures',
        null,
        'd24c4bb9-f45d-43b6-8322-7a5b00f00e59'
      )
    ).toEqual({ features: [structureData[11].geojson], type: 'FeatureCollection' });

    // filter by both plan and jurisdiction
    expect(
      getGenericStructures(
        store.getState(),
        'zm-structures',
        '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      )
    ).toEqual({
      features: [
        structureData[0].geojson,
        structureData[1].geojson,
        structureData[2].geojson,
        structureData[3].geojson,
        structureData[4].geojson,
        structureData[5].geojson,
        structureData[6].geojson,
        structureData[7].geojson,
        structureData[8].geojson,
        structureData[9].geojson,
        structureData[10].geojson,
      ],
      type: 'FeatureCollection',
    });

    // reset
    store.dispatch(removeGenericStructures('zm-structures'));
    expect(getGenericStructures(store.getState())).toEqual({
      features: [],
      type: 'FeatureCollection',
    });
  });

  it('Filters structures by structure type', () => {
    const kmz421StructureData = superset.processData(ZambiaKMZ421StructuresJSON) || [];
    store.dispatch(fetchGenericStructures('zm-kmz421-structures', kmz421StructureData));

    const structureType = ['Polygon'];

    expect(
      getGenericStructures(
        store.getState(),
        'zm-kmz421-structures',
        '92a0c5f3-8b47-465e-961b-2998ad3f00a5',
        'd40c1227-644b-55d6-b3f3-bed42380322f',
        structureType
      )
    ).toEqual({
      features: kmz421StructureData
        .filter(e => structureType.includes(e?.geojson?.geometry?.type))
        .map(e => e?.geojson),
      type: 'FeatureCollection',
    });

    // reset
    store.dispatch(removeGenericStructures('zm-kmz421-structures'));
  });

  it('Fetching structures does not replace the store', () => {
    // fetch two generic structure objects
    store.dispatch(
      fetchGenericStructures('zm-structures', [
        structureData[0],
        structureData[1],
      ] as GenericStructure[])
    );
    // we should have them in the store
    expect(getGenericStructures(store.getState(), 'zm-structures')).toEqual({
      features: [structureData[0].geojson, structureData[1].geojson],
      type: 'FeatureCollection',
    });
    // fetch one more generic structure objects
    store.dispatch(
      fetchGenericStructures('zm-structures', [structureData[11]] as GenericStructure[])
    );
    // we should now have a total of three generic structure objects in the store
    expect(getGenericStructures(store.getState(), 'zm-structures')).toEqual({
      features: [structureData[0].geojson, structureData[1].geojson, structureData[11].geojson],
      type: 'FeatureCollection',
    });
  });

  it('You can add one generic structure object to the store', () => {
    // reset
    store.dispatch(removeGenericStructures('zm-structures'));

    // add one generic structure objects
    store.dispatch(addGenericStructure('zm-structures', structureData[2] as GenericStructure));
    // we should have it in the store
    expect(getGenericStructures(store.getState(), 'zm-structures')).toEqual({
      features: [structureData[2].geojson],
      type: 'FeatureCollection',
    });

    // fetch one more generic structure objects
    store.dispatch(addGenericStructure('zm-structures', structureData[1] as GenericStructure));

    // we should now have a total of three generic structure objects in the store
    expect(getGenericStructures(store.getState(), 'zm-structures')).toEqual({
      features: [structureData[2].geojson, structureData[1].geojson],
      type: 'FeatureCollection',
    });

    // add an existing generic structure again
    store.dispatch(addGenericStructure('zm-structures', structureData[2] as GenericStructure));
    // nothing should have changed in the store
    // we should now have a total of three generic structure objects in the store
    expect(getGenericStructures(store.getState(), 'zm-structures')).toEqual({
      features: [structureData[2].geojson, structureData[1].geojson],
      type: 'FeatureCollection',
    });
  });

  it('fetches structures with no id key', () => {
    store.dispatch(
      fetchGenericStructures('smc-structures', [
        SMCStructures[0],
        SMCStructures[1],
      ] as GenericStructure[])
    );
    expect(getGenericStructures(store.getState(), 'smc-structures')).toEqual({
      features: [SMCStructures[0].geojson, SMCStructures[1].geojson],
      type: 'FeatureCollection',
    });
  });
});
