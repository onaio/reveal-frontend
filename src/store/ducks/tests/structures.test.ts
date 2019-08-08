import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy } from 'lodash';
import { FEATURE_COLLECTION } from '../../../constants';
import { FeatureCollection } from '../../../helpers/utils';
import store from '../../index';
import reducer, {
  getAllStructuresFC,
  getStructuresFCByJurisdictionId,
  getStructuresGeoJsonData,
  reducerName,
  removeStructuresAction,
  setStructures,
  Structure,
  StructureGeoJSON,
} from '../structures';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/tasks', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    /** not using a selector for test purposes */
    expect(store.getState().structures.structuresById).toEqual({});
  });

  it('should set structures', () => {
    store.dispatch(setStructures(cloneDeep(fixtures.structures)));
    /** Check if we are persisting structures to store */
    const expectedStoreData = keyBy(fixtures.structures, (structure: Structure) => structure.id);
    expect(store.getState().structures.structuresById).toEqual(expectedStoreData);
  });

  it('should have all the properties inside structure', () => {
    store.dispatch(removeStructuresAction);
    store.dispatch(setStructures(cloneDeep([fixtures.structure1])));
    const structure = store.getState().structures.structuresById;
    if (structure) {
      expect(structure).toEqual({
        '155288': {
          geojson: {
            geometry: {
              coordinates: [
                [
                  [101.188427209854, 15.0909179029537],
                  [101.18852108717, 15.0909179029537],
                  [101.18852108717, 15.0910085427885],
                  [101.188427209854, 15.0910085427885],
                  [101.188427209854, 15.0909179029537],
                ],
              ],
              type: 'Polygon',
            },
            id: 'e652f8b2-b884-42d5-832a-86009c10a812',
            properties: {
              code: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
              effective_end_date: null,
              effective_start_date: null,
              geographic_level: 6,
              jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
              name: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
              server_version: 1562120301666,
              status: 'Active',
              type: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
              uid: 'bbcf2240-0a2d-4df7-8890-2c928f5bccaa',
              version: 0,
            },
            type: 'Feature',
          },
          id: '155288',
          jurisdiction_id: '4550a8ab-b310-4881-8c76-1b6a817ea63a',
        },
      });
    }
  });

  it('should get structures with geojson data', () => {
    store.dispatch(setStructures(cloneDeep(fixtures.structures)));
    const expected = cloneDeep([fixtures.structure1.geojson, fixtures.structure2.geojson]);
    expect(getStructuresGeoJsonData(store.getState(), false)).toEqual(expected);
  });

  it('should reset structures', () => {
    store.dispatch(removeStructuresAction);
    let structuresinStore = getAllStructuresFC(store.getState());
    expect(structuresinStore).toEqual({
      features: [],
      type: FEATURE_COLLECTION,
    });

    store.dispatch(setStructures(cloneDeep(fixtures.structures)));
    const expected = cloneDeep([fixtures.structure1.geojson, fixtures.structure2.geojson]);
    expect(getStructuresGeoJsonData(store.getState(), false)).toEqual(expected);

    store.dispatch(removeStructuresAction);
    structuresinStore = getAllStructuresFC(store.getState());
    expect(structuresinStore).toEqual({
      features: [],
      type: FEATURE_COLLECTION,
    });
  });

  it('should add new structures to existing structures, not overwrite', () => {
    store.dispatch(removeStructuresAction);
    let structuresinStore = getAllStructuresFC(store.getState());
    expect(structuresinStore).toEqual({
      features: [],
      type: FEATURE_COLLECTION,
    });

    store.dispatch(setStructures(cloneDeep([fixtures.structure1])));
    structuresinStore = getAllStructuresFC(store.getState());
    expect(structuresinStore.features.length).toEqual(1);
    store.dispatch(setStructures(cloneDeep([fixtures.structure2])));
    structuresinStore = getAllStructuresFC(store.getState());
    expect(structuresinStore.features.length).toEqual(2);
  });
});

describe('reducers/structures/FeatureCollectionSelectors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const expected: FeatureCollection<StructureGeoJSON> = {
    features: [fixtures.structure1.geojson, fixtures.structure2.geojson],
    type: 'FeatureCollection',
  };
  it('gets all structures as Feature Collection', () => {
    store.dispatch(setStructures([fixtures.structure1, fixtures.structure2]));
    expect(getAllStructuresFC(store.getState())).toEqual(expected);
  });

  it('gets structures feature collection by jurisdiction id', () => {
    store.dispatch(setStructures([fixtures.structure1, fixtures.structure2, fixtures.structure3]));
    expect(
      getStructuresFCByJurisdictionId(store.getState(), fixtures.structure1.jurisdiction_id)
    ).toEqual(expected);
  });
});
