import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import * as supersetServices from '../../../../../services/superset';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import { ActiveFocusInvestigation } from '../../active';

const history = createBrowserHistory();

describe('containers/pages/ActiveFocusInvestigation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      plansArray: fixtures.plans,
    };
    shallow(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders ActiveFocusInvestigation correctly', () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve('supersetServices'));
    const props = {
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      plansArray: fixtures.plans,
      supersetService: mock,
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
