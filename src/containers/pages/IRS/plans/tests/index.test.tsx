import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedIRSPlansList, { IRSPlansList } from '../';
import { REPORT_IRS_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import { IRSPlan } from '../../../../../store/ducks/generic/plans';
import { fetchIRSPlans } from '../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('components/IRS Reports/IRSPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      history,
      location: {
        hash: '',
        pathname: REPORT_IRS_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${REPORT_IRS_PLAN_URL}/`,
        url: `${REPORT_IRS_PLAN_URL}/`,
      },
      plans: fixtures.plans as IRSPlan[],
    };
    shallow(
      <Router history={history}>
        <IRSPlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const props = {
      history,
      location: {
        hash: '',
        pathname: REPORT_IRS_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${REPORT_IRS_PLAN_URL}/`,
        url: `${REPORT_IRS_PLAN_URL}/`,
      },
      plans: fixtures.plans as IRSPlan[],
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSPlansList {...props} />
      </Router>
    );
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(toJson(wrapper.find('thead tr th'))).toMatchSnapshot('table headers');
    expect(toJson(wrapper.find('tbody tr td'))).toMatchSnapshot('table rows');
    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    store.dispatch(fetchIRSPlans(fixtures.plans as IRSPlan[]));

    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: REPORT_IRS_PLAN_URL,
        search: '?search=Berg',
      },
      match: {
        isExact: true,
        params: {},
        path: `${REPORT_IRS_PLAN_URL}`,
        url: `${REPORT_IRS_PLAN_URL}`,
      },
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('Berg Namibia 2019');
  });

  it('handles a case insensitive search', async () => {
    store.dispatch(fetchIRSPlans(fixtures.plans as IRSPlan[]));

    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: REPORT_IRS_PLAN_URL,
        search: '?search=BERG',
      },
      match: {
        isExact: true,
        params: {},
        path: `${REPORT_IRS_PLAN_URL}`,
        url: `${REPORT_IRS_PLAN_URL}`,
      },
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('Berg Namibia 2019');
  });

  it('renders empty table if no search matches', async () => {
    store.dispatch(fetchIRSPlans(fixtures.plans as IRSPlan[]));

    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        pathname: REPORT_IRS_PLAN_URL,
        search: '?search=Amazon',
      },
      match: {
        isExact: true,
        params: {},
        path: `${REPORT_IRS_PLAN_URL}`,
        url: `${REPORT_IRS_PLAN_URL}`,
      },
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper.find('tbody tr'))).toEqual(null);
  });
});
