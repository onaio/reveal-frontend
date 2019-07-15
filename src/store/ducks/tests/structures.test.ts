import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy } from 'lodash';
import { FeatureCollection } from '../../../helpers/utils';
import store from '../../index';
import reducer, {
  getStructuresArray,
  getStructuresFC,
  InitialStructureGeoJSON,
  reducerName,
  setStructures,
  Structure,
} from '../structures';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/tasks', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getStructuresArray(store.getState())).toEqual([]);
  });

  it('should set structures', () => {
    store.dispatch(setStructures(cloneDeep(fixtures.structures)));
    /** Check if we are persisting structures to store */
    const expectedStoreData = keyBy(fixtures.structures, (structure: Structure) => structure.id);
    expect(store.getState().structures.structuresById).toEqual(expectedStoreData);
    /** Test we return strctures array */
    const expectedArrayFromStoreData = fixtures.structures;
    expect(getStructuresArray(store.getState())).toEqual(expectedArrayFromStoreData);
  });
});

describe('reducers/structures/FeatureCollectionSelectors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('gets all structures as Feature Collection', () => {
    store.dispatch(setStructures([fixtures.structure1, fixtures.structure2]));
    const expected: FeatureCollection<InitialStructureGeoJSON> = {
      features: [fixtures.structure1.geojson, fixtures.structure2.geojson],
      type: 'FeatureCollection',
    };
    expect(getStructuresFC(store.getState())).toEqual(expected);
  });
});
