import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HeaderComponentWithRouter from '..';

const history = createBrowserHistory();

jest.mock('../../../../configs/env');

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
    expect(toJson(wrapper)).toMatchSnapshot();
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
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
