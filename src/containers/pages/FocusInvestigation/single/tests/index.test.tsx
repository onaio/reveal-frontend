import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../constants';
import store from '../../../../../store';
import { fetchGoals } from '../../../../../store/ducks/goals';
import { fetchPlans } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedSingleFI, { SingleFI } from '../../single';

const history = createBrowserHistory();
jest.mock('../../../../../configs/env');

describe('containers/pages/SingleFI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      goalsArray: fixtures.plan1Goals,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      planById: fixtures.plan1,
      plansArray: fixtures.plans,
      plansIdArray: fixtures.plansIdArray,
    };
    shallow(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
  });

  it('renders SingleFI correctly', () => {
    const mock: any = jest.fn();
    const supersetMock: any = jest.fn();
    supersetMock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      goalsArray: fixtures.plan1Goals,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      planById: fixtures.plan1,
      plansArray: fixtures.plans,
      plansIdArray: fixtures.plansIdArray,
      supersetService: supersetMock,
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders SingleFI correctly for null plan jurisdction id', () => {
    const mock: any = jest.fn();
    const supersetMock: any = jest.fn();
    supersetMock.mockImplementation(() => Promise.resolve(fixtures.plan5));
    const props = {
      goalsArray: [],
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan5.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      planById: fixtures.plan5,
      plansArray: [fixtures.plan5],
      plansIdArray: [fixtures.plan5.id],
      supersetService: supersetMock,
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('It works with the Redux store', () => {
    const mock: any = jest.fn();
    store.dispatch(fetchPlans(fixtures.plans));
    store.dispatch(fetchGoals(fixtures.goals));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleFI {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
