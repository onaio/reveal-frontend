import { mount, ReactWrapper, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HeaderComponentWithRouter from '..';

const history = createBrowserHistory();

jest.mock('../../../../configs/env');

// initial attempt at breaking down the snapshot
/** helper to render all nav links */
const renderNavLinks = (wrapper: ReactWrapper, message: string = '') => {
  wrapper.find('NavLink').forEach(link => {
    expect(toJson(link)).toMatchSnapshot(message);
  });
};

describe('components/page/Header', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      authenticated: false,
      user: {
        email: '',
        name: '',
        username: '',
      },
    };
    shallow(
      <Router history={history}>
        <HeaderComponentWithRouter {...props} />
      </Router>
    );
  });

  it('renders header correctly', () => {
    const props = {
      authenticated: false,
      user: {
        email: '',
        name: '',
        username: '',
      },
    };
    const wrapper = mount(
      <Router history={history}>
        <HeaderComponentWithRouter {...props} />
      </Router>
    );
    renderNavLinks(wrapper);
    wrapper.unmount();
  });

  it('renders header correctly when authenticated', () => {
    const props = {
      authenticated: true,
      user: {
        email: 'bob@example.com',
        name: 'Bobbie',
        username: 'RobertBaratheon',
      },
    };
    const wrapper = mount(
      <Router history={history}>
        <HeaderComponentWithRouter {...props} />
      </Router>
    );
    renderNavLinks(wrapper);
    wrapper.unmount();
  });
});
