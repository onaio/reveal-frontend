import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import Logout, { logoutFromAuthServer } from '..';
import { OPENSRP_LOGOUT_URL } from '../../../configs/env';

describe('gatekeeper/utils/logoutFromAuthServer', () => {
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
});
