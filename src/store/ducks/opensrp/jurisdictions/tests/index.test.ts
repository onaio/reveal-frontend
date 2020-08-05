import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchJurisdictions,
  getJurisdictionById,
  getJurisdictionIds,
  getJurisdictionsArray,
  getJurisdictionsFC,
  getMissingJurisdictionIds,
  reducerName,
  removeJurisdictions,
} from '..';
import {
  raKashikishiHAHC,
  raKsh2,
  raKsh3,
} from '../../../../../components/TreeWalker/tests/fixtures';
import store from '../../../../index';

reducerRegistry.register(reducerName, reducer);

const arraySelector = getJurisdictionsArray();
const jurisdictionSelector = getJurisdictionById();
const fcSelector = getJurisdictionsFC();
const idsSelector = getJurisdictionIds();
const missingIdsSelector = getMissingJurisdictionIds();
const data = [raKashikishiHAHC, raKsh2, raKsh3];

describe('reducers/opensrp/hierarchies', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeJurisdictions());
  });

  it('should have initial state', () => {
    expect(arraySelector(store.getState(), {})).toEqual([]);
    expect(idsSelector(store.getState(), {})).toEqual([]);
  });

  it('should be able to store and retrieve jurisdictions', () => {
    store.dispatch(fetchJurisdictions(data));
    // idsSelector
    expect(idsSelector(store.getState(), {})).toEqual(data.map(e => e.id));
    expect(idsSelector(store.getState(), { filterGeom: false })).toEqual([raKashikishiHAHC.id]);
    expect(idsSelector(store.getState(), { filterGeom: true })).toEqual([raKsh2.id, raKsh3.id]);
    // getMissingJurisdictionIds
    expect(missingIdsSelector(store.getState(), { filterGeom: false })).toEqual([
      raKashikishiHAHC.id,
    ]);
    expect(missingIdsSelector(store.getState(), { filterGeom: true })).toEqual([
      raKsh2.id,
      raKsh3.id,
    ]);
    expect(
      missingIdsSelector(store.getState(), {
        filterGeom: true,
        jurisdictionIdsArray: ['1337', '7331', raKashikishiHAHC.id, raKsh2.id, raKsh3.id],
      })
    ).toEqual(['1337', '7331', raKashikishiHAHC.id]);
    // jurisdictionSelector
    expect(jurisdictionSelector(store.getState(), { jurisdictionId: raKsh2.id })).toEqual(raKsh2);
    // arraySelector
    expect(arraySelector(store.getState(), {})).toEqual(data);
    expect(arraySelector(store.getState(), { parentId: raKashikishiHAHC.id })).toEqual([
      raKsh2,
      raKsh3,
    ]);
    expect(
      arraySelector(store.getState(), { jurisdictionIdsArray: [raKashikishiHAHC.id, raKsh3.id] })
    ).toEqual([raKashikishiHAHC, raKsh3]);
    // fcSelector
    expect(fcSelector(store.getState(), { parentId: raKashikishiHAHC.id })).toEqual({
      features: [raKsh2, raKsh3],
      type: 'FeatureCollection',
    });
    expect(fcSelector(store.getState(), { jurisdictionIdsArray: [raKsh3.id] })).toEqual({
      features: [raKsh3],
      type: 'FeatureCollection',
    });
    // test new feature properties exist in feature collection
    expect(
      fcSelector(store.getState(), {
        currentChildren: [
          {
            model: {
              id: raKsh3.id,
              meta: { selected: true },
            },
          },
        ] as any,
        jurisdictionIdsArray: [raKsh3.id],
        newFeatureProps: true,
      })
    ).toEqual({
      features: [
        {
          ...raKsh3,
          properties: {
            ...raKsh3.properties,
            fillColor: '#ff5c33',
            fillOutlineColor: '#22bcfb',
            lineColor: '#22bcfb',
          },
        },
      ],
      type: 'FeatureCollection',
    });
  });
});
