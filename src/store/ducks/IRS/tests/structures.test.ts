import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
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

  // it('Fetching plans does not replace GenericStructuresById', () => {
  //   // fetch two generic structure objects
  //   store.dispatch(
  //     fetchGenericStructures('zm-structures', [
  //       structureData[0],
  //       structureData[1],
  //     ] as NamibiaGenericStructure[])
  //   );
  //   // we should have them in the store
  //   expect(getGenericStructuresArray(store.getState(), 'zm-structures')).toEqual([
  //     structureData[0],
  //     structureData[1],
  //   ]);
  //   // fetch one more generic structure objects
  //   store.dispatch(
  //     fetchGenericStructures('zm-structures', [
  //       structureData[2],
  //     ] as NamibiaGenericStructure[])
  //   );
  //   // we should now have a total of three generic structure objects in the store
  //   expect(getGenericStructuresArray(store.getState(), 'zm-structures')).toEqual([
  //     structureData[0],
  //     structureData[1],
  //     structureData[2],
  //   ]);
  // });

  // it('You can add one generic structure object to the store', () => {
  //   // reset
  //   store.dispatch(removeGenericStructures('zm-structures'));

  //   // add one generic structure objects
  //   store.dispatch(
  //     addGenericStructure('zm-structures', fixtures
  //       .namibiaGenericStructures[2] as NamibiaGenericStructure)
  //   );
  //   // we should have it in the store
  //   expect(getGenericStructuresArray(store.getState(), 'zm-structures')).toEqual([
  //     structureData[2],
  //   ]);

  //   // fetch one more generic structure objects
  //   store.dispatch(
  //     addGenericStructure('zm-structures', fixtures
  //       .namibiaGenericStructures[1] as NamibiaGenericStructure)
  //   );
  //   // we should now have a total of three generic structure objects in the store
  //   expect(getGenericStructuresArray(store.getState(), 'zm-structures')).toEqual([
  //     structureData[2],
  //     structureData[1],
  //   ]);

  //   // add an existing plan again
  //   store.dispatch(
  //     addGenericStructure('zm-structures', fixtures
  //       .namibiaGenericStructures[2] as NamibiaGenericStructure)
  //   );
  //   // nothing should have changed in the store
  //   // we should now have a total of three generic structure objects in the store
  //   expect(getGenericStructuresArray(store.getState(), 'zm-structures')).toEqual([
  //     structureData[2],
  //     structureData[1],
  //   ]);
  // });
});
