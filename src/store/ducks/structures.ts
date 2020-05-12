import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FeatureCollection, Geometry, wrapFeatureCollection } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'structures';

/** Interface for structure.geojson.properties for structure
 *  as received from the fetch request / superset
 */
export interface StructureProperties {
  uid: string;
  code: string;
  name: string;
  type: string;
  status: string;
  version: number;
  server_version: number;
  jurisdiction_id: string;
  geographic_level: number | null;
  effective_end_date: string | null;
  effective_start_date: string | null;
}

/** StructureGeoJSON Object Interface */
export interface StructureGeoJSON {
  geometry: Geometry | null;
  id: string;
  properties: StructureProperties;
  type: string;
}

/** interface for structure Object for
 * structure as received from the fetch request / superset
 */
export interface Structure {
  geojson: StructureGeoJSON;
  id: string;
  jurisdiction_id: string;
}

// actions

/** STRUCTURES_SET action type */
export const STRUCTURES_SET = 'reveal/reducer/structures/STRUCTURES_SET';
/** REMOVE_STRUCTURES action type */
export const REMOVE_STRUCTURES = 'reveal/reducer/structures/REMOVE_STRUCTURES';

/** interface for setStructure action */
export interface SetStructuresAction extends AnyAction {
  structuresById: { [key: string]: Structure };
  type: typeof STRUCTURES_SET;
}

/** interface for RemoveStructuresAction */
interface RemoveStructuresAction extends AnyAction {
  structuresById: {};
  type: typeof REMOVE_STRUCTURES;
}

/** Create type for Structure reducer actions */
export type StructureActionTypes = SetStructuresAction | RemoveStructuresAction | AnyAction;

/** interface for Structure state */
interface StructureState {
  structuresById: { [key: string]: Structure } | {};
}

/** immutable Structure state */
export type ImmutableStructureState = StructureState &
  SeamlessImmutable.ImmutableObject<StructureState>;

/** initial Structure state */
const initialState: ImmutableStructureState = SeamlessImmutable({
  structuresById: {},
});

/** the Structure reducer function */
export default function reducer(
  state = initialState,
  action: StructureActionTypes
): ImmutableStructureState {
  switch (action.type) {
    case STRUCTURES_SET:
      if (action.structuresById) {
        return SeamlessImmutable({
          ...state,
          structuresById: { ...state.structuresById, ...action.structuresById },
        });
      }
      return state;
    case REMOVE_STRUCTURES:
      return SeamlessImmutable({
        ...state,
        structuresById: action.structuresById,
      });
    default:
      return state;
  }
}

// action creators

/** set Structure creator
 * @param {Structure[]} structuresList - array of structure objects
 */
export const setStructures = (structuresList: Structure[] = []): SetStructuresAction => {
  return {
    structuresById: keyBy(
      structuresList.map(
        (structure: Structure): Structure => {
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
      ),
      structure => structure.id
    ),
    type: STRUCTURES_SET,
  };
};

// actions
export const removeStructuresAction: RemoveStructuresAction = {
  structuresById: {},
  type: REMOVE_STRUCTURES,
};

// selectors

/** get Structures FeatureCollection
 * Structures are tasks whose geometry is of type Polygon
 * @param {Partial<Store>} state - the redux store
 * @returns {FeatureCollection} - a geoJSON Feature Collection object
 */
export function getAllStructuresFC(state: Partial<Store>): FeatureCollection<StructureGeoJSON> {
  return wrapFeatureCollection(
    values(
      values((state as any)[reducerName].structuresById).map(
        (eachStructure: Structure) => eachStructure.geojson
      )
    )
  );
}

/** responsible for only getting structure geojson data for all structures from reducer
 * @param {Partial<Store>} state - the store state
 * @param {boolean} includeNullGeoms - if to include structures with null geometries in FC
 * @return {StructureGeoJSON []} - returns a list of all structures geojson whose geoms are not null
 */
export function getStructuresGeoJsonData(
  state: Partial<Store>,
  includeNullGeoms: boolean = true
): StructureGeoJSON[] {
  let results = values((state as any)[reducerName].structuresById).map(e => e.geojson);
  if (!includeNullGeoms) {
    results = results.filter(e => e && e.geometry);
  }
  return results;
}

/** get structures as FeatureCollection filtered by jurisdiction_id
 * @param {partial<Store>} state - the redux store
 * @param {string} jurisdictionId - the jurisdiction id
 * @param {boolean} includeNullGeoms - if to include features with null geometries in FC
 * @return {FeatureCollection} - an geoJSON Feature Collection object
 */
export function getStructuresFCByJurisdictionId(
  state: Partial<Store>,
  jurisdictionId: string,
  includeNullGeoms: boolean = true
): FeatureCollection<StructureGeoJSON> {
  const geoJsonFeatures: StructureGeoJSON[] = getStructuresGeoJsonData(
    state,
    includeNullGeoms
  ).filter(e => e.properties.jurisdiction_id === jurisdictionId);
  return wrapFeatureCollection(geoJsonFeatures);
}
