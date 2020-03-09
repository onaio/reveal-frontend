import { mount } from 'enzyme';
import React from 'react';
import { useConfirmOnBrowserUnload } from '../hooks';

const TestHook = ({ callback }: { callback: any }) => {
  callback();
  return null;
};

const testHook = (callback: any) => {
  mount(<TestHook callback={callback} />);
};

describe('Display confimation alert on browser unload', () => {
  it('should add beforeunload event successfully', async () => {
    const spyAddEvent = jest.spyOn(window, 'addEventListener');
    testHook(() => useConfirmOnBrowserUnload(true));
    window.dispatchEvent(new Event('beforeunload'));
    expect(spyAddEvent).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});
