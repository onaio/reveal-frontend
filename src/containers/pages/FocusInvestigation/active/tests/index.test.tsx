import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import ActiveFocusInvestigation from '../../active';

const history = createBrowserHistory();

describe('containers/pages/ActiveFocusInvestigation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: mock,
    };
    shallow(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders ActiveFocusInvestigation correctly', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
