declare module 'gisida' {
  import { ParseResult } from 'papaparse';
  import { AnyAction } from 'redux';

  /** interface for generic object */
  interface FlexObject {
    [key: string]: any;
  }

  /** Method that returns state */
  type returnState = () => FlexObject;

  /** interface for gisida actions */
  export interface ActionsInterface {
    initApp: AnyAction;
    initStyles: AnyAction;
    initRegions: AnyAction;
    mapRendered: AnyAction;
    mapLoaded: AnyAction;
    addLayer: AnyAction;
    addLayerGroup: AnyAction;
    reloadLayer: AnyAction;
    layerReloaded: AnyAction;
    reloadLayers: AnyAction;
    toggleLayer: AnyAction;
    toggleFilter: AnyAction;
    toggleMenu: AnyAction;
    requestData: AnyAction;
    updatePrimaryLayer: AnyAction;
    receiveData: AnyAction;
    changeRegion: AnyAction;
    changeStyle: AnyAction;
    getCurrentState: () => returnState;
    updateTimeseries: AnyAction;
    detailView: AnyAction;
    resetFilteredLayer: AnyAction;
    setLayerFilter: AnyAction;
    filtersUpdated: AnyAction;
    saveFilterState: AnyAction;
    triggerSpinner: AnyAction;
    toggleCategories: AnyAction;
  }

  /** Gisida actions */
  export type Actions = ActionsInterface;

  /** Type def. for callback called within loadJSON */
  export type loadJSONCallback = (jsonResponse: FlexObject) => void;

  /** Type def. for callback called within loadCSV */
  export type loadCVSCallback = (parsedResponse: ParseResult) => void;

  /** interface for files object */
  export interface Files {
    loadJSON: (path: string, callback: loadJSONCallback) => void;
    loadCSV: (path: string, callback: loadCVSCallback) => void;
  }

  /** Object to load files, currently handles JSON and CSV files */
  export type files = Files;

  /** Dispatches actions indicating layer is ready to render */
  export type prepareLayer = (
    mapId: string,
    layer: FlexObject,
    dispatch: () => void,
    filterOptions: boolean,
    doUpdateTsLayer: boolean
  ) => void;
}
