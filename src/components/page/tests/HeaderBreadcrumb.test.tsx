import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HeaderBreadcrumb from '../HeaderBreadcrumb';

const history = createBrowserHistory();

describe('components/page/HeaderBreadcrumb', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <HeaderBreadcrumb />
      </Router>
    );
  });

  it('renders HeaderBreadcrumb correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <HeaderBreadcrumb />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
