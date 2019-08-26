/** Teams redux module */
import { get } from 'lodash';
import { Store } from 'redux';
import { AnyAction } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'teams';

/** interface for a Team object */
export interface Team {
  id: string;
  name: string;
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
type TeamActionTypes = AnyAction;

// immutable team state in dux
export type ImmutableTeamState = TeamState & SeamlessImmutable.ImmutableObject<TeamState>;

/** the Team reducer function */
export default function reducer(state = initialTeamState, action: TeamActionTypes) {
  switch (action.type) {
    default:
      return state;
  }
}

// selectors

/** Get single Team by the given id
 * @param {Partial<Store>} state - Part of the redux store
 * @param {string} teamId - filters team data to be returned based on this id
 *
 * @return {Team | null} - A team object if found else null
 */
export function getTeamById(state: Partial<Store>, teamId: string): Team | null {
  return get((state as any)[reducerName].teamsById, teamId) || null;
}
