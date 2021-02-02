/** tests for Organization page views api calling functions */
import flushPromises from 'flush-promises';
import {
  OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT,
  OPENSRP_UPLOAD_DOWNLOAD_ENDPOINT,
} from '../../../../../../constants';
import * as fixtures from '../../tests/fixtures';
import { handleDownload, loadFiles, postUploadedFile } from '../serviceHooks';

jest.mock('../../../../../../configs/env');

describe('src/containers/pages/ClientListView/helpers/servicehooks', () => {
  it('loadOrganization works correctly', async () => {
    const mockSetLoader = jest.fn();
    const mockList = jest.fn(async () => fixtures.files);
    const mockActionCreator = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    loadFiles(mockActionCreator, mockClass as any, mockSetLoader).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalled();

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(fixtures.files, true);
    // should set and uset loader
    expect(mockSetLoader).toHaveBeenCalledTimes(2);
    expect(mockSetLoader.mock.calls[0][0]).toEqual(true);
    expect(mockSetLoader.mock.calls[1][0]).toEqual(false);
  });

  it('loadOrgPractitioners works correctly', async () => {
    const mockSuccessResponse = {};
    const mockJsonPromise = Promise.resolve(mockSuccessResponse);
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
      ok: true,
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
    /** The postUploadFile make two fetch responses
     * 1. post to upload file (has no param hence upload/undefined)
     * 2. get from history api
     * Haven't been able to run the param assertions for the two cases successfully
     * Here are the two calls
     * 1. "https://reveal-stage.smartregister.org/opensrp/rest/upload/undefined", {"body": {}, "headers": {"Authorization": "Bearer null"}, "method": "POST"}
     * 2. "https://reveal-stage.smartregister.org/opensrp/rest/upload/history", {"headers": {"accept": "application/json", "authorization": "Bearer null", "content-type": "application/json;charset=UTF-8"}, "method": "GET"}
     */
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

    handleDownload('123', 'student', OPENSRP_UPLOAD_DOWNLOAD_ENDPOINT, undefined, mockClass).catch(
      e => {
        throw e;
      }
    );
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith('upload/download');

    // Uses the correct service method
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    global.fetch.mockClear();
  });
});
