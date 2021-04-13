import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { REPORT_MDA_LITE_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import { MDALitePlans } from '../../../../../store/ducks/superset/MDALite/tests/fixtures';
import ConnectedMDALitePlansList, { MDALitePlansList } from '../index';

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

const props = {
  history,
  location: {
    hash: '',
    pathname: REPORT_MDA_LITE_PLAN_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {},
    path: `${REPORT_MDA_LITE_PLAN_URL}/`,
    url: `${REPORT_MDA_LITE_PLAN_URL}/`,
  },
};

describe('components/MDALiteReports/MDALitePlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <MDALitePlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', async () => {
    const service = jest.fn().mockImplementationOnce(() => Promise.resolve(MDALitePlans));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDALitePlansList {...props} service={service} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('h3.page-title').text()).toEqual('MDA Lite Plans');
    wrapper
      .find('BreadcrumbItem li')
      .forEach((item, i) => expect(item.text()).toMatchSnapshot(`breadcrumb item-${i + 1}`));
    wrapper.find('.thead .tr .th').forEach((item, i) => {
      expect(item.text()).toMatchSnapshot(`table header-${i + 1}`);
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
    const GenericPlansListProps = wrapper.find('GenericPlansList').props() as any;
    expect(GenericPlansListProps.plans).toEqual(MDALitePlans);
    expect(GenericPlansListProps.pageTitle).toEqual('MDA Lite Plans');
    expect(GenericPlansListProps.pageUrl).toEqual('/intervention/mda-lite/report');
    expect(GenericPlansListProps.supersetReportingSlice).toEqual('1');

    expect(wrapper.find('.page-title').text()).toEqual('MDA Lite Plans');

    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    const service = jest.fn().mockImplementationOnce(() => Promise.resolve(MDALitePlans));
    props.location.search = '?title=kenya';
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDALitePlansList {...props} service={service} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('.tbody .tr').length).toEqual(1);
    expect(wrapper.find('.tbody .tr .td a').text()).toEqual('MDA-Lite kenya 2021-01-08');

    expect((wrapper.find('GenericPlansList').props() as any).plans).toEqual([MDALitePlans[1]]);
  });
});
