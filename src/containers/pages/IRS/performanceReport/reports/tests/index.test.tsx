import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedIRSPerfomenceReport, { IRSPerfomenceReport } from '..';
import { PERFORMANCE_REPORT_IRS_PLAN_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import PlansReducer, {
  genericFetchPlans,
  GenericPlan,
  reducerName as PlansReducerName,
} from '../../../../../../store/ducks/generic/plans';
import * as plans from '../../../../../../store/ducks/generic/tests/fixtures';
import DataCollectorreducer, {
  FetchIRSDataCollectors,
  reducerName as CollectorReducerName,
} from '../../../../../../store/ducks/opensrp/performanceReports/IRS/dataCollectorReport';
import DistrictReducer, {
  FetchIRSDistricts,
  reducerName as DistrictReducerName,
} from '../../../../../../store/ducks/opensrp/performanceReports/IRS/districtReport';
import SOPByDateReducer, {
  reducerName as SOPByDateReducerName,
} from '../../../../../../store/ducks/opensrp/performanceReports/IRS/sopByDateReport';
import SOPReducer, {
  FetchIRSSOPs,
  reducerName as SOPReducerName,
} from '../../../../../../store/ducks/opensrp/performanceReports/IRS/sopReport';
import * as fixtures from '../../../../../../store/ducks/opensrp/performanceReports/IRS/tests/fixtures';

jest.mock('../../../../../../configs/env');

const mock: any = jest.fn();
const history = createBrowserHistory();

const props = {
  history,
  location: mock,
  match: {
    isExact: true,
    params: {
      planId: fixtures.districtsReport[0].plan_id,
    },
    path: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId`,
    url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${fixtures.districtsReport[0].plan_id}`,
  },
};

/** register the reducers */
reducerRegistry.register(DistrictReducerName, DistrictReducer);
reducerRegistry.register(CollectorReducerName, DataCollectorreducer);
reducerRegistry.register(SOPReducerName, SOPReducer);
reducerRegistry.register(SOPByDateReducerName, SOPByDateReducer);
reducerRegistry.register(PlansReducerName, PlansReducer);

plans.plans[0].plan_id = fixtures.districtsReport[0].plan_id;
store.dispatch(genericFetchPlans(plans.plans as GenericPlan[]));

describe('containers/pages/IRS/performanceReport/reports/', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <IRSPerfomenceReport {...props} />
      </Router>
    );
  });

  it('renders correctly district page', async () => {
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => fixtures.districtsReport);
    (props as any).service = supersetServiceMock;
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPerfomenceReport {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('.page-title').text()).toEqual(
      'IRS Performance Reporting: IRS 2019-09-05 TEST'
    );
    wrapper.find('.breadcrumb li').forEach((list, index) => {
      expect(list.text()).toMatchSnapshot(`districts page breadcrumbs ${index + 1}`);
    });
    wrapper.find('.th').forEach((header, index) => {
      expect(header.text()).toMatchSnapshot(`districts table header ${index + 1}`);
    });
    wrapper.find('.tr .td').forEach((data, index) => {
      expect(data.text()).toMatchSnapshot(`districts table data ${index + 1}`);
    });
  });

  it('renders correctly data collectors page', async () => {
    const supersetServiceMock: any = jest.fn();
    store.dispatch(FetchIRSDistricts(fixtures.districtsReport));
    supersetServiceMock.mockImplementationOnce(async () => fixtures.dataCollectorsReport);
    supersetServiceMock.mockImplementationOnce(async () => fixtures.sopReport);
    supersetServiceMock.mockImplementationOnce(async () => fixtures.sopByDateReport);
    const jurisdictionId = fixtures.districtsReport[0].district_id;
    const planId = fixtures.districtsReport[0].plan_id;
    const newProps = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId,
          planId,
        },
        path: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId`,
        url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPerfomenceReport {...newProps} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('.page-title').text()).toEqual(
      'IRS Performance Reporting: Nchelenge District (2020)'
    );
    wrapper.find('.breadcrumb li').forEach((list, index) => {
      expect(list.text()).toMatchSnapshot(`data collector page breadcrumbs ${index + 1}`);
    });
    wrapper.find('.th').forEach((header, index) => {
      expect(header.text()).toMatchSnapshot(`data collector table header ${index + 1}`);
    });
    wrapper.find('.tr .td').forEach((data, index) => {
      expect(data.text()).toMatchSnapshot(`data collector table data ${index + 1}`);
    });
  });

  it('renders correctly spray operator page', async () => {
    const supersetServiceMock: any = jest.fn();
    store.dispatch(FetchIRSDistricts(fixtures.districtsReport));
    store.dispatch(FetchIRSDataCollectors(fixtures.dataCollectorsReport));
    supersetServiceMock.mockImplementationOnce(async () => fixtures.sopReport);
    supersetServiceMock.mockImplementationOnce(async () => fixtures.sopByDateReport);
    const jurisdictionId = fixtures.districtsReport[0].district_id;
    const planId = fixtures.districtsReport[0].plan_id;
    const dataCollector = fixtures.dataCollectorsReport[0].data_collector;
    const newProps = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          dataCollector,
          jurisdictionId,
          planId,
        },
        path: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/:dataCollector`,
        url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${dataCollector}`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPerfomenceReport {...newProps} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('.page-title').text()).toEqual(
      'IRS Performance Reporting: NL6:Lillian Mulubwa'
    );
    wrapper.find('.breadcrumb li').forEach((list, index) => {
      expect(list.text()).toMatchSnapshot(`sop page breadcrumbs ${index + 1}`);
    });
    wrapper.find('.th').forEach((header, index) => {
      expect(header.text()).toMatchSnapshot(`sop table header ${index + 1}`);
    });
    wrapper.find('.tr .td').forEach((data, index) => {
      expect(data.text()).toMatchSnapshot(`sop table data ${index + 1}`);
    });
  });

  it('renders correctly spray operator by date page', async () => {
    const supersetServiceMock: any = jest.fn();
    store.dispatch(FetchIRSDistricts(fixtures.districtsReport));
    store.dispatch(FetchIRSDataCollectors(fixtures.dataCollectorsReport));
    store.dispatch(FetchIRSSOPs(fixtures.sopReport));
    supersetServiceMock.mockImplementationOnce(async () => fixtures.sopByDateReport);
    const jurisdictionId = fixtures.districtsReport[0].district_id;
    const planId = fixtures.districtsReport[0].plan_id;
    const dataCollector = fixtures.dataCollectorsReport[0].data_collector;
    const sop = fixtures.sopReport[0].sop;
    const newProps = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          dataCollector,
          jurisdictionId,
          planId,
          sop,
        },
        path: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/:dataCollector/:sop`,
        url: `${PERFORMANCE_REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${dataCollector}/${sop}`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPerfomenceReport {...newProps} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('.page-title').text()).toEqual(
      'IRS Performance Reporting: ZM-SOP-2019-21017:Chomba Gladys'
    );
    wrapper.find('.breadcrumb li').forEach((list, index) => {
      expect(list.text()).toMatchSnapshot(`sop by date page breadcrumbs ${index + 1}`);
    });
    wrapper.find('.th').forEach((header, index) => {
      expect(header.text()).toMatchSnapshot(`sop by date table header ${index + 1}`);
    });
    wrapper.find('.tr .td').forEach((data, index) => {
      expect(data.text()).toMatchSnapshot(`sop by date table data ${index + 1}`);
    });
  });
});
