import { keyBy, values } from 'lodash';
import { AnyAction, Store } from 'redux';
import SeamlessImmutable from 'seamless-immutable';

/** The reducer name */
export const reducerName = 'clientfiles';

/** Interface for file json object */
export interface File {
  identifier: string; // the unique identifier of the file
  fileLength?: number; // the length of the file (lines / rows)
  fileName: string; // the name of the file
  fileSize?: string; // the of the file
  uploadDate: string; // the date of the latest file update
  providerID: string; // the username of the file creator
  url: string; // download location of the file
}

// actions

/** action type for fetching clients */
export const FILES_FETCHED = 'opensrp/reducer/clients/FILES_FETCHED';
/** action type for removing clients */
export const REMOVE_FILES = 'opensrp/reducer/clients/REMOVE_FILES';

/** interface action to add Files to store */
export interface FetchFilesAction extends AnyAction {
  overwrite: boolean;
  filesById: { [key: string]: File };
  type: typeof FILES_FETCHED;
}

/** Interface for removeFilesAction */
export interface RemoveFilesAction extends AnyAction {
  filesById: {};
  type: typeof REMOVE_FILES;
}

/** Create type for file reducer actions */
export type FileActionTypes = FetchFilesAction | RemoveFilesAction | AnyAction;

// action Creators

/** Fetch files action creator
 * @param {File[]} clientsList - clients array to add to store
 * @param {boolean} overwrite - whether to replace the records in store for clients
 * @return {FetchFileAction} - an action to add clients to redux store
 */
export const fetchFiles = (
  filesList: File[] = [],
  overwrite: boolean = false
): FetchFilesAction => ({
  filesById: keyBy(filesList, (file: File) => file.identifier),
  overwrite,
  type: FILES_FETCHED,
});

// actions

/** removeFilesAction action */
export const removeFilesAction = {
  filesById: {},
  type: REMOVE_FILES,
};

// The reducer

/** interface for files state in redux store */
export interface FileState {
  filesById: { [key: string]: File } | {};
}

/** Create an immutable Files state */
export type ImmutableFileState = FileState & SeamlessImmutable.ImmutableObject<FileState>;

/** initial practitioners-state state */
export const initialState: ImmutableFileState = SeamlessImmutable({
  filesById: {},
});

/** the Files reducer function */
export default function reducer(
  state: ImmutableFileState = initialState,
  action: FileActionTypes
): ImmutableFileState {
  switch (action.type) {
    case FILES_FETCHED:
      const filesToPut = action.overwrite
        ? { ...action.filesById }
        : { ...state.filesById, ...action.filesById };
      return SeamlessImmutable({
        ...state,
        filesById: filesToPut,
      });
    case REMOVE_FILES: {
      return SeamlessImmutable({
        ...state,
        filesById: action.filesById,
      });
    }
    default:
      return state;
  }
}

// Selectors

/** Get all Files keyed by File.identifier
 * @param {Partial<Store>} state - Portion of the store
 * @returns {[key: string]: File} filesById
 */
export const getFilesById = (state: Partial<Store>): { [key: string]: File } => {
  return (state as any)[reducerName].filesById;
};

/** Get all Files as an array of File objects
 * @param {Partial<Store>} state - the redux store
 * @returns {File[]} - an array of File objects
 */
export const getFilesArray = (state: Partial<Store>): File[] => {
  return values(getFilesById(state));
};
