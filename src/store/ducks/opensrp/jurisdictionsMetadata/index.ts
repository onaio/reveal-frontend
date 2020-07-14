import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** reducer name */
export const reducerName = 'jurisdictionsMetadata';

/**  Jurisdiction metadata interface */
export interface JurisdictionsMetadata {
  key: string;
  value: string;
}

/**  JURISDICTIONS_METADATA_FETCHED action type */
export const JURISDICTIONS_METADATA_FETCHED =
  'src/store/ducks/jurisdictionsMetadata/reducer/JURISDICTIONS_METADATA_FETCHED';

/** JURISDICTIONS_METADATA_FETCHED action interface */
export interface FetchJurisdictionsMetadataAction extends AnyAction {
  jurisdictionsMetadata: JurisdictionsMetadata[];
  type: typeof JURISDICTIONS_METADATA_FETCHED;
}

/** Type for jurisdictions metadata reducer actions */

type JurisdictionsMetadataActionTypes = FetchJurisdictionsMetadataAction | AnyAction;

/**  Jurisdiction metadata state interface */
export interface JurisdictionsMetadataStoreState {
  jurisdictionsMetadata: JurisdictionsMetadata[];
}

/** define immutable jurisdictions metadata state object */

export type ImmutableJurisdictionsMetadataStoreState = JurisdictionsMetadataStoreState &
  SeamlessImmutable.ImmutableObject<JurisdictionsMetadataStoreState>;

/** Jurisdiction metadata action */

export const fetchJurisdictionsMetadata = (
  jurisdictionsMetadata: JurisdictionsMetadata[]
): FetchJurisdictionsMetadataAction => {
  return {
    jurisdictionsMetadata,
    type: JURISDICTIONS_METADATA_FETCHED,
  };
};

/** define initial state for jurisdictions metadata */

export const initialState: ImmutableJurisdictionsMetadataStoreState | any = SeamlessImmutable({
  jurisdictionsMetadata: [],
});

/**
 *
 * @param state
 * @param action
 */

/** JurisdictionsMetadata reducer function */

export default function reducer(
  state = initialState,
  action: JurisdictionsMetadataActionTypes
): ImmutableJurisdictionsMetadataStoreState {
  switch (action.type) {
    case JURISDICTIONS_METADATA_FETCHED:
      return SeamlessImmutable({
        ...state,
        jurisdictionsMetadata: action.jurisdictionsMetadata,
      });
    default:
      return state;
  }
}

/**
 *
 * @param {Partial<Store>} state
 */

/** get jurisdictions metadata froms state */

export function getJurisdictionsMetadata(state: Partial<Store>): JurisdictionsMetadata[] {
  return (state as any)[reducerName].jurisdictionsMetadata;
}
