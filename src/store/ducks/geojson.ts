import { ActionCreator, AnyAction, Store } from 'redux';

export const reducerName = 'geojson';

// interface GeoJSON {
//   user: string;
//   message: string;
// }

// actions
export const FETCH_GEOJSON = 'reveal/reducer/geojson/FETCH_GEOJSON';

interface FetchGeoJSONAction extends AnyAction {
  data: any;
  type: typeof FETCH_GEOJSON;
}

export type GeoJSONActionTypes = FetchGeoJSONAction | AnyAction;

interface GeoJSONState {
  data: any;
}

const initialState: GeoJSONState = {
  data: [],
};

export default function reducer(state = initialState, action: GeoJSONActionTypes): GeoJSONState {
  switch (action.type) {
    case FETCH_GEOJSON:
      if (action.data) {
        return {
          ...state,
          data: action.data,
        };
      }
      return state;
    default:
      return state;
  }
}

// action creators
export const fetchGeoJSON = (newGeoJSON: any) => ({
  data: newGeoJSON,
  type: FETCH_GEOJSON,
});

// actions

// export const fetchGeoJSON = (data: []): FetchGeoJSONAction => {
//     return {
//     data,
//     type: FETCH_GEOJSON,
//     };
//     };

// selectors
export function getGeoJSONs(state: Partial<Store>) {
  return (state as any)[reducerName].data;
}

// export function fetchGeoJSONData() {
//   fetch('/config/data/opensrplocations.json') // todo - replace this with endpoint or connector
//     .then(res => res.json())
//     .then((data: any) => {
//       return data;
//     });
// }
