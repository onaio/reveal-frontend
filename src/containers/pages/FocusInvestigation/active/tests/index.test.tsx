import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import store from '../../../../../store';
import reducer, { fetchPlans, reducerName } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedActiveFocusInvestigation, { ActiveFocusInvestigation } from '../../active';

reducerRegistry.register(reducerName, reducer);

const history = createBrowserHistory();
jest.mock('../../../../../configs/env');

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

  it('renders without crashing for null jurisdictions_name_path', () => {
    const mock: any = jest.fn();
    const allTasks = fixtures.plans.concat([fixtures.plan5 as any, fixtures.plan6 as any]);
    const props = {
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      plansArray: allTasks,
    };
    shallow(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders ActiveFocusInvestigation correctly', () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
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
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders ActiveFocusInvestigation correctly for null jurisdictions', () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      plansArray: [fixtures.plan5, fixtures.plan6],
      supersetService: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.unmount();
  });

  it('works with the Redux store', () => {
    store.dispatch(fetchPlans(fixtures.plans));
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      history,
      location: mock,
      match: mock,
      supersetService: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    wrapper.update();
    expect(toJson(wrapper.find('.ReactTable'))).toMatchSnapshot();
    wrapper.unmount();
  });
});
