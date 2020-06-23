import { renderTable } from '@onaio/drill-down-table';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedPlanDefinitionList, { PlanDefinitionList } from '../';
import { NO_DATA_FOUND } from '../../../../../configs/lang';
import { PLAN_LIST_URL } from '../../../../../constants';
import * as planDataLoaders from '../../../../../helpers/dataLoading/plans';
import store from '../../../../../store';
import { fetchPlanDefinitions } from '../../../../../store/ducks/opensrp/PlanDefinition';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { fetchPlansByUser } from '../../../../../store/ducks/opensrp/planIdsByUser';

jest.mock('../../../../../configs/env');
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

jest.mock('../../../../../components/forms/UserFilter', () => {
  return {
    UserSelectFilter: () => <div id="user-filter-mock">Filter users here</div>,
  };
});

describe('components/InterventionPlan/PlanDefinitionList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2019-04-07T10:20:30Z').getTime());
  });

  it('renders without crashing', () => {
    const mockList = jest.fn(async () => {
      return Promise.reject(new Error('random error'));
    });
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
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
      service: mockClass,
    };
    shallow(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', async () => {
    const mockList = jest.fn(async () => []);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    fetch.mockResponseOnce(JSON.stringify(fixtures.plansJSON));
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
      service: mockClass,
    };
    const wrapper = mount(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(wrapper.find('HeaderBreadcrumb').props()).toMatchSnapshot('bread crumb props');
    expect(toJson(wrapper.find('Row').at(0))).toMatchSnapshot('row heading');
    expect(toJson(wrapper.find('HelmetWrapper'))).toMatchSnapshot('helmet');
    wrapper.unmount();
  });

  it('sort works correctly for intervention type column', async () => {
    const mockList = jest.fn(async () => []);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
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
      service: mockClass,
    };
    const wrapper = mount(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    renderTable(wrapper, 'before clicking on sort');

    // find column head for intervention type and simulate click.
    expect(
      wrapper
        .find('.table .th')
        .at(1)
        .text()
    ).toMatchInlineSnapshot(`"Intervention Type"`);
    wrapper
      .find('.table .th')
      .at(1)
      .simulate('click');
    wrapper.update();

    renderTable(wrapper, 'after sorting by the intervention type');
    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    const mockList = jest.fn(async () => []);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
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
      service: mockClass,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(
      wrapper
        .find('.tbody .tr .td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('A Test By Mosh');
  });

  it('handles a case insensitive search', async () => {
    const mockList = jest.fn(async () => []);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
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
      service: mockClass,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    expect(
      wrapper
        .find('.tbody .tr .td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('A Test By Mosh');
  });

  it('renders empty table if no search matches', async () => {
    const mockList = jest.fn(async () => []);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    store.dispatch(fetchPlanDefinitions(fixtures.plans));

    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: PLAN_LIST_URL,
        search: '?title=asdfasdf',
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}`,
        url: `${PLAN_LIST_URL}`,
      },
      service: mockClass,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(wrapper.text().includes(NO_DATA_FOUND)).toBeTruthy();
  });

  it('filters correctly when searching by userName', async () => {
    (planDataLoaders as any).loadPlansByUserFilter = async () => {
      return;
    };
    const mockList = jest.fn(async () => []);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    store.dispatch(fetchPlanDefinitions(fixtures.plans));
    const userName = 'macTavish';
    store.dispatch(fetchPlansByUser([fixtures.plans[0]], userName));
    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: PLAN_LIST_URL,
        search: `?user=${userName}`,
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}`,
        url: `${PLAN_LIST_URL}`,
      },
      service: mockClass,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    // only one plan is rendered fixtures.plan1
    expect(wrapper.find('.tbody .tr').text()).toMatchInlineSnapshot(
      `"A2-Lusaka Akros Test Focus 2FIactive2019-05-19"`
    );
  });
});
