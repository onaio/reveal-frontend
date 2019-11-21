/** Tests for growl util */
import { toast } from 'react-toastify';
import { growl } from '../utils';

jest.mock('react-toastify', () => {
  const mockToast: any = jest.fn();
  mockToast.TYPE = {
    DEFAULT: 'default',
    ERROR: 'error',
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
  };
  mockToast.configure = jest.fn();
  return {
    toast: mockToast,
  };
});

describe('src/helpers/utils', () => {
  it('growl creates correct object for sucess', () => {
    growl('message', {
      type: toast.TYPE.SUCCESS,
    });
    const expected = {
      className: 'alert alert-success',
      progressClassName: 'success-toast-progress',
      type: 'success',
    };
    expect(toast).toHaveBeenCalledWith('message', expected);
  });

  it('growl creates correct object for info', () => {
    growl('message', {
      type: toast.TYPE.INFO,
    });
    const expected = {
      className: 'alert alert-info',
      progressClassName: 'info-toast-progress',
      type: 'info',
    };
    expect(toast).toHaveBeenCalledWith('message', expected);
  });

  it('growl creates correct object for warning', () => {
    growl('message', {
      type: toast.TYPE.WARNING,
    });
    const expected = {
      className: 'alert alert-warning',
      progressClassName: 'warning-toast-progress',
      type: 'warning',
    };
    expect(toast).toHaveBeenCalledWith('message', expected);
  });

  it('growl creates correct object for error', () => {
    growl('message', {
      type: toast.TYPE.ERROR,
    });
    const expected = {
      className: 'alert alert-danger',
      progressClassName: 'danger-toast-progress',
      type: 'error',
    };
    expect(toast).toHaveBeenCalledWith('message', expected);
  });

  it('growl creates correct object for default', () => {
    growl('message', {
      type: toast.TYPE.DEFAULT,
    });
    const expected = {
      className: 'alert alert-light',
      progressClassName: 'light-toast-progress',
      type: 'default',
    };
    expect(toast).toHaveBeenCalledWith('message', expected);
  });

  it('growl creates correct object for no type', () => {
    growl('message');
    const expected = {
      className: 'alert alert-light',
      progressClassName: 'light-toast-progress',
    };
    expect(toast).toHaveBeenCalledWith('message', expected);
  });
});
