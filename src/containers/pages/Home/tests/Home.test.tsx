import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import Home from '../Home';

const history = createBrowserHistory();

describe('containers/pages/Home', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <Home />
      </Router>
    );
  });

  it('renders Home correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <Home />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
