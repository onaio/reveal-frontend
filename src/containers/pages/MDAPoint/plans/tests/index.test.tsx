import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { REPORT_MDA_POINT_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import { genericFetchPlans } from '../../../../../store/ducks/generic/plans';
import { GenericPlan } from '../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';
import ConnectedMDAPointPlansList, { MDAPointPlansList } from '../index';

jest.mock('../../../../../configs/env');
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

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
};

describe('components/MDA Reports/MDAPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <MDAPointPlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    store.dispatch(genericFetchPlans(fixtures.MDAPointPlans as GenericPlan[]));
    fetch.mockResponseOnce(JSON.stringify({}));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDAPointPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    const tableHeader = wrapper.find('.thead .tr .th');
    Array(tableHeader.length)
      .fill('')
      .forEach((_, i) => {
        expect(tableHeader.at(i).text()).toMatchSnapshot(`table header-${i + 1}`);
      });
    expect(wrapper.find('.tbody .tr').length).toEqual(2);
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

    expect(wrapper.find('.page-title').text()).toEqual('MDA Point Plans');

    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    store.dispatch(genericFetchPlans(fixtures.MDAPointPlans as GenericPlan[]));
    props.location.search = '?title=Berg';
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDAPointPlansList {...props} />
        </Router>
      </Provider>
    );
    expect(wrapper.find('.tbody .tr .td a').text()).toEqual('Berg Eswatini 2019');

    expect((wrapper.find('GenericPlansList').props() as any).plans).toMatchSnapshot(
      'search results props'
    );
  });
});
