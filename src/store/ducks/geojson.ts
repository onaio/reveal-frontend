import { get, keyBy, keys, values } from 'lodash';
import { ActionCreator, AnyAction, Store } from 'redux';
import { FlexObject } from '../../helpers/utils';

export const reducerName = 'geojson';

export interface GeoJSON {
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_parent_id: string;
  geometry: FlexObject;
}

// actions
export const FETCH_GEOJSON = 'reveal/reducer/geojson/FETCH_GEOJSON';

interface FetchGeoJSONAction extends AnyAction {
  geoJSONById: { [key: string]: GeoJSON };
  // geoJSONByPlanId: { [key: string]: GeoJSON };
  type: typeof FETCH_GEOJSON;
}

export type GeoJSONActionTypes = FetchGeoJSONAction | AnyAction;

interface GeoJSONState {
  geoJSONById: { [key: string]: GeoJSON };
}

const initialState: GeoJSONState = {
  geoJSONById: {},
};
// reducer
export default function reducer(state = initialState, action: GeoJSONActionTypes): GeoJSONState {
  switch (action.type) {
    case FETCH_GEOJSON:
      if (action.geoJSONById) {
        return {
          ...state,
          geoJSONById: action.geoJSONById,
        };
      }
      return state;
    default:
      return state;
  }
}

// action creators
export const fetchGeoJSON = (newGeoJSON: GeoJSON[]) => {
  return {
    geoJSONById: keyBy(newGeoJSON, geojson => geojson.jurisdiction_id),
    type: FETCH_GEOJSON,
  };
};
// selectors
export function getGeoJSONs(state: Partial<Store>, id: string) {
  return get((state as any)[reducerName].geoJSONById, id) || null;
}
