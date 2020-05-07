import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedPlanDefinitionList, { PlanDefinitionList } from '../';
import { NO_DATA_FOUND } from '../../../../../configs/lang';
import { PLAN_LIST_URL } from '../../../../../constants';
import store from '../../../../../store';
import { fetchPlanDefinitions } from '../../../../../store/ducks/opensrp/PlanDefinition';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('components/InterventionPlan/PlanDefinitionList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2019-04-07T10:20:30Z').getTime());
  });

  it('renders without crashing', () => {
    const props = {
      history,
      location: {
        hash: '',
        pathname: PLAN_LIST_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}/`,
        url: `${PLAN_LIST_URL}/`,
      },
      plans: fixtures.plans,
    };
    shallow(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    fetch.mockResponseOnce(fixtures.plansJSON);
    const props = {
      history,
      location: {
        hash: '',
        key: 'key',
        pathname: PLAN_LIST_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}/`,
        url: `${PLAN_LIST_URL}/`,
      },
      plans: fixtures.plans,
    };
    const wrapper = mount(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );
    expect(wrapper.find('HeaderBreadcrumb').props()).toMatchSnapshot('bread crumb props');
    expect(toJson(wrapper.find('Row').at(0))).toMatchSnapshot('row heading');
    expect(toJson(wrapper.find('HelmetWrapper'))).toMatchSnapshot('helmet');
    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    store.dispatch(fetchPlanDefinitions(fixtures.plans));

    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: PLAN_LIST_URL,
        search: '?title=Mosh',
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}`,
        url: `${PLAN_LIST_URL}`,
      },
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    wrapper.mount();
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('A Test By Mosh');
  });

  it('handles a case insensitive search', async () => {
    store.dispatch(fetchPlanDefinitions(fixtures.plans));

    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: PLAN_LIST_URL,
        search: '?title=MOSH',
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}`,
        url: `${PLAN_LIST_URL}`,
      },
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    wrapper.mount();
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('A Test By Mosh');
  });

  it('renders empty table if no search matches', async () => {
    store.dispatch(fetchPlanDefinitions(fixtures.plans));

    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: PLAN_LIST_URL,
        search: '?title=Amazon',
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}`,
        url: `${PLAN_LIST_URL}`,
      },
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    wrapper.mount();
    expect(wrapper.text().includes(NO_DATA_FOUND)).toBeTruthy();
  });
});
