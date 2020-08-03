import { HTTPError, NetworkError } from '@opensrp/server-service';
import { toast } from 'react-toastify';
import { ACCESS_DENIED, NETWORK_ERROR, USER_HAS_NO_VALID_ASSIGNMENTS } from '../../configs/lang';
import { apiPlansErrorObject, displayError } from '../errors';
import * as helperUtils from '../utils';

jest.mock('../../configs/env');

describe('helpers/errors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const envModule = require('../../configs/env');
    envModule.TOAST_AUTO_CLOSE_DELAY = 5000;
  });

  it('displayError works with error object', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    displayError(new Error('I love oov'));

    expect(mockGrowl).toHaveBeenCalledWith('I love oov', {
      autoClose: 5000,
      type: toast.TYPE.ERROR,
    });
  });

  it('displayError works with custom error message', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    displayError(new Error('I love oov'), 'insert custom message');

    expect(mockGrowl).toHaveBeenCalledWith('insert custom message', {
      autoClose: 5000,
      type: toast.TYPE.ERROR,
    });
  });

  it('displayError works with false autoClose', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    displayError(new Error('Task failed successfully'), '', false);

    expect(mockGrowl).toHaveBeenCalledWith('Task failed successfully', {
      autoClose: false,
      type: toast.TYPE.ERROR,
    });
  });

  it('displays HTTP error messages correctly', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    const mockResponse: any = { status: 403, url: '' };
    const error = new HTTPError(mockResponse, '');
    displayError(error);

    expect(mockGrowl).toHaveBeenCalledWith(ACCESS_DENIED, {
      autoClose: 5000,
      type: toast.TYPE.ERROR,
    });
  });

  it('displays invalid plans assignment error correctly', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    const mockResponse: any = { status: 500, url: 'http://reveal-stage/rest/plans/user/someUser' };
    const error = new HTTPError(mockResponse, apiPlansErrorObject);
    displayError(error);

    expect(mockGrowl).toHaveBeenCalledWith(USER_HAS_NO_VALID_ASSIGNMENTS, {
      autoClose: 5000,
      type: toast.TYPE.ERROR,
    });
  });

  it('displays error for network requests', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    const error = new NetworkError();
    displayError(error);

    expect(mockGrowl).toHaveBeenCalledWith(NETWORK_ERROR, {
      autoClose: 5000,
      type: toast.TYPE.ERROR,
    });
  });
});
