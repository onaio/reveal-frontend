/** Test file for the practitioners ducks module */
import reducerRegistry from '@onaio/redux-reducer-registry';
import { values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchEvents,
  getEventById,
  getEventsById,
  reducerName,
  removeEventsAction,
} from '..';
import store from '../../../..';
import { extractEvent, extractEvents } from '../utils';
import { rawEvent1, rawEvent2 } from './fixtures';

reducerRegistry.register(reducerName, reducer);

// const generateKeyBy = (practitioners: Practitioner[]) =>
//   keyBy(practitioners, practitioner => practitioner.identifier);

describe('reducers/practitioners.reducer.fetchPractitionersAction', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeEventsAction);
  });

  it('selectors work for empty initialState', () => {
    expect(getEventById(store.getState(), 'anyId')).toBeNull();
    expect(getEventsById(store.getState())).toEqual({});
  });

  it('fetches events correctly', () => {
    store.dispatch(fetchEvents([rawEvent1]));
    const event1 = extractEvent(rawEvent1);
    expect(getEventsById(store.getState())).toEqual({
      '88684506-605d-41db-b904-efbaf9795d2a': event1,
    });
    expect(getEventById(store.getState(), '88684506-605d-41db-b904-efbaf9795d2a')).toEqual(event1);
  });

  it('removes ANC correctly', () => {
    store.dispatch(fetchEvents([rawEvent1, rawEvent2]));
    let numberOfClients = values(getEventsById(store.getState())).length;
    expect(numberOfClients).toEqual(2);

    store.dispatch(removeEventsAction);
    numberOfClients = values(getEventsById(store.getState())).length;
    expect(numberOfClients).toEqual(0);
  });

  it('dispatches ANC correctly on non-empty state', () => {
    store.dispatch(fetchEvents([rawEvent2]));
    const event2 = extractEvents([rawEvent2])[0];
    const event1 = extractEvents([rawEvent1])[0];
    let clients = getEventsById(store.getState());
    expect(clients).toEqual({
      [event2.baseEntityId]: event2,
    });

    store.dispatch(fetchEvents([rawEvent1]));
    clients = getEventsById(store.getState());
    expect(clients).toEqual({
      [event2.baseEntityId]: event2,
      [event1.baseEntityId]: event1,
    });
  });
});
