import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { REPORT_MDA_POINT_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import { fetchMDAPointPlans } from '../../../../../store/ducks/generic/MDAPointPlans';
import { GenericPlan } from '../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';
import ConnectedMDAPointPlansList, { MDAPointPlansList } from '../index';

jest.mock('../../../../../configs/env');
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

const ownProps = {
  history,
  location: {
    hash: '',
    pathname: REPORT_MDA_POINT_PLAN_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {},
    path: `${REPORT_MDA_POINT_PLAN_URL}/`,
    url: `${REPORT_MDA_POINT_PLAN_URL}/`,
  },
};

describe('components/IRS Reports/IRSPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      history,
      location: {
        hash: '',
        pathname: REPORT_MDA_POINT_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${REPORT_MDA_POINT_PLAN_URL}/`,
        url: `${REPORT_MDA_POINT_PLAN_URL}/`,
      },
      plans: fixtures.MDAplans as GenericPlan[],
    };
    shallow(
      <Router history={history}>
        <MDAPointPlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const props = {
      ...ownProps,
      ownProps,
      plans: fixtures.MDAplans as GenericPlan[],
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <MDAPointPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(toJson(wrapper.find('thead tr th'))).toMatchSnapshot('table headers');
    expect(toJson(wrapper.find('tbody tr td'))).toMatchSnapshot('table rows');

    expect(wrapper.find('IRSPlansList').length).toBe(1);
    expect(wrapper.find('IRSPlansList').props()).toMatchSnapshot('ConnectedIRSPlansList props');

    expect(wrapper.find('.page-title').text()).toEqual('MDA Point Plans');

    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    store.dispatch(fetchMDAPointPlans(fixtures.MDAplans as GenericPlan[]));
    ownProps.location.search = '?title=Berg';
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDAPointPlansList {...ownProps} />
        </Router>
      </Provider>
    );
    expect(wrapper.find('tbody tr td Link').text()).toEqual('Berg Eswatini 2019');
  });
});
