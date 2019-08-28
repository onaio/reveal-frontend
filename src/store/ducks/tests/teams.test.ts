import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import store from '../../index';
import reducer, {
  fetchTeams,
  getTeamById,
  getTeamsArray,
  getTeamsById,
  reducerName,
  removeTeamsAction,
  Team,
} from '../teams';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/plans', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeTeamsAction);
  });

  it('should have initial state', () => {
    // what do we expect returned from selectors for an unpopulated store

    expect(getTeamById(store.getState(), 'randomId')).toBeNull();
    expect(getTeamsById(store.getState())).toEqual({});
    expect(getTeamsArray(store.getState())).toEqual([]);
  });

  it('should fetch households', () => {
    // checking that dispatching actions has desired effect

    store.dispatch(fetchTeams([fixtures.team1]));
    const teamsNumber = getTeamsArray(store.getState()).length;
    expect(teamsNumber).toEqual(1);
    const org1FromStore = getTeamById(store.getState(), '1');
    expect(org1FromStore).toEqual(fixtures.team1);
  });

  it('saves fetched households correctly', () => {
    // goal => all selectors retrieve correct data form non-empty store

    store.dispatch(fetchTeams(fixtures.teams));
    expect(getTeamById(store.getState(), '2')).toEqual(fixtures.team2);
    const expected = keyBy(fixtures.teams, (org: Team) => org.identifier);
    expect(getTeamsById(store.getState())).toEqual(expected);
    expect(getTeamsArray(store.getState())).toEqual(fixtures.teams);
  });

  it('has action to clear teams form store', () => {
    store.dispatch(removeTeamsAction);
    let teamNum = getTeamsArray(store.getState()).length;
    expect(teamNum).toEqual(0);

    store.dispatch(fetchTeams(fixtures.teams));
    teamNum = getTeamsArray(store.getState()).length;
    expect(teamNum).toEqual(2);

    store.dispatch(removeTeamsAction);
    teamNum = getTeamsArray(store.getState()).length;
    expect(teamNum).toEqual(0);
  });

  it('does not override existing teams with newly fetched', () => {
    store.dispatch(fetchTeams([fixtures.team1]));
    let teamNum = getTeamsArray(store.getState()).length;
    expect(teamNum).toEqual(1);

    store.dispatch(fetchTeams([fixtures.team2]));
    teamNum = getTeamsArray(store.getState()).length;
    expect(teamNum).toEqual(2);
  });
});
