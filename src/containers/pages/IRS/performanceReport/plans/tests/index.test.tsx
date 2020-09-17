import { renderTable } from '@onaio/drill-down-table';
import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { IRSPlanPerfomenceReport } from '../';
import { PERFORMANCE_REPORT_IRS_PLAN_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import { GenericPlan } from '../../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../../store/ducks/generic/tests/fixtures';

jest.mock('../../../../../../configs/env');
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('IRS performance report', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      history,
      location: {
        hash: '',
        pathname: PERFORMANCE_REPORT_IRS_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/`,
        url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/`,
      },
      plans: fixtures.plans as GenericPlan[],
    };
    shallow(
      <Router history={history}>
        <IRSPlanPerfomenceReport {...props} />
      </Router>
    );
  });

  it('renders plan list view correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const props = {
      history,
      location: {
        hash: '',
        pathname: PERFORMANCE_REPORT_IRS_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/`,
        url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/`,
      },
      plans: fixtures.plans as GenericPlan[],
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <IRSPlanPerfomenceReport {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(wrapper.find('h3.page-title').text()).toEqual('IRS Performance Reporting');
    const tableHeader = wrapper.find('.thead .tr .th');
    Array(tableHeader.length)
      .fill('')
      .forEach((_, i) => {
        expect(tableHeader.at(i).text()).toMatchSnapshot(`table header-${i + 1}`);
      });
    expect(wrapper.find('GenericPlansList').length).toBe(1);
    renderTable(wrapper, 'the full rendered rows');
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
    wrapper.unmount();
  });

  it('renders plans correctly when connected to store', async () => {
    const service = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(fixtures.plans as GenericPlan[]));
    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        hash: '',
        pathname: PERFORMANCE_REPORT_IRS_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${PERFORMANCE_REPORT_IRS_PLAN_URL}`,
        url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}`,
      },
      service,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <IRSPlanPerfomenceReport {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(wrapper.find('h3.page-title').text()).toEqual('IRS Performance Reporting');

    expect(wrapper.find('.tbody .tr').length).toEqual(3);
    expect(wrapper.find('GenericPlansList').length).toBe(1);
    expect(wrapper.find('GenericPlansList').props()).toMatchSnapshot(
      'GenericPlansList props: connected to store'
    );
  });
});
