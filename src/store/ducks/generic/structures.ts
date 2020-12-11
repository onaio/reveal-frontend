import { Feature, Geometry } from 'geojson';
import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FeatureCollection, wrapFeatureCollection } from '../../../helpers/utils';
/** the reducer name */
export const reducerName = 'GenericStructures';

/** Generic Structure GeoJSON */
export interface GenericStructureProperties {
  business_status: string;
  eligibility: string;
  event_date: string;
  plan_id: string | null;
  rooms_eligible: number;
  rooms_sprayed: number;
  structure_code: string;
  structure_jurisdiction_id: string;
  structure_name: string;
  structure_sprayed: string;
  structure_type: string;
  task_id: string | null;
  found_structures: number;
  structures_recieved_spaq: number;
  treated_children: number;
  referred_children: number;
}

/** GenericStructure interface */
export interface GenericStructure {
  geojson: Feature<Geometry, GenericStructureProperties>;
  id?: string;
  jurisdiction_id: string;
  plan_id: string | null;
  structure_id: string;
  task_id: string | null;
}

/** Structures feature collection type  */
export type StructureFeatureCollection = FeatureCollection<
  Feature<Geometry, GenericStructureProperties>
>;

// actions

/** GENERIC_STRUCTURE_FETCHED action type */
export const GENERIC_STRUCTURES_FETCHED =
  'reveal/reducer/IRS/GenericStructure/GENERIC_STRUCTURES_FETCHED';

/** GENERIC_STRUCTURE_FETCHED action type */
export const REMOVE_GENERIC_STRUCTURES =
  'reveal/reducer/IRS/GenericStructure/REMOVE_GENERIC_STRUCTURES';

/** GENERIC_STRUCTURE_FETCHED action type */
export const ADD_GENERIC_STRUCTURE = 'reveal/reducer/IRS/GenericStructure/ADD_GENERIC_STRUCTURE';

/** interface for fetch GenericStructures action */
interface FetchGenericStructuresAction extends AnyAction {
  objects: { [key: string]: GenericStructure };
  reducerKey: string;
  type: typeof GENERIC_STRUCTURES_FETCHED;
}

/** interface for removing GenericStructures action */
interface RemoveGenericStructuresAction extends AnyAction {
  objects: { [key: string]: GenericStructure };
  reducerKey: string;
  type: typeof REMOVE_GENERIC_STRUCTURES;
}

/** interface for adding a single GenericStructures action */
interface AddGenericStructureAction extends AnyAction {
  obj: GenericStructure;
  reducerKey: string;
  type: typeof ADD_GENERIC_STRUCTURE;
}

/** Create type for GenericStructure reducer actions */
export type GenericStructureActionTypes =
  | FetchGenericStructuresAction
  | RemoveGenericStructuresAction
  | AddGenericStructureAction
  | AnyAction;

// action creators
/**
 * process structures - converts structure stringfied json to json
 * @param {GenericStructure[]} structures - list of generic structure objects
 */
export const processStructures = (structures: GenericStructure[]) => {
  return structures.map(
    (structure: GenericStructure): GenericStructure => {
      /** ensure geojson is parsed */
      if (typeof structure.geojson === 'string') {
        structure.geojson = JSON.parse(structure.geojson);
      }
      /** ensure geometry is parsed */
      if (typeof structure.geojson.geometry === 'string') {
        structure.geojson.geometry = JSON.parse(structure.geojson.geometry);
      }
      return structure;
    }
  );
};

/**
 * Fetch Generic Structures action creator
 * @param {string} reducerKey - they reducer key
 * @param {GenericStructure[]} objList - list of generic structure objects
 */
export const fetchGenericStructures = (
  reducerKey: string = 'GenericStructuresById',
  objList: GenericStructure[] = []
): FetchGenericStructuresAction => {
  const objects =
    objList.length && objList[0].id
      ? keyBy(processStructures(objList), 'id')
      : keyBy(processStructures(objList), 'structure_id');
  return {
    objects,
    reducerKey,
    type: GENERIC_STRUCTURES_FETCHED,
  };
};

/** Reset generic structures state action creator
 * @param {string} reducerKey - they reducer key
 */
export const removeGenericStructures = (reducerKey: string = 'GenericStructuresById') => ({
  objects: {},
  reducerKey,
  type: REMOVE_GENERIC_STRUCTURES,
});

/**
 * Add one Generic Structure action creator
 * @param {GenericStructure} obj - the generic structure object
 * @param {string} reducerKey - they reducer key
 */
export const addGenericStructure = (
  reducerKey: string = 'GenericStructuresById',
  obj: GenericStructure
): AddGenericStructureAction => ({
  obj,
  reducerKey,
  type: ADD_GENERIC_STRUCTURE,
});

// the reducer

/** interface for GenericStructure state */
interface GenericStructureState {
  [key: string]: {
    [key: string]: GenericStructure;
  };
}

type FullGenericStructureState = GenericStructureState | {};

/** immutable GenericStructure state */
export type ImmutableGenericStructureState = FullGenericStructureState &
  SeamlessImmutable.ImmutableObject<FullGenericStructureState>;

/** initial GenericStructure state */
const initialState: ImmutableGenericStructureState = SeamlessImmutable({});

/** the GenericStructure reducer function */
export default function reducer(
  state: any = initialState /** dirty hack, need to replace any */,
  action: GenericStructureActionTypes
): ImmutableGenericStructureState {
  switch (action.type) {
    case GENERIC_STRUCTURES_FETCHED:
      if (action.objects) {
        return SeamlessImmutable({
          ...state,
          [action.reducerKey]: { ...state[action.reducerKey], ...action.objects },
        });
      }
      return state;
    case ADD_GENERIC_STRUCTURE:
      if (action.obj as GenericStructure) {
        return SeamlessImmutable({
          ...state,
          [action.reducerKey]: {
            ...state[action.reducerKey],
            [action.obj.structure_id as string]: action.obj,
          },
        });
      }
      return state;
    case REMOVE_GENERIC_STRUCTURES:
      return SeamlessImmutable({
        ...state,
        [action.reducerKey]: action.objects,
      });
    default:
      return state;
  }
}

// selectors

/** Gets a FeatureCollection of Generic structures
 * @param {Partial<Store>} state - the redux store
 * @param {string} reducerKey - they reducer key
 * @param {string | null} jurisdictionId - the jurisdiction id
 * @param {string | null} planId - the plan id
 */
export function getGenericStructures(
  state: Partial<Store>,
  reducerKey: string = 'GenericStructuresById',
  jurisdictionId: string | null = null,
  planId: string | null = null,
  structureType: string[] | null = null
): StructureFeatureCollection {
  let structures = values((state as any)[reducerName][reducerKey]);
  if (jurisdictionId) {
    structures = structures.filter(
      (structure: GenericStructure) => structure.jurisdiction_id === jurisdictionId
    );
  }
  if (planId) {
    structures = structures.filter((structure: GenericStructure) => structure.plan_id === planId);
  }
  if (structureType) {
    structures = structures.filter(structure =>
      structureType.includes(structure?.geojson?.geometry?.type)
    );
  }
  return wrapFeatureCollection(structures.map((structure: GenericStructure) => structure.geojson));
}
