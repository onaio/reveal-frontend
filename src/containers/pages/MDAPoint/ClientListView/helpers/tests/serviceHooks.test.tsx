/** tests for Organization page views api calling functions */
import flushPromises from 'flush-promises';
import { OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT } from '../../../../../../constants';
import * as fixtures from '../../tests/fixtures';
import { handleDownload, loadFiles, postUploadedFile } from '../serviceHooks';

describe('src/containers/pages/ClientListView/helpers/servicehooks', () => {
  it('loadOrganization works correctly', async () => {
    const mockList = jest.fn(async () => fixtures.files);
    const mockActionCreator = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    loadFiles(mockActionCreator, mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalled();

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(fixtures.files, true);
  });

  it('loadOrgPractitioners works correctly', async () => {
    const mockSuccessResponse = {};
    const mockJsonPromise = Promise.resolve(mockSuccessResponse);
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
    } as any);
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);
    const setStateIfDone = jest.fn();
    const setFormSubmitstate = jest.fn();
    const file = new File(['student'], 'student.csv', {
      type: 'text/csv',
    });
    // tslint:disable-next-line: no-floating-promises
    postUploadedFile(file, setStateIfDone, setFormSubmitstate);
    await flushPromises();
    // makes a fetch for upload and another when loadingfiles
    expect(global.fetch).toHaveBeenCalledTimes(2);
    global.fetch.mockClear();
  });

  it('handleDownload works correctly', async () => {
    const mockReadFile = jest.fn(
      async () => new Blob(['greetings', 'hello'], { type: 'text/csv' })
    );
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        readFile: mockReadFile,
      };
    });

    handleDownload('123', 'student', undefined, mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith('upload/download');

    // Uses the correct service method
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    global.fetch.mockClear();
  });
});
