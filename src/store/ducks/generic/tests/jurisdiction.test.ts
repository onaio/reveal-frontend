import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import reducer, {
  addGenericJurisdiction,
  fetchGenericJurisdictions,
  getGenericJurisdictionById,
  getGenericJurisdictionsArray,
  getGenericJurisdictionsById,
  NamibiaJurisdiction,
  reducerName,
  removeGenericJurisdictions,
} from '../jurisdictions';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/IRS/GenericJurisdiction', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getGenericJurisdictionsArray(store.getState())).toEqual([]);
    expect(
      getGenericJurisdictionById(
        store.getState(),
        'na-jurisdictions',
        '356b6b84-fc36-4389-a44a-2b038ed2f38d'
      )
    ).toEqual(null);
    expect(getGenericJurisdictionsById(store.getState(), 'na-jurisdictions')).toEqual({});
  });

  it('Fetches IRS jurisdictions correctly', () => {
    // action creators dispatch
    store.dispatch(
      fetchGenericJurisdictions(
        'na-jurisdictions',
        fixtures.namibiaIRSJurisdictions as NamibiaJurisdiction[]
      )
    );

    expect(getGenericJurisdictionsById(store.getState(), 'na-jurisdictions')).toEqual(
      keyBy(fixtures.namibiaIRSJurisdictions, 'id')
    );

    expect(getGenericJurisdictionsArray(store.getState(), 'na-jurisdictions')).toEqual(
      fixtures.namibiaIRSJurisdictions
    );

    expect(
      getGenericJurisdictionById(
        store.getState(),
        'na-jurisdictions',
        '0001ca08-c9b7-5ea5-acc5-dc9b2fce5d24'
      )
    ).toEqual(fixtures.namibiaIRSJurisdictions[0]);

    // filtering
    expect(
      getGenericJurisdictionsArray(
        store.getState(),
        'na-jurisdictions',
        'da451786-a760-4947-870c-7c9c0a818574'
      )
    ).toEqual([fixtures.namibiaIRSJurisdictions[0], fixtures.namibiaIRSJurisdictions[3]]);
    // filter by plan id
    expect(
      getGenericJurisdictionsArray(
        store.getState(),
        'na-jurisdictions',
        null,
        '84d72939-0629-4d21-97db-c7dcbccbb7ac'
      )
    ).toEqual([fixtures.namibiaIRSJurisdictions[1]]);
    expect(
      getGenericJurisdictionsArray(
        store.getState(),
        'na-jurisdictions',
        'da451786-a760-4947-870c-7c9c0a818574',
        '3f017d7d-1ac0-4d6f-92d0-33bdcbeff5c4'
      )
    ).toEqual([fixtures.namibiaIRSJurisdictions[0]]);

    expect(
      getGenericJurisdictionsById(
        store.getState(),
        'na-jurisdictions',
        'da451786-a760-4947-870c-7c9c0a818574',
        '3f017d7d-1ac0-4d6f-92d0-33bdcbeff5c4'
      )
    ).toEqual(keyBy([fixtures.namibiaIRSJurisdictions[0]], 'id'));

    // reset
    store.dispatch(removeGenericJurisdictions('na-jurisdictions'));
    expect(getGenericJurisdictionsArray(store.getState(), 'na-jurisdictions')).toEqual([]);
  });

  it('Fetching plans does not replace GenericJurisdictionsById', () => {
    // fetch two IRS jurisdiction objects
    store.dispatch(
      fetchGenericJurisdictions('na-jurisdictions', [
        fixtures.namibiaIRSJurisdictions[0],
        fixtures.namibiaIRSJurisdictions[1],
      ] as NamibiaJurisdiction[])
    );
    // we should have them in the store
    expect(getGenericJurisdictionsArray(store.getState(), 'na-jurisdictions')).toEqual([
      fixtures.namibiaIRSJurisdictions[0],
      fixtures.namibiaIRSJurisdictions[1],
    ]);
    // fetch one more IRS jurisdiction objects
    store.dispatch(
      fetchGenericJurisdictions('na-jurisdictions', [
        fixtures.namibiaIRSJurisdictions[2],
      ] as NamibiaJurisdiction[])
    );
    // we should now have a total of three IRS jurisdiction objects in the store
    expect(getGenericJurisdictionsArray(store.getState(), 'na-jurisdictions')).toEqual([
      fixtures.namibiaIRSJurisdictions[0],
      fixtures.namibiaIRSJurisdictions[1],
      fixtures.namibiaIRSJurisdictions[2],
    ]);
  });

  it('You can add one IRS jurisdiction object to the store', () => {
    // reset
    store.dispatch(removeGenericJurisdictions('na-jurisdictions'));

    // add one IRS jurisdiction objects
    store.dispatch(
      addGenericJurisdiction(
        'na-jurisdictions',
        fixtures.namibiaIRSJurisdictions[2] as NamibiaJurisdiction
      )
    );
    // we should have it in the store
    expect(getGenericJurisdictionsArray(store.getState(), 'na-jurisdictions')).toEqual([
      fixtures.namibiaIRSJurisdictions[2],
    ]);

    // fetch one more IRS jurisdiction objects
    store.dispatch(
      addGenericJurisdiction(
        'na-jurisdictions',
        fixtures.namibiaIRSJurisdictions[1] as NamibiaJurisdiction
      )
    );
    // we should now have a total of three IRS jurisdiction objects in the store
    expect(getGenericJurisdictionsArray(store.getState(), 'na-jurisdictions')).toEqual([
      fixtures.namibiaIRSJurisdictions[2],
      fixtures.namibiaIRSJurisdictions[1],
    ]);

    // add an existing plan again
    store.dispatch(
      addGenericJurisdiction(
        'na-jurisdictions',
        fixtures.namibiaIRSJurisdictions[2] as NamibiaJurisdiction
      )
    );
    // nothing should have changed in the store
    // we should now have a total of three IRS jurisdiction objects in the store
    expect(getGenericJurisdictionsArray(store.getState(), 'na-jurisdictions')).toEqual([
      fixtures.namibiaIRSJurisdictions[2],
      fixtures.namibiaIRSJurisdictions[1],
    ]);
  });

  it('does not Fetches IRS jurisdictions with null jurisdiction keys', () => {
    // action creators dispatch
    const jurs = [...fixtures.namibiaIRSJurisdictions, ...fixtures.nullJurisdiction];
    store.dispatch(fetchGenericJurisdictions('na-jurisdictions', jurs as NamibiaJurisdiction[]));
    // null jurisdictions are not stored
    expect(getGenericJurisdictionsById(store.getState(), 'na-jurisdictions')).toEqual(
      keyBy(fixtures.namibiaIRSJurisdictions, 'id')
    );
  });
});
