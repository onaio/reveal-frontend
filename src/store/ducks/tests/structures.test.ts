import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy } from 'lodash';
import { constants } from 'zlib';
import { FeatureCollection } from '../../../helpers/utils';
import store from '../../index';
import reducer, {
  getAllStructuresFC,
  getStructuresFCByJurisdictionId,
  getStructuresGeoJsonData,
  InitialStructure,
  InitialStructureGeoJSON,
  reducerName,
  setStructures,
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
    const expectedStoreData = keyBy(
      fixtures.structures,
      (structure: InitialStructure) => structure.id
    );
    expect(store.getState().structures.structuresById).toEqual(expectedStoreData);
  });

  it('should get structures with geojson data', () => {
    store.dispatch(setStructures(cloneDeep(fixtures.structures)));
    const expected = cloneDeep([fixtures.structure1.geojson, fixtures.structure2.geojson]);
    expect(getStructuresGeoJsonData(store.getState(), false)).toEqual(expected);
  });
});

describe('reducers/structures/FeatureCollectionSelectors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const expected: FeatureCollection<InitialStructureGeoJSON> = {
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
