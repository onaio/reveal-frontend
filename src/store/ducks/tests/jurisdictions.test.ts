import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchAllJurisdictionIds,
  fetchJurisdictions,
  getAllJurisdictionsIdArray,
  getJurisdictionById,
  getJurisdictionsArray,
  getJurisdictionsById,
  getJurisdictionsIdArray,
  Jurisdiction,
  makeJurisdictionByIdSelector,
  reducerName,
  removeAllJurisdictionIdsAction,
  removeJurisdictionsAction,
} from '../jurisdictions';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/jurisdictions', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getJurisdictionsById(store.getState())).toEqual({});
    expect(getJurisdictionsIdArray(store.getState())).toEqual([]);
    expect(getJurisdictionsArray(store.getState())).toEqual([]);
    expect(getJurisdictionById(store.getState(), 'someId')).toEqual(null);

    const jurisdictionByIdSelector = makeJurisdictionByIdSelector();
    expect(jurisdictionByIdSelector(store.getState(), { jurisdictionId: 'someID' })).toBeNull();
  });

  it('should fetch jurisdictions', () => {
    store.dispatch(fetchJurisdictions(fixtures.jurisdictions));
    const expected = keyBy(
      fixtures.jurisdictions,
      (jurisdiction: Jurisdiction) => jurisdiction.jurisdiction_id
    );
    expect(getJurisdictionsById(store.getState())).toEqual(expected);
    expect(getJurisdictionsIdArray(store.getState())).toEqual(fixtures.jurisdictionsIdsArray);
    expect(getJurisdictionsArray(store.getState())).toEqual(values(expected));
    expect(getJurisdictionById(store.getState(), '450fc15b-5bd2-468a-927a-49cb10d3bcac')).toEqual(
      fixtures.jurisdictions[0]
    );

    const jurisdictionByIdSelector = makeJurisdictionByIdSelector();
    expect(
      jurisdictionByIdSelector(store.getState(), {
        jurisdictionId: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
      })
    ).toEqual(fixtures.jurisdictions[0]);
  });

  it('should save jurisdictions correctly', () => {
    store.dispatch(fetchJurisdictions([fixtures.jurisdiction3] as any));
    const jurisdiction3FromStore = getJurisdictionById(store.getState(), 'abcde');
    expect(jurisdiction3FromStore).not.toBeNull();

    const jurisdictionByIdSelector = makeJurisdictionByIdSelector();
    expect(jurisdictionByIdSelector(store.getState(), { jurisdictionId: 'abcde' })).not.toBeNull();

    if (jurisdiction3FromStore) {
      expect(jurisdiction3FromStore).toEqual({
        geojson: {
          geometry: {
            coordinates: [
              [
                [101.166915893555, 15.0715019595332],
                [101.165628433228, 15.069429992157],
                [101.164855957031, 15.0649130333519],
                [101.164898872375, 15.061473449978],
                [101.165843009949, 15.0585311116698],
                [101.168718338013, 15.0577022766384],
                [101.173524856567, 15.0577437184666],
                [101.179447174072, 15.0583653449216],
                [101.183996200562, 15.0589455279759],
                [101.189103126526, 15.0597743581685],
                [101.191892623901, 15.0629238834779],
                [101.191549301147, 15.0671093647448],
                [101.19086265564, 15.0727036913665],
                [101.190605163574, 15.0748170653661],
                [101.188631057739, 15.0768061040682],
                [101.185412406921, 15.0769304183694],
                [101.182150840759, 15.0772619228176],
                [101.177172660828, 15.0780906816776],
                [101.174211502075, 15.0777591785211],
                [101.172151565552, 15.0765989134045],
                [101.168503761292, 15.0753557651845],
                [101.166915893555, 15.0715019595332],
              ],
            ],
            type: 'Polygon',
          },
          id: 'abcde',
          properties: {
            jurisdiction_name: 'TLv1_01',
            jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
          },
          type: 'Feature',
        },
        jurisdiction_id: 'abcde',
      });
    }
  });

  it('can remove jurisdictions from store', () => {
    const jurisdictionByIdSelector = makeJurisdictionByIdSelector();

    store.dispatch(removeJurisdictionsAction);
    let jurisdictionsInStore = getJurisdictionsById(store.getState());
    expect(jurisdictionsInStore).toEqual({});

    store.dispatch(fetchJurisdictions([fixtures.jurisdiction3] as any));
    let jurisdiction3FromStore = getJurisdictionById(store.getState(), 'abcde');
    jurisdictionsInStore = getJurisdictionsById(store.getState());
    expect(jurisdiction3FromStore).not.toBeNull();
    expect(jurisdictionsInStore).not.toEqual({});

    expect(jurisdictionByIdSelector(store.getState(), { jurisdictionId: 'abcde' })).not.toBeNull();

    store.dispatch(removeJurisdictionsAction);
    jurisdiction3FromStore = getJurisdictionById(store.getState(), 'abcde');
    jurisdictionsInStore = getJurisdictionsById(store.getState());
    expect(jurisdiction3FromStore).toBeNull();
    expect(jurisdictionsInStore).toEqual({});

    expect(jurisdictionByIdSelector(store.getState(), { jurisdictionId: 'abcde' })).toBeNull();
  });

  it('new jurisdictions not overwrite but added to existing', () => {
    store.dispatch(removeJurisdictionsAction);
    const jurisdictionsInStore = getJurisdictionsById(store.getState());
    expect(jurisdictionsInStore).toEqual({});

    store.dispatch(fetchJurisdictions([fixtures.jurisdiction3] as any));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions] as any));
    const jurisdiction3FromStore = getJurisdictionById(store.getState(), 'abcde');
    expect(jurisdiction3FromStore).not.toBeNull();

    const jurisdictionByIdSelector = makeJurisdictionByIdSelector();
    expect(jurisdictionByIdSelector(store.getState(), { jurisdictionId: 'abcde' })).not.toBeNull();
  });

  it('can remove allJurisdictionsIds', () => {
    store.dispatch(removeAllJurisdictionIdsAction);
    let alljurisdictionsIdsNumber = getAllJurisdictionsIdArray(store.getState()).length;
    expect(alljurisdictionsIdsNumber).toEqual(0);

    store.dispatch(fetchAllJurisdictionIds(['id1']));
    alljurisdictionsIdsNumber = getAllJurisdictionsIdArray(store.getState()).length;
    expect(alljurisdictionsIdsNumber).toEqual(1);

    store.dispatch(removeAllJurisdictionIdsAction);
    alljurisdictionsIdsNumber = getAllJurisdictionsIdArray(store.getState()).length;
    expect(alljurisdictionsIdsNumber).toEqual(0);
  });

  it('new jurisdictionsIds do not overwrite but added to existing', () => {
    store.dispatch(removeAllJurisdictionIdsAction);
    let alljurisdictionsIdsNumber = getAllJurisdictionsIdArray(store.getState()).length;
    expect(alljurisdictionsIdsNumber).toEqual(0);

    store.dispatch(fetchAllJurisdictionIds(['id1']));
    alljurisdictionsIdsNumber = getAllJurisdictionsIdArray(store.getState()).length;
    expect(alljurisdictionsIdsNumber).toEqual(1);

    store.dispatch(fetchAllJurisdictionIds(['id2']));
    alljurisdictionsIdsNumber = getAllJurisdictionsIdArray(store.getState()).length;
    expect(alljurisdictionsIdsNumber).toEqual(2);

    store.dispatch(fetchJurisdictions([fixtures.jurisdiction3] as any));
    alljurisdictionsIdsNumber = getAllJurisdictionsIdArray(store.getState()).length;
    expect(alljurisdictionsIdsNumber).toEqual(3);
  });
});
