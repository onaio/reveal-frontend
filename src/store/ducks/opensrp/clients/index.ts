import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'client';

/** Interface for client json object */
export interface Client {
  age: number; // the age of the client (for reporting)
  identifier: string; // the baseEntityId of the client
  groupIdentifier: string; // the location id of the distribution point
}

// actions

/** action type for fetching clients */
export const CLIENTS_FETCHED = 'opensrp/reducer/clients/CLIENTS_FETCHED';
/** action type for removing clients */
export const REMOVE_CLIENTS = 'opensrp/reducer/clients/REMOVE_CLIENTS';

/** interface action to add Clients to store */
export interface FetchClientsAction extends AnyAction {
  overwrite: boolean;
  clientsById: { [key: string]: Client };
  type: typeof CLIENTS_FETCHED;
}

/** Interface for removeClientsAction */
export interface RemoveClientsAction extends AnyAction {
  clientsById: {};
  type: typeof REMOVE_CLIENTS;
}

/** Create type for clients reducer actions */
export type ClientActionTypes = FetchClientsAction | RemoveClientsAction | AnyAction;

// action Creators

/** Fetch clients action creator
 * @param {Practitioner []} clientsList - clients array to add to store
 * @param {Client[]} clientsList - clients array to add to store
 * @param {boolean} overwrite - whether to replace the records in store for clients
 * @return {FetchClientsAction} - an action to add clients to redux store
 */
export const fetchClients = (
  clientsList: Client[] = [],
  overwrite: boolean = false
): FetchClientsAction => ({
  clientsById: keyBy(clientsList, (client: Client) => client.identifier),
  overwrite,
  type: CLIENTS_FETCHED,
});

// actions

/** removeClientsAction action */
export const removeClientsAction = {
  clientsById: {},
  type: REMOVE_CLIENTS,
};

// The reducer

/** interface for clients state in redux store */
export interface ClientState {
  clientsById: { [key: string]: Client } | {};
}

/** Create an immutable clients state */
export type ImmutableClientState = ClientState & SeamlessImmutable.ImmutableObject<ClientState>;

/** initial practitioners-state state */
export const initialState: ImmutableClientState = SeamlessImmutable({
  clientsById: {},
});

/** the clients reducer function */
export default function reducer(
  state: ImmutableClientState = initialState,
  action: ClientActionTypes
): ImmutableClientState {
  switch (action.type) {
    case CLIENTS_FETCHED:
      const clientsToPut = action.overwrite
        ? { ...action.clientsById }
        : { ...state.clientsById, ...action.clientsById };
      return SeamlessImmutable({
        ...state,
        clientsById: clientsToPut,
      });
    case REMOVE_CLIENTS: {
      return SeamlessImmutable({
        ...state,
        clientsById: action.clientsById,
      });
    }
    default:
      return state;
  }
}

// Selectors

/** Get all Clients keyed by Client.identifier
 * @param {Partial<Store>} state - Portion of the store
 * @returns {[key: string]: Client} clientsById
 */
export const getClientsById = (state: Partial<Store>): { [key: string]: Client } => {
  return (state as any)[reducerName].clientsById;
};

/** Get all clients as an array of Client objects
 * @param {Partial<Store>} state - the redux store
 * @returns {Client[]} - an array of Client objects
 */
export const getClientsArray = (state: Partial<Store>): Client[] => {
  return values(getClientsById(state));
};

/** Get clients per site as an array of Client objects
 * @param {Partial<Store>} state - the redux store
 * @param {string} groupId - the site ID of the filter by
 * @returns {Client[]} - an array of Client objects
 */
export const getClientsArrayByGroupId = (state: Partial<Store>, groupId: string): Client[] => {
  return getClientsArray(state).filter((client: Client) => client.groupIdentifier === groupId);
};

/** Get clients per site as a an object: clientsByGroupId
 * @param {Partial<Store>} state - the redux store
 * @param {string} groupId - the site ID of the filter by
 * @returns {{[key: string]: Client[]}} clientsByGroupId
 */
export const getClientsByGroupId = (
  state: Partial<Store>,
  groupId: string[]
): { [key: string]: Client[] } => {
  const clientsByGroupId: { [key: string]: Client[] } = {};

  for (let i = 0; i < getClientsArray(state).length; i += 1) {
    clientsByGroupId[groupId[i]] = getClientsArrayByGroupId(state, groupId[i]);
  }

  return clientsByGroupId;
};
