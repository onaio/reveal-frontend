import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchOrganizations,
  getOrganizationById,
  getOrganizationsArray,
  getOrganizationsById,
  Organization,
  reducerName,
  removeOrganizationsAction,
} from '..';
import store from '../../../../index';
import * as fixtures from '../../../tests/fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/plans', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeOrganizationsAction);
  });

  it('should have initial state', () => {
    // what do we expect returned from selectors for an unpopulated store

    expect(getOrganizationById(store.getState(), 'randomId')).toBeNull();
    expect(getOrganizationsById(store.getState())).toEqual({});
    expect(getOrganizationsArray(store.getState())).toEqual([]);
  });

  it('should fetch households', () => {
    // checking that dispatching actions has desired effect

    store.dispatch(fetchOrganizations([fixtures.organization1]));
    const teamsNumber = getOrganizationsArray(store.getState()).length;
    expect(teamsNumber).toEqual(1);
    const org1FromStore = getOrganizationById(
      store.getState(),
      'fcc19470-d599-11e9-bb65-2a2ae2dbcce4'
    );
    expect(org1FromStore).toEqual(fixtures.organization1);
  });

  it('saves fetched households correctly', () => {
    // goal => all selectors retrieve correct data form non-empty store

    store.dispatch(fetchOrganizations(fixtures.organizations));
    expect(getOrganizationById(store.getState(), '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4')).toEqual(
      fixtures.organization2
    );
    const expected = keyBy(fixtures.organizations, (org: Organization) => org.identifier);
    expect(getOrganizationsById(store.getState())).toEqual(expected);
    expect(getOrganizationsArray(store.getState())).toEqual(fixtures.organizations);
  });

  it('has action to clear teams form store', () => {
    store.dispatch(removeOrganizationsAction);
    let teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(0);

    store.dispatch(fetchOrganizations(fixtures.organizations));
    teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(2);

    store.dispatch(removeOrganizationsAction);
    teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(0);
  });

  it('does not override existing teams with newly fetched', () => {
    store.dispatch(fetchOrganizations([fixtures.organization1]));
    let teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(1);

    store.dispatch(fetchOrganizations([fixtures.organization2]));
    teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(2);
  });
});
