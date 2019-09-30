/** Test file for the practitioners ducks module */
import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { Reducer, Selector } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchPractitioners,
  getPractitionersArray,
  getPractitionersById,
  initialState,
  Practitioner,
  reducerName,
  removePractitionersAction,
} from '../practitioners';
import * as fixtures from '../tests/fixtures';

reducerRegistry.register(reducerName, reducer);

const generateKeyBy = (practitioners: Practitioner[]) =>
  keyBy(practitioners, practitioner => practitioner.identifier);

describe('reducers/practitioners.reducer.fetchPractitionersAction', () => {
  // should handle dispatch on initialState
  it('handles dispatch correctly on initial state', () => {
    const action = fetchPractitioners([fixtures.practitioner1] as Practitioner[]);
    const expectedState = {
      practitionersById: generateKeyBy([fixtures.practitioner1] as Practitioner[]),
    };
    Reducer(reducer)
      .expect(action)
      .toReturnState(expectedState);
  });

  // should handle dispatch on existing state
  it('handles dispatch correctly on current state', () => {
    const currentState = {
      practitionersById: generateKeyBy([fixtures.practitioner1] as Practitioner[]),
    };
    const action = fetchPractitioners([fixtures.practitioner2] as Practitioner[]);
    const expectedState = {
      practitionersById: generateKeyBy([
        fixtures.practitioner1,
        fixtures.practitioner2,
      ] as Practitioner[]),
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  // should return same state for non existing action
  it('returns current State for unknown action types', () => {
    const currentState = {
      practitionersById: generateKeyBy([fixtures.practitioner1] as Practitioner[]),
    };
    const action = { type: 'UNKNOWN_ACTION' };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(currentState);
  });
});

describe('reducers/practitioners.reducer.removePractitionersAction', () => {
  // should handle dispatch on initialState
  it('handles dispatch correctly on initial state', () => {
    const currentState = {
      practitionersById: generateKeyBy([
        fixtures.practitioner1,
        fixtures.practitioner2,
      ] as Practitioner[]),
    };
    const action = removePractitionersAction;
    const expectedState = { practitionersById: {} };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  // should handle dispatch on existing state
  it('handles dispatch correctly on current state', () => {
    const currentState = {
      practitionersById: generateKeyBy([fixtures.practitioner1] as Practitioner[]),
    };
    const action = removePractitionersAction;
    const expectedState = { practitionersById: {} };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });
});

describe('reducers/practitioners.reducer.selectors', () => {
  // should select on initial state
  it('selectors work for empty initialState', () => {
    const state = { [reducerName]: initialState };
    Selector(getPractitionersById)
      .expect(state)
      .toReturn({});
    Selector(getPractitionersArray)
      .expect(state)
      .toReturn([]);
  });

  // return select on existing state
  it('returns correct data from existing state', () => {
    const currentState = {
      practitionersById: generateKeyBy([fixtures.practitioner1] as Practitioner[]),
    };
    const presentState = { [reducerName]: currentState };
    const getPractitionersIdExpected = generateKeyBy([fixtures.practitioner1] as Practitioner[]);
    const getPractitionersArrayExpected = [fixtures.practitioner1];
    Selector(getPractitionersById)
      .expect(presentState)
      .toReturn(getPractitionersIdExpected);
    Selector(getPractitionersArray)
      .expect(presentState)
      .toReturn(getPractitionersArrayExpected);
  });
});

describe('reducers/practitioners.reducer- integration test', () => {
  beforeEach(() => {
    store.dispatch(removePractitionersAction);
  });

  it('fetchedPractitioners actions actually adds data to store', () => {
    expect(getPractitionersById(store.getState())).toEqual({});
    expect(getPractitionersArray(store.getState())).toEqual([]);
    store.dispatch(
      fetchPractitioners([fixtures.practitioner1, fixtures.practitioner2] as Practitioner[])
    );
    expect(getPractitionersById(store.getState())).toEqual({
      'd7c9c000-e9b3-427a-890e-49c301aa48e6': fixtures.practitioner2,
      p5id: fixtures.practitioner1,
    });
    expect(getPractitionersArray(store.getState())).toEqual(
      values([fixtures.practitioner1, fixtures.practitioner2])
    );
  });

  it('removePractitioners action removes practitioners', () => {
    store.dispatch(
      fetchPractitioners([fixtures.practitioner1, fixtures.practitioner2] as Practitioner[])
    );
    let numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(2);

    store.dispatch(removePractitionersAction);
    numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(0);
  });

  it('Adds new practitioners to store instead of overwriting existing ones', () => {
    store.dispatch(removePractitionersAction);
    store.dispatch(fetchPractitioners([fixtures.practitioner1] as Practitioner[]));
    let numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(1);

    store.dispatch(fetchPractitioners([fixtures.practitioner2] as Practitioner[]));
    numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(2);
  });
});
