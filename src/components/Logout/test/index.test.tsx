import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import Logout, { logoutFromAuthServer } from '..';
import { EXPRESS_OAUTH_LOGOUT_URL, OPENSRP_LOGOUT_URL } from '../../../configs/env';

jest.useFakeTimers();

describe('gatekeeper/utils/logoutFromAuthServer', () => {
  beforeEach(() => {
    window.open = jest.fn();
  });

  it('renders without crashing', () => {
    shallow(<Logout logoutURL={OPENSRP_LOGOUT_URL} />);
  });

  it('Renders Logout button correctly', () => {
    const wrapper = mount(<Logout logoutURL={OPENSRP_LOGOUT_URL} />);
    expect(toJson(wrapper.find('Logout'))).toMatchSnapshot();
    wrapper.unmount();
  });

  it('calls window.open', () => {
    window.open = jest.fn();
    logoutFromAuthServer(OPENSRP_LOGOUT_URL);
    expect(window.open).toBeCalledWith(OPENSRP_LOGOUT_URL);
  });

  it('calls href with express logout', () => {
    delete window.location;
    const hrefMock = jest.fn();
    (window.location as any) = {
      set href(url: string) {
        hrefMock(url);
      },
    };
    jest.runAllTimers();
    expect(hrefMock).toHaveBeenCalledWith(EXPRESS_OAUTH_LOGOUT_URL);
  });
});
