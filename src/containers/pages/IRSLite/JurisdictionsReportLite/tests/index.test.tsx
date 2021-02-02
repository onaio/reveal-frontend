import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedJurisdictionReportLite, { JurisdictionReport } from '../';
import {
  indicatorThresholdsIRS,
  indicatorThresholdsLookUpIRS,
} from '../../../../../configs/settings';
import { REPORT_IRS_LITE_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  getGenericJurisdictionsArray,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  GenericPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import { InterventionType } from '../../../../../store/ducks/plans';
import { plansTableColumns } from '../../../GenericJurisdictionReport/helpers';
import * as fixtures from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-jurisdictions', jurisdictionData));
store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));

export const plans = [
  {
    jurisdiction_root_parent_ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128'],
    plan_date: '2019-09-05',
    plan_effective_period_end: '2019-09-25',
    plan_effective_period_start: '2019-09-05',
    plan_id: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
    plan_intervention_type: InterventionType.IRSLite,
    plan_name: 'IRS-2019-09-05-TEST',
    plan_status: 'retired',
    plan_title: 'IRS 2019-09-05 TEST',
    plan_version: '2',
  },
];

jest.mock('../../../../../configs/env', () => ({
  SUPERSET_IRS_LITE_REPORTING_FOCUS_AREAS_COLUMNS: 'irsLiteZambiaFocusArea2020',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_COLUMNS: 'irsLiteZambiaJurisdictions2020',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES: '11',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_LEVEL: '3',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_SLICE: '12',
  SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE: '13',
  SUPERSET_JURISDICTIONS_SLICE: 1,
  SUPERSET_MAX_RECORDS: 2000,
}));

const history = createBrowserHistory();

describe('components/IRS Reports/JurisdictionReportLite', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-jurisdictions',
        '17f89152-51a6-476c-9246-8fee6f9e6ebf'
      ) || [];

    const props = {
      history,
      jurisdictions,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/${(plans[0] as GenericPlan).plan_id}`,
      },
      plan: plans[0] as GenericPlan,
    };
    shallow(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-jurisdictions',
        '17f89152-51a6-476c-9246-8fee6f9e6ebf'
      ) || [];

    const props = {
      history,
      jurisdictions,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/${(plans[0] as GenericPlan).plan_id}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );

    await flushPromises();

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        '13',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 1,
        },
      ],
      [
        '11',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          order_by_cols: ['["jurisdiction_depth",+true]', '["jurisdiction_name",+true]'],
          row_limit: 2000,
        },
      ],
    ]);
    expect(supersetServiceMock).toHaveBeenCalledTimes(2);

    const helmet = Helmet.peek();
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(helmet.title).toEqual('IRS Lite Reporting: IRS 2019-09-05 TEST');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });

    expect(
      wrapper
        .find('.thead .tr .th')
        .first()
        .props().style
    ).toMatchSnapshot('title column styling');

    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.irsLiteZambiaJurisdictions2020
    );

    expect(wrapper.find('IRSIndicatorLegend').length).toEqual(1);
    expect(wrapper.find('IRSIndicatorLegend').props()).toEqual({
      indicatorThresholds: indicatorThresholdsIRS,
      indicatorThresholdsLookUp: indicatorThresholdsLookUpIRS,
    });

    wrapper.unmount();
  });

  it('drills down correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-jurisdictions',
        '17f89152-51a6-476c-9246-8fee6f9e6ebf'
      ) || [];

    const props = {
      history,
      jurisdictions,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/${(plans[0] as GenericPlan).plan_id}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );

    const baseURL = `${REPORT_IRS_LITE_PLAN_URL}/17f89152-51a6-476c-9246-8fee6f9e6ebf`;

    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(3);
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .first()
        .text()
    ).toEqual('Home');
    expect(
      wrapper
        .find('HeaderBreadcrumb a')
        .last()
        .text()
    ).toEqual('IRS Lite Reporting');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('IRS 2019-09-05 TEST');
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(2);
    expect(wrapper.find('h3.page-title').text()).toEqual('IRS Lite Reporting: IRS 2019-09-05 TEST');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.irsLiteZambiaJurisdictions2020
    );

    // Zambia MACEPA IRS Lite 2020 URL
    expect(
      wrapper.find(`a[href$="${baseURL}/03557b7e-0ddf-41f7-93c8-155669757a16"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/03557b7e-0ddf-41f7-93c8-155669757a16"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(4);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(3);
    expect(
      wrapper
        .find('HeaderBreadcrumb a')
        .last()
        .text()
    ).toEqual('IRS 2019-09-05 TEST');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('Zambia MACEPA IRS Lite 2020');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Lite Reporting: IRS 2019-09-05 TEST: Zambia MACEPA IRS Lite 2020'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.irsLiteZambiaJurisdictions2020
    );

    // Southern MACEPA IRS Lite 2020 URL
    expect(
      wrapper.find(`a[href$="${baseURL}/48a04a67-ac6f-4d5e-bbc6-09b77ba1253d"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/48a04a67-ac6f-4d5e-bbc6-09b77ba1253d"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(5);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(4);
    expect(
      wrapper
        .find('HeaderBreadcrumb a')
        .last()
        .text()
    ).toEqual('Zambia MACEPA IRS Lite 2020');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('Southern MACEPA IRS Lite 2020');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Lite Reporting: IRS 2019-09-05 TEST: Southern MACEPA IRS Lite 2020'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.irsLiteZambiaJurisdictions2020
    );

    // Gwembe MACEPA IRS Lite 2020
    expect(
      wrapper.find(`a[href$="${baseURL}/032a9542-dab7-4a76-9e2e-bc7eb99a259c"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/032a9542-dab7-4a76-9e2e-bc7eb99a259c"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(6);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(5);
    expect(
      wrapper
        .find('HeaderBreadcrumb a')
        .last()
        .text()
    ).toEqual('Southern MACEPA IRS Lite 2020');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('Gwembe MACEPA IRS Lite 2020');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Lite Reporting: IRS 2019-09-05 TEST: Gwembe MACEPA IRS Lite 2020'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.irsLiteZambiaFocusArea2020
    );

    expect(wrapper.find('DrillDownTable a').length).toEqual(2);
    expect(
      wrapper.find('DrillDownTable .plan-jurisdiction-name.main-span').map(e => e.text())
    ).toEqual(['  so_Sompani_Health_Post_MACEPA_IRS_Lite_2020']);
    expect(wrapper.find('DrillDownTable a').map(e => e.props().href)).toEqual([
      `${baseURL}/ce13e7f4-6926-4be0-9117-519bd1cc4bb2/map`,
      `${baseURL}/ce13e7f4-6926-4be0-9117-519bd1cc4bb2/map`,
    ]);
  });

  it('display correct headers when provinces are loaded', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);
    store.dispatch(fetchGenericJurisdictions('11', jurisdictionData));
    store.dispatch(fetchGenericJurisdictions('12', focusAreaData));
    const props = {
      history,
      location: {
        hash: '',
        pathname: REPORT_IRS_LITE_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {
          jurisdictionId: '03557b7e-0ddf-41f7-93c8-155669757a16', // Zambia jurisdiction Id
          planId: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/17f89152-51a6-476c-9246-8fee6f9e6ebf`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionReportLite {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper
      .find('.thead .th')
      .map((node, i) => expect(node.text()).toMatchSnapshot(`header on provinces display ${i}`));
    expect(wrapper.find('.thead .th').length).toEqual(12);
  });

  it('display correct headers when Operational Areas are loaded', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);
    store.dispatch(fetchGenericJurisdictions('11', jurisdictionData));
    store.dispatch(fetchGenericJurisdictions('12', focusAreaData));
    const props = {
      history,
      location: {
        hash: '',
        pathname: REPORT_IRS_LITE_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {
          jurisdictionId: '032a9542-dab7-4a76-9e2e-bc7eb99a259c', // Lusaka HFC jurisdiction Id (spray area parent)
          planId: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/17f89152-51a6-476c-9246-8fee6f9e6ebf`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionReportLite {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper
      .find('.thead .th')
      .map((node, i) => expect(node.text()).toMatchSnapshot(`header on Spray Areas display ${i}`));
    expect(wrapper.find('.thead .th').length).toEqual(12);
  });
});
