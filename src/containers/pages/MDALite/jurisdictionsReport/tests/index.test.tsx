import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedMdaLiteJurisdictionReport, { MdaLiteJurisdictionReport } from '../';
import { REPORT_MDA_LITE_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import { genericFetchPlans } from '../../../../../store/ducks/generic/plans';
import { GenericPlan } from '../../../../../store/ducks/generic/plans';
import { MDALitePlans } from '../../../../../store/ducks/superset/MDALite/tests/fixtures';
import { MDALiteJurReports } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

/** register the reducers */
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

store.dispatch(fetchGenericJurisdictions('1', MDALiteJurReports));
store.dispatch(genericFetchPlans(MDALitePlans as GenericPlan[]));

describe('components/MDA/Lite/Reports/JurisdictionReport', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: MDALitePlans[0].plan_id,
        },
        path: `${REPORT_MDA_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_LITE_PLAN_URL}/${MDALitePlans[0].plan_id}`,
      },
    };
    shallow(
      <Router history={history}>
        <MdaLiteJurisdictionReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    superset.api.doFetch = jest.fn(() => Promise.resolve({}));

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: MDALitePlans[0].plan_id,
        },
        path: `${REPORT_MDA_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_LITE_PLAN_URL}/${MDALitePlans[0].plan_id}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMdaLiteJurisdictionReport {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(JSON.stringify(wrapper.find('GenericJurisdictionReport').props())).toMatchSnapshot();
    wrapper
      .find('BreadcrumbItem li')
      .forEach((item, i) => expect(item.text()).toMatchSnapshot(`breadcrumb item-${i + 1}`));
    expect(wrapper.find('h3.page-title').text()).toEqual('MDA Lite Reporting: MDA-Lite 2021-03-02');
    expect(wrapper.find('.page-title').text()).toEqual('MDA Lite Reporting: MDA-Lite 2021-03-02');
    expect((wrapper.find('DrillDownTable').props().data as any).length).toEqual(4);

    expect(wrapper.find('DrillDownTable .thead .tr').length).toEqual(2);
    expect(wrapper.find('.thead .tr .th').length).toEqual(38);
    expect(wrapper.find('.no-data-cls').length).toMatchInlineSnapshot(`0`);
    // drilling down
    // country level
    expect(wrapper.find('.tbody .tr').length).toEqual(1);
    expect(wrapper.find('.tbody .tr .td').length).toEqual(21);
    expect(
      wrapper
        .find('.tbody .tr .td')
        .at(0)
        .text()
    ).toEqual('Kenya');
    wrapper
      .find('.tbody .tr .td')
      .at(0)
      .simulate('click');
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.find('.page-title').text()).toEqual(
      'MDA Lite Reporting: MDA-Lite 2021-03-02: Kenya'
    );
    // county level
    expect(
      wrapper
        .find('.tbody .tr .td')
        .at(0)
        .text()
    ).toEqual('vihiga');
    wrapper
      .find('.tbody .tr .td')
      .at(0)
      .simulate('click');
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.find('.page-title').text()).toEqual(
      'MDA Lite Reporting: MDA-Lite 2021-03-02: vihiga'
    );
    // sub-county level
    const rows = wrapper.find('.tbody .tr');
    expect(rows.length).toEqual(2);
    expect(
      rows
        .at(0)
        .find('.td')
        .at(0)
        .text()
    ).toEqual('emuhaya');
    expect(
      rows
        .at(1)
        .find('.td')
        .at(0)
        .text()
    ).toEqual('hamisi');
  });
});
