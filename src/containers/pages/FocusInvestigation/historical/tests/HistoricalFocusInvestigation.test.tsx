import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import HistoricalFocusInvestigation from '../../historical';

const history = createBrowserHistory();

describe('containers/pages/HistoricalFocusInvestigation', () => {
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

  it('renders HistoricalFocusInvestigation correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <HistoricalFocusInvestigation />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
