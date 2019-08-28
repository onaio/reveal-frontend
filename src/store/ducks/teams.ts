/** Teams redux module */
import { get, keyBy, values } from 'lodash';
import { Store } from 'redux';
import { AnyAction } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'teams';

/** interface for a Team object */
export interface Team {
  identifier: string;
  name: string;
  jurisdictions: string[];
}

// action interfaces

/** action type for action that adds Teams to store */
export const TEAMS_FETCHED = 'src/store/ducks/teams/reducer/TEAM_FETCHED';
/** action type for REMOVE_TEAMS action */
export const REMOVE_TEAMS = 'src/store/ducks/teams/reducer/REMOVE_TEAMS';

/** interface for teams fetched action */
interface FetchTeamsAction extends AnyAction {
  teamsById: { [key: string]: Team };
  type: typeof TEAMS_FETCHED;
}

/** interface for action that removes teams from store */
interface RemoveTeamsAction extends AnyAction {
  teamsById: { [key: string]: Team };
  type: typeof REMOVE_TEAMS;
}

/** interface for Teams state in store */
interface TeamState {
  teamsById: { [key: string]: Team };
}

/** initial state for Teams records in store */
const initialTeamState: ImmutableTeamState = SeamlessImmutable({
  teamsById: {},
});

/** single type for all action types */
type TeamActionTypes = FetchTeamsAction | RemoveTeamsAction | AnyAction;

// immutable team state in dux
export type ImmutableTeamState = TeamState & SeamlessImmutable.ImmutableObject<TeamState>;

/** the Team reducer function */
export default function reducer(state = initialTeamState, action: TeamActionTypes) {
  switch (action.type) {
    case TEAMS_FETCHED:
      return SeamlessImmutable({
        ...state,
        teamsById: { ...state.teamsById, ...action.teamsById },
      });
    case REMOVE_TEAMS:
      return SeamlessImmutable({
        ...state,
        teamsById: action.teamsById,
      });
    default:
      return state;
  }
}

// actions

/** action to remove teams form store */
export const removeTeamsAction: RemoveTeamsAction = {
  teamsById: {},
  type: REMOVE_TEAMS,
};

// action creators

/** creates action to add fetched teams to store
 * @param {Team []} teamsList - array of teams to be added to store
 *
 * @returns {FetchTeamsAction} - action with teams payload that is added to store
 */
export const fetchTeams = (teamsList: Team[]): FetchTeamsAction => {
  return {
    teamsById: keyBy(teamsList, team => team.identifier),
    type: TEAMS_FETCHED,
  };
};

// selectors

/** get teams as an object where their ids are the keys and the objects
 * the values
 * @param {Partial<Store>} state - Portion of the store
 *
 * @return {[key: string]: Team}
 */
export function getTeamsById(state: Partial<Store>): { [key: string]: Team } {
  return (state as any)[reducerName].teamsById;
}

/** Get single Team by the given id
 * @param {Partial<Store>} state - Part of the redux store
 * @param {string} teamId - filters team data to be returned based on this id
 *
 * @return {Team | null} - A team object if found else null
 */
export function getTeamById(state: Partial<Store>, teamId: string): Team | null {
  return get(getTeamsById(state), teamId) || null;
}

/** Get all teams as an array
 * @param {Partial<Store>} state - Part of the redux store
 *
 * @return {Team []} - all teams in store as an array
 */
export function getTeamsArray(state: Partial<Store>): Team[] {
  return values(getTeamsById(state));
}
