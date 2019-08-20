import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import NewPlan from '../index';

const history = createBrowserHistory();

describe('containers/pages/NewPlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<NewPlan />);
  });

  it('renders correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <NewPlan />
      </Router>
    );
    expect(toJson(wrapper.find('h3.mb-3.page-title'))).toMatchSnapshot('page title');
    wrapper.unmount();
  });
});
