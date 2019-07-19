import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';
import { FeatureCollection, GeoJSON, UpdateType, wrapFeatureCollection } from '../../helpers/utils';

/** the reducer name */
export const reducerName = 'structures';

/** Interface for structure.geojson.properties for structure
 *  as received from the fetch request / superset
 */
export interface InitialProperties {
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

/** interface for structure.geojson for
 * structure as received from the fetch request / superset
 */
export type InitialStructureGeoJSON = GeoJSON;

/** interface for structure Object for
 * structure as received from the fetch request / superset
 */
export interface InitialStructure {
  geojson: InitialStructureGeoJSON;
  id: string;
  jurisdiction_id: string;
}

// actions
/** STRUCTURES_SET action type */
export const STRUCTURES_SET = 'reveal/reducer/structures/STRUCTURES_SET';

/** interface for setStructure action */
interface SetStructuresAction extends AnyAction {
  structuresById: { [key: string]: InitialStructure };
  type: typeof STRUCTURES_SET;
}

/** Create type for Structure reducer actions */
export type StructureActionTypes = SetStructuresAction | AnyAction;

/** interface for Structure state */
interface StructureState {
  structuresById: { [key: string]: InitialStructure };
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
          structuresById: action.structuresById,
        });
      }
      return state;
    default:
      return state;
  }
}

// action creators

/** set Structure creator
 * @param {Structure[]} structuresList - array of structure objects
 */
export const setStructures = (structuresList: InitialStructure[] = []): SetStructuresAction => {
  return {
    structuresById: keyBy(
      structuresList.map(
        (structure: InitialStructure): InitialStructure => {
          /** ensure geojson is parsed */
          if (typeof structure.geojson === 'string') {
            structure.geojson = JSON.parse(structure.geojson);
          }
          /** ensure geometry is parsed */
          if (typeof structure.geojson.geometry === 'string') {
            structure.geojson.geometry = JSON.parse(structure.geojson.geometry);
          }
          return structure as InitialStructure;
        }
      ),
      structure => structure.id
    ),
    type: STRUCTURES_SET,
  };
};

// selectors

/** get Structures FeatureCollection
 * Structures are tasks whose geometry is of type Polygon
 * @param {Partial<Store>} state - the redux store
 * @returns {FeatureCollection} - a geoJSON Feature Collection object
 */
export function getAllStructuresFC(
  state: Partial<Store>
): FeatureCollection<InitialStructureGeoJSON> {
  return wrapFeatureCollection(
    values(
      values((state as any)[reducerName].structuresById).map(
        (eachStructure: InitialStructure) => eachStructure.geojson
      )
    )
  );
}

/** responsible for only getting structure geojson data for all structures from reducer
 * @param {Partial<Store>} state - the store state
 * @param {boolean} includeNullGeoms - if to include structures with null geometries in FC
 * @return {InitialStructureGeoJSON []} - returns a list of all structures geojson whose geoms are not null
 */
export function getStructuresGeoJsonData(
  state: Partial<Store>,
  includeNullGeoms: boolean = true
): InitialStructureGeoJSON[] {
  let results = values((state as any)[reducerName].structuresById).map(e => e.geojson);
  if (!includeNullGeoms) {
    results = results.filter(e => e && e.geometry);
  } else {
    results = results;
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
): FeatureCollection<InitialStructureGeoJSON> {
  const geoJsonFeatures: InitialStructureGeoJSON[] = getStructuresGeoJsonData(
    state,
    includeNullGeoms
  ).filter(e => e.properties.jurisdiction_id === jurisdictionId);
  return wrapFeatureCollection(geoJsonFeatures);
}
