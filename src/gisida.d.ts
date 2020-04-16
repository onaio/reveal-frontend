declare module 'gisida' {
  import { Dictionary } from '@onaio/utils';
  import { Map as mbMap } from 'mapbox-gl';
  import { ParseResult } from 'papaparse';
  import { AnyAction } from 'redux';

  /** interface for generic object */
  export interface GisidaMap extends mbMap {
    _container: Dictionary;
  }

  /** Method that returns state */
  declare function returnState(): Dictionary;

  /** Layer object */
  const layerObj: Dictionary;

  /** interface for gisida actions */
  export interface ActionsInterface {
    initApp: (config: Dictionary) => AnyAction;
    initStyles: (styles: any, mapConfig: Dictionary) => AnyAction;
    initRegions: AnyAction;
    mapRendered: AnyAction;
    mapLoaded: AnyAction;
    addLayer: (id: string, layerObj: layerObj) => AnyAction;
    addLayerGroup: AnyAction;
    reloadLayer: AnyAction;
    layerReloaded: AnyAction;
    reloadLayers: AnyAction;
    toggleLayer: (mapId: string, layerId: string, isInit?: boolean) => AnyAction;
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
  export const Actions: ActionsInterface;

  /** Callback function called within loadJSON */
  export declare function loadJSONCallback(jsonResponse: Dictionary, id: string): void;

  /** Callback function called within loadCSV */
  export declare function loadCSVCallback(parsedResponse: ParseResult): void;

  /** interface for files object */
  interface Files {
    loadJSON: (path: string, callback: loadJSONCallback) => void;
    loadCSV: (path: string, callback: loadCSVCallback) => void;
  }

  /** files object */
  export const files: Files;

  /** Dispatches actions indicating layer is ready to render */
  export declare function prepareLayer(
    mapId: string,
    layer: Dictionary,
    dispatch: (action: AnyAction) => void,
    filterOptions: boolean = false,
    doUpdateTsLayer: boolean = false
  ): void;

  /** interface for reducers object */
  interface Reducers {
    [key: string]: any;
  }
  /** reducers object */
  export const reducers: Reducers;

  /** interface for ducks object */
  interface Ducks {
    [key: string]: any;
  }
  /** ducks object */
  export const ducks: Ducks;
  export declare function loadLayers(mapId: string, dispatch: any, layers: any): any;
  export declare function addConfigToStore(store: any, config: Dictionary): any;
}
