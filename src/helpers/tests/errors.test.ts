import { toast } from 'react-toastify';
import { displayError } from '../errors';
import * as helperUtils from '../utils';

describe('helpers/errors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('displayError works with error object', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    displayError(new Error('I love oov'));

    expect(mockGrowl).toHaveBeenCalledWith('I love oov', {
      type: toast.TYPE.ERROR,
    });
  });

  it('displayError works with custom error message', () => {
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;

    displayError(new Error('I love oov'), 'insert custom message');

    expect(mockGrowl).toHaveBeenCalledWith('insert custom message', {
      type: toast.TYPE.ERROR,
    });
  });
});
