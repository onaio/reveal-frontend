import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HistoricalFocusInvestigation from '../HistoricalFocusInvestigation';

const history = createBrowserHistory();

describe('containers/pages/FocusInvestigation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <HistoricalFocusInvestigation />
      </Router>
    );
  });

  it('renders FocusInvestigation correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <HistoricalFocusInvestigation />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
