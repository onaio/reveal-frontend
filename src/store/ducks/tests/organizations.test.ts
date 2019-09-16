import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchOrganizations,
  getOrganizationById,
  getOrganizationsArray,
  getOrganizationsById,
  Organization,
  reducerName,
  removeOrganizationsAction,
} from '../organizations';
import * as fixtures from './fixtures';

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

    store.dispatch(fetchOrganizations([fixtures.team1]));
    const teamsNumber = getOrganizationsArray(store.getState()).length;
    expect(teamsNumber).toEqual(1);
    const org1FromStore = getOrganizationById(store.getState(), '1');
    expect(org1FromStore).toEqual(fixtures.team1);
  });

  it('saves fetched households correctly', () => {
    // goal => all selectors retrieve correct data form non-empty store

    store.dispatch(fetchOrganizations(fixtures.teams));
    expect(getOrganizationById(store.getState(), '2')).toEqual(fixtures.team2);
    const expected = keyBy(fixtures.teams, (org: Organization) => org.identifier);
    expect(getOrganizationsById(store.getState())).toEqual(expected);
    expect(getOrganizationsArray(store.getState())).toEqual(fixtures.teams);
  });

  it('has action to clear teams form store', () => {
    store.dispatch(removeOrganizationsAction);
    let teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(0);

    store.dispatch(fetchOrganizations(fixtures.teams));
    teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(2);

    store.dispatch(removeOrganizationsAction);
    teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(0);
  });

  it('does not override existing teams with newly fetched', () => {
    store.dispatch(fetchOrganizations([fixtures.team1]));
    let teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(1);

    store.dispatch(fetchOrganizations([fixtures.team2]));
    teamNum = getOrganizationsArray(store.getState()).length;
    expect(teamNum).toEqual(2);
  });
});
