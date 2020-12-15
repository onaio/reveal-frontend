import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { REPORT_SMC_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import { fetchSMCPlans, SMCPLANType } from '../../../../../store/ducks/generic/SMCPlans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';
import ConnectedSMCPlansList, { SMCPlansList } from '../index';

jest.mock('../../../../../configs/env');
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

const props = {
  history,
  location: {
    hash: '',
    pathname: REPORT_SMC_PLAN_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {},
    path: `${REPORT_SMC_PLAN_URL}/`,
    url: `${REPORT_SMC_PLAN_URL}/`,
  },
};

describe('components/SMC/SMCPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <SMCPlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    store.dispatch(fetchSMCPlans(fixtures.SMCPlans as SMCPLANType[]));
    fetch.mockResponseOnce(JSON.stringify({}));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSMCPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(wrapper.find('h3.page-title').text()).toEqual('SMC Plans');
    const tableHeader = wrapper.find('.thead .tr .th');
    Array(tableHeader.length)
      .fill('')
      .forEach((_, i) => {
        expect(tableHeader.at(i).text()).toMatchSnapshot(`table header-${i + 1}`);
      });
    expect(wrapper.find('.tbody .tr').length).toEqual(3);
    // have searchbar
    expect(wrapper.find('.search-input-wrapper').length).toEqual(1);
    // have top and bottom pagination
    expect(wrapper.find('.pagination').length).toEqual(2);
    // have height and columns filters
    expect(
      wrapper
        .find('.filter-bar-btns span')
        .at(0)
        .text()
    ).toEqual('Row Height');
    expect(
      wrapper
        .find('.filter-bar-btns span')
        .at(1)
        .text()
    ).toEqual('Customize Columns');

    expect(wrapper.find('GenericPlansList').length).toBe(1);
    expect(wrapper.find('GenericPlansList').props()).toMatchSnapshot('GenericPlansList props');

    expect(wrapper.find('.page-title').text()).toEqual('SMC Plans');

    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    store.dispatch(fetchSMCPlans(fixtures.SMCPlans as SMCPLANType[]));
    props.location.search = '?title=Cycle 4';
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSMCPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(wrapper.find('.tbody .tr .td a').text()).toEqual(
      'Nigeria Cycle 4 - SMC Implementation Plan'
    );

    expect((wrapper.find('GenericPlansList').props() as any).plans).toEqual([fixtures.SMCPlans[1]]);
  });
});
