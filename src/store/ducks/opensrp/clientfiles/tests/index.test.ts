/** Test file for the practitioners ducks module */
import reducerRegistry from '@onaio/redux-reducer-registry';
import { FlushThunks } from 'redux-testkit';
import reducer, {
  fetchFiles,
  getFilesArray,
  getFilesById,
  reducerName,
  removeFilesAction,
} from '..';
import store from '../../../..';
// import { extractEvent, extractEvents, friendlyDate } from '../utils';
import { uploadedStudentsLists, uploadedStudentsLists1 } from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/files.reducer.FetchFilesAction', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removeFilesAction);
  });

  it('selectors work for empty initialState', () => {
    expect(getFilesById(store.getState())).toEqual({});
    expect(getFilesArray(store.getState())).toEqual([]);
  });

  it('fetches files correctly', () => {
    store.dispatch(fetchFiles([uploadedStudentsLists[0]]));
    expect(getFilesById(store.getState())).toEqual({
      '1234': {
        fileLength: 45,
        fileName: 'Gicandi_school.csv',
        fileSize: '234KB',
        identifier: '1234',
        lastUpdated: '4/05/2020',
        owner: 'Mowshaqs',
        url:
          'https://user-images.githubusercontent.com/12836913/81139056-3be46680-8f19-11ea-92f8-fb1ab7877626.png',
      },
    });
  });

  it('removes Files correctly', () => {
    store.dispatch(fetchFiles(uploadedStudentsLists));
    let numberOfClients = getFilesArray(store.getState()).length;
    expect(numberOfClients).toEqual(3);

    store.dispatch(removeFilesAction);
    numberOfClients = getFilesArray(store.getState()).length;
    expect(numberOfClients).toEqual(0);
  });

  it('dispatches Files correctly on non-empty state', () => {
    store.dispatch(fetchFiles([uploadedStudentsLists[0]]));
    let clients = getFilesById(store.getState());
    expect(clients).toEqual({
      '1234': {
        fileLength: 45,
        fileName: 'Gicandi_school.csv',
        fileSize: '234KB',
        identifier: '1234',
        lastUpdated: '4/05/2020',
        owner: 'Mowshaqs',
        url:
          'https://user-images.githubusercontent.com/12836913/81139056-3be46680-8f19-11ea-92f8-fb1ab7877626.png',
      },
    });

    store.dispatch(fetchFiles(uploadedStudentsLists1));
    clients = getFilesById(store.getState());
    expect(clients).toEqual({
      '1234': {
        fileLength: 45,
        fileName: 'Gicandi_school.csv',
        fileSize: '234KB',
        identifier: '1234',
        lastUpdated: '4/05/2020',
        owner: 'Mowshaqs',
        url:
          'https://user-images.githubusercontent.com/12836913/81139056-3be46680-8f19-11ea-92f8-fb1ab7877626.png',
      },
      '123456': {
        fileLength: 767,
        fileName: 'Mt View.csv',
        fileSize: '234KB',
        identifier: '123456',
        lastUpdated: '4/05/2020',
        owner: 'Mowshaqs',
        url:
          'https://user-images.githubusercontent.com/12836913/81139056-3be46680-8f19-11ea-92f8-fb1ab7877626.png',
      },
    });
  });
});
