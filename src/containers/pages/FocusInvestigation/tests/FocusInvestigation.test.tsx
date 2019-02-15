import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import FocusInvestigation from '../FocusInvestigation';

const history = createBrowserHistory();

describe('containers/pages/FocusInvestigation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <FocusInvestigation />
      </Router>
    );
  });

  it('renders FocusInvestigation correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <FocusInvestigation />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
