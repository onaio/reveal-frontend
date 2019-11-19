/** Test file for the practitioners ducks module */
import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import { Reducer, Selector } from 'redux-testkit';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchPractitionerRoles,
  fetchPractitioners,
  getPractitionersArray,
  getPractitionersById,
  getPractitionersByOrgId,
  initialState,
  Practitioner,
  reducerName,
  removePractitionerRolesAction,
  removePractitionersAction,
} from '..';
import store from '../../../..';
import * as fixtures from '../../../tests/fixtures';

reducerRegistry.register(reducerName, reducer);

const generateKeyBy = (practitioners: Practitioner[]) =>
  keyBy(practitioners, practitioner => practitioner.identifier);

describe('reducers/practitioners.reducer.fetchPractitionersAction', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removePractitionersAction);
    store.dispatch(removePractitionerRolesAction);
  });
  // should handle dispatch on initialState
  it('handles dispatch correctly on initial state', () => {
    const action = fetchPractitioners([fixtures.practitioner1] as Practitioner[]);
    const expectedState = {
      practitionerRoles: {},
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

  it('handles dispatch correctly on current state with overwrite', () => {
    const currentState = {
      practitionersById: generateKeyBy([fixtures.practitioner1] as Practitioner[]),
    };
    const action = fetchPractitioners([fixtures.practitioner2] as Practitioner[], true);
    const expectedState = {
      practitionersById: generateKeyBy([fixtures.practitioner2] as Practitioner[]),
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

describe('reducers/practitioners.reducer.fetchPractitionerRolesAction', () => {
  // should handle dispatch on initialState
  it('handles dispatch correctly on initial state', () => {
    const action = fetchPractitionerRoles(
      [fixtures.practitioner5] as Practitioner[],
      fixtures.organization3.identifier
    );
    const expectedState = {
      practitionerRoles: {
        'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': { master: fixtures.practitioner5 },
      },
      practitionersById: {},
    };
    // without a state, should use the default state
    Reducer(reducer)
      .expect(action)
      .toReturnState(expectedState);
  });

  // should handle dispatch on existing state
  it('handles dispatch correctly on current state', () => {
    const currentState = {
      practitionerRoles: {
        'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': { master: fixtures.practitioner5 },
      },
      practitionersById: {},
    };
    const action = fetchPractitionerRoles(
      [fixtures.practitioner6] as Practitioner[],
      fixtures.organization3.identifier
    );
    const expectedState = {
      practitionerRoles: {
        'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': {
          '437cc699-cfd7-414c-ba27-1668b6b517e6': fixtures.practitioner6,
        },
      },
      practitionersById: {},
    };
    Reducer(reducer)
      .withState(currentState)
      .expect(action)
      .toReturnState(expectedState);
  });

  // should return same state for non existing action
  it('returns current State for unknown action types', () => {
    const currentState = {
      practitionerRoles: {
        'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': { master: fixtures.practitioner5 },
      },
      practitionersById: generateKeyBy([fixtures.practitioner5] as Practitioner[]),
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
    const action = removePractitionersAction;
    const startingState = { practitionersById: {} };
    const expectedState = { practitionersById: {} };
    Reducer(reducer)
      .withState(startingState)
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

describe('reducers/practitioners.reducer.removePractitionerRolesAction', () => {
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
      practitionerRoles: {
        'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': { master: fixtures.practitioner5 },
      },
      practitionersById: generateKeyBy([fixtures.practitioner5] as Practitioner[]),
    };
    const action = removePractitionerRolesAction;
    const expectedState = {
      practitionerRoles: {},
      practitionersById: generateKeyBy([fixtures.practitioner5] as Practitioner[]),
    };
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
    Selector(getPractitionersByOrgId)
      .expect(state, 'someOrgId')
      .toReturn([]);
  });

  it('practitionerRole selectors return correct data from existing state', () => {
    const currentState = {
      practitionerRoles: {
        'd23f7350-d406-11e9-bb65-2a2ae2dbcce4': { master: fixtures.practitioner5 },
      },
      practitionersById: generateKeyBy([fixtures.practitioner5] as Practitioner[]),
    };
    const state = { [reducerName]: currentState };
    Selector(getPractitionersByOrgId)
      .expect(state, 'd23f7350-d406-11e9-bb65-2a2ae2dbcce4')
      .toReturn([fixtures.practitioner5]);
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

  it('overwrites stored practitioners when overwrite is true', () => {
    store.dispatch(removePractitionersAction);
    store.dispatch(fetchPractitioners([fixtures.practitioner1] as Practitioner[]));
    let numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(1);

    store.dispatch(fetchPractitioners([fixtures.practitioner2] as Practitioner[], true));
    numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(1);
  });

  it('fetchedPractitionerRole actions actually adds data to store', () => {
    expect(getPractitionersById(store.getState())).toEqual({});
    expect(getPractitionersArray(store.getState())).toEqual([]);

    store.dispatch(
      fetchPractitionerRoles(
        fixtures.org3Practitioners as Practitioner[],
        fixtures.organization3.identifier
      )
    );
    expect(getPractitionersById(store.getState())).toEqual({});
    expect(
      getPractitionersByOrgId(store.getState(), fixtures.organization3.identifier).length
    ).toEqual(3);
  });

  it('removePractitionerRole action removes practitioners', () => {
    store.dispatch(
      fetchPractitionerRoles(
        fixtures.org3Practitioners as Practitioner[],
        fixtures.organization3.identifier
      )
    );

    let org3Practs = getPractitionersByOrgId(store.getState(), fixtures.organization3.identifier)
      .length;
    expect(org3Practs).toEqual(3);

    store.dispatch(removePractitionerRolesAction);
    org3Practs = getPractitionersByOrgId(store.getState(), fixtures.organization3.identifier)
      .length;
    expect(org3Practs).toEqual(0);
  });

  it('Adds new practitioners to store instead of overwriting existing ones', () => {
    // impact on practitionersById
    store.dispatch(
      fetchPractitionerRoles(
        [fixtures.practitioner4] as Practitioner[],
        fixtures.organization3.identifier
      )
    );

    let org3Practs = getPractitionersByOrgId(store.getState(), fixtures.organization3.identifier)
      .length;
    expect(org3Practs).toEqual(1);

    // possibilities; adding practitioners to the same organization should override
    store.dispatch(
      fetchPractitionerRoles(
        [fixtures.practitioner5] as Practitioner[],
        fixtures.organization3.identifier
      )
    );

    org3Practs = getPractitionersByOrgId(store.getState(), fixtures.organization3.identifier)
      .length;
    expect(org3Practs).toEqual(1);

    // possibilities; adding same practitioners to a different organization
    store.dispatch(
      fetchPractitionerRoles(
        [fixtures.practitioner5] as Practitioner[],
        fixtures.organization2.identifier
      )
    );

    let org2Practs = getPractitionersByOrgId(store.getState(), fixtures.organization2.identifier)
      .length;
    expect(org2Practs).toEqual(1);

    // possibilities; adding practitioners to a different organization
    store.dispatch(
      fetchPractitionerRoles(
        [fixtures.practitioner6] as Practitioner[],
        fixtures.organization1.identifier
      )
    );

    const org1Practs = getPractitionersByOrgId(store.getState(), fixtures.organization1.identifier)
      .length;

    org2Practs = getPractitionersByOrgId(store.getState(), fixtures.organization2.identifier)
      .length;
    org3Practs = getPractitionersByOrgId(store.getState(), fixtures.organization3.identifier)
      .length;
    expect(org1Practs).toEqual(1);
    expect(org2Practs).toEqual(1);
    expect(org3Practs).toEqual(1);
  });
});
