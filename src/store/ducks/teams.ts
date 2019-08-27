/** Organizations redux module */
import { get } from 'lodash';
import { Store } from 'redux';
import { AnyAction } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'organizations';

/** interface for an organization's address object */
interface OrganizationAddress {
  [key: string]: string;
}

/** interface for a Organization object */
export interface Organization {
  identifier: string;
  // is organization record still active
  active: boolean;
  // kind of organization
  type: string;
  name: string;
  alias: string[];
  address: OrganizationAddress[];
}

/** interface for Organizations state in store */
interface OrganizationState {
  organizationsById: { [key: string]: Organization };
}

/** initial state for Organizations records in store */
const initialOrganizationState: ImmutableOrganizationState = SeamlessImmutable({
  organizationsById: {},
});

/** single type for all action types */
type OrganizationActionTypes = AnyAction;

// immutable organization state in dux
export type ImmutableOrganizationState = OrganizationState &
  SeamlessImmutable.ImmutableObject<OrganizationState>;

/** the Organization reducer function */
export default function reducer(state = initialOrganizationState, action: OrganizationActionTypes) {
  switch (action.type) {
    default:
      return state;
  }
}

// selectors

/** Get single Organization by the given id
 * @param {Partial<Store>} state - Part of the redux store
 * @param {string} organizationId - filters organization data to be returned based on this id
 *
 * @return {Organization | null} - A organization object if found else null
 */
export function getOrganizationById(
  state: Partial<Store>,
  organizationId: string
): Organization | null {
  return get((state as any)[reducerName].organizationsById, organizationId) || null;
}
