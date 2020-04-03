/** Events redux module */
import { Dictionary, get, keyBy } from 'lodash';
import { Store } from 'redux';
import { AnyAction } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { Event, extractEvents, RawEvent } from './utils';

/** The reducer name */
export const reducerName = 'events';

// action interfaces

/** action type for action that adds Events to store */
export const EVENTS_FETCHED = 'src/store/ducks/opensrp/events/reducer/EVENTS_FETCHED';
/** action type for REMOVE_TEAMS action */
export const EVENTS_REMOVED = 'src/store/ducks/opensrp/events/reducer/EVENTS_REMOVED';

/** interface for events fetched action */
export interface FetchEventsAction extends AnyAction {
  eventsById: Dictionary<Event>;
  type: typeof EVENTS_FETCHED;
}

/** interface for action that removes events from store */
interface RemoveEventsAction extends AnyAction {
  type: typeof EVENTS_REMOVED;
}

/** interface for Events state in store */
interface EventStoreState {
  eventsById: Dictionary<Event> | {};
}

/** initial state for Events records in store */
const initialEventStoreState: ImmutableEventsStoreState = SeamlessImmutable({
  eventsById: {},
});

/** single type for all action types */
type EventActionTypes = FetchEventsAction | RemoveEventsAction | AnyAction;

// immutable event state in dux
export type ImmutableEventsStoreState = EventStoreState &
  SeamlessImmutable.ImmutableObject<EventStoreState>;

/** the Event reducer function */
export default function reducer(state = initialEventStoreState, action: EventActionTypes) {
  switch (action.type) {
    case EVENTS_FETCHED:
      return SeamlessImmutable({
        ...state,
        eventsById: { ...state.eventsById, ...action.eventsById },
      });
    case EVENTS_REMOVED:
      return SeamlessImmutable({
        ...state,
        eventsById: {},
      });
    default:
      return state;
  }
}

// actions

/** action to remove events form store */
export const removeEventsAction: RemoveEventsAction = {
  type: EVENTS_REMOVED,
};

// action creators

/** creates action to add fetched events to store
 * @param {Event []} eventsList - array of events to be added to store
 *
 * @returns {FetchEventsAction} - action with events payload that is added to store
 */
export const fetchEvents = (eventsList: RawEvent[]): FetchEventsAction => {
  const events = extractEvents(eventsList);
  return {
    eventsById: keyBy(events, event => event.id),
    type: EVENTS_FETCHED,
  };
};

// selectors

/** get events as an object where their ids are the keys and the objects
 * the values
 * @param {Partial<Store>} state - Portion of the store
 *
 * @return {Dictionary<Event>}
 */
export function getEventsById(state: Partial<Store>): { [key: string]: Event } {
  return (state as any)[reducerName].eventsById;
}

/** Get single Event by the given id
 * @param {Partial<Store>} state - Part of the redux store
 * @param {string} eventId - filters event data to be returned based on this id
 *
 * @return {Event | null} - A event object if found else null
 */
export function getEventById(state: Partial<Store>, eventId: string): Event | null {
  return get(getEventsById(state), eventId) || null;
}
