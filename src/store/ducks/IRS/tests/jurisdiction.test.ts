import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../..';
import reducer, {
  addIRSJurisdiction,
  fetchIRSJurisdictions,
  getIRSJurisdictionById,
  getIRSJurisdictionsArray,
  getIRSJurisdictionsById,
  NamibiaIRSJurisdiction,
  reducerName,
  removeIRSJurisdictions,
} from '../jurisdictions';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/IRS/IRSJurisdiction', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getIRSJurisdictionsArray(store.getState())).toEqual([]);
    expect(
      getIRSJurisdictionById(store.getState(), '356b6b84-fc36-4389-a44a-2b038ed2f38d')
    ).toEqual(null);
    expect(getIRSJurisdictionsById(store.getState())).toEqual({});
  });

  it('Fetches IRS jurisdictions correctly', () => {
    // action creators dispatch
    store.dispatch(
      fetchIRSJurisdictions(fixtures.namibiaIRSJurisdictions as NamibiaIRSJurisdiction[])
    );

    expect(getIRSJurisdictionsById(store.getState())).toEqual(
      keyBy(fixtures.namibiaIRSJurisdictions, 'id')
    );

    expect(getIRSJurisdictionsArray(store.getState())).toEqual(fixtures.namibiaIRSJurisdictions);

    expect(
      getIRSJurisdictionById(store.getState(), '0001ca08-c9b7-5ea5-acc5-dc9b2fce5d24')
    ).toEqual(fixtures.namibiaIRSJurisdictions[0]);

    // filtering
    expect(
      getIRSJurisdictionsArray(store.getState(), 'da451786-a760-4947-870c-7c9c0a818574')
    ).toEqual([fixtures.namibiaIRSJurisdictions[0], fixtures.namibiaIRSJurisdictions[3]]);
    // filter by plan id
    expect(
      getIRSJurisdictionsArray(store.getState(), null, '84d72939-0629-4d21-97db-c7dcbccbb7ac')
    ).toEqual([fixtures.namibiaIRSJurisdictions[1]]);
    expect(
      getIRSJurisdictionsArray(
        store.getState(),
        'da451786-a760-4947-870c-7c9c0a818574',
        '3f017d7d-1ac0-4d6f-92d0-33bdcbeff5c4'
      )
    ).toEqual([fixtures.namibiaIRSJurisdictions[0]]);

    expect(
      getIRSJurisdictionsById(
        store.getState(),
        'da451786-a760-4947-870c-7c9c0a818574',
        '3f017d7d-1ac0-4d6f-92d0-33bdcbeff5c4'
      )
    ).toEqual(keyBy([fixtures.namibiaIRSJurisdictions[0]], 'id'));

    // reset
    store.dispatch(removeIRSJurisdictions());
    expect(getIRSJurisdictionsArray(store.getState())).toEqual([]);
  });

  it('Fetching plans does not replace IRSJurisdictionsById', () => {
    // fetch two IRS jurisdiction objects
    store.dispatch(
      fetchIRSJurisdictions([
        fixtures.namibiaIRSJurisdictions[0],
        fixtures.namibiaIRSJurisdictions[1],
      ] as NamibiaIRSJurisdiction[])
    );
    // we should have them in the store
    expect(getIRSJurisdictionsArray(store.getState())).toEqual([
      fixtures.namibiaIRSJurisdictions[0],
      fixtures.namibiaIRSJurisdictions[1],
    ]);
    // fetch one more IRS jurisdiction objects
    store.dispatch(
      fetchIRSJurisdictions([fixtures.namibiaIRSJurisdictions[2]] as NamibiaIRSJurisdiction[])
    );
    // we should now have a total of three IRS jurisdiction objects in the store
    expect(getIRSJurisdictionsArray(store.getState())).toEqual([
      fixtures.namibiaIRSJurisdictions[0],
      fixtures.namibiaIRSJurisdictions[1],
      fixtures.namibiaIRSJurisdictions[2],
    ]);
  });

  it('You can add one IRS jurisdiction object to the store', () => {
    // reset
    store.dispatch(removeIRSJurisdictions());

    // add one IRS jurisdiction objects
    store.dispatch(
      addIRSJurisdiction(fixtures.namibiaIRSJurisdictions[2] as NamibiaIRSJurisdiction)
    );
    // we should have it in the store
    expect(getIRSJurisdictionsArray(store.getState())).toEqual([
      fixtures.namibiaIRSJurisdictions[2],
    ]);

    // fetch one more IRS jurisdiction objects
    store.dispatch(
      addIRSJurisdiction(fixtures.namibiaIRSJurisdictions[1] as NamibiaIRSJurisdiction)
    );
    // we should now have a total of three IRS jurisdiction objects in the store
    expect(getIRSJurisdictionsArray(store.getState())).toEqual([
      fixtures.namibiaIRSJurisdictions[2],
      fixtures.namibiaIRSJurisdictions[1],
    ]);

    // add an existing plan again
    store.dispatch(
      addIRSJurisdiction(fixtures.namibiaIRSJurisdictions[2] as NamibiaIRSJurisdiction)
    );
    // nothing should have changed in the store
    // we should now have a total of three IRS jurisdiction objects in the store
    expect(getIRSJurisdictionsArray(store.getState())).toEqual([
      fixtures.namibiaIRSJurisdictions[2],
      fixtures.namibiaIRSJurisdictions[1],
    ]);
  });
});
