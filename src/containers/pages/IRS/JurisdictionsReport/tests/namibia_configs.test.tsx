import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Router } from 'react-router';
import { JurisdictionReport } from '../';
import {
  indicatorThresholdsIRS,
  indicatorThresholdsLookUpIRS,
} from '../../../../../configs/settings';
import { REPORT_IRS_PLAN_URL } from '../../../../../constants';
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
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import { plansTableColumns } from '../../../GenericJurisdictionReport/helpers';
import * as fixtures from '../../JurisdictionsReport/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
(global as any).mapboxgl = {};

jest.mock('../../../../../configs/env', () => ({
  SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS: 'namibia2019',
  SUPERSET_IRS_REPORTING_INDICATOR_ROWS: 'namibia2019',
  SUPERSET_IRS_REPORTING_INDICATOR_STOPS: 'namibia2019',
  SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS: 'namibia2019',
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES: '11,12',
  SUPERSET_IRS_REPORTING_PLANS_SLICE: '13',
}));

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.NamibiaFocusAreasJSON) || [];
const jurisdictionData = superset.processData(fixtures.NamibiaJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('na-jurisdictions', jurisdictionData));
store.dispatch(fetchGenericJurisdictions('na-focusAreas', focusAreaData));

const history = createBrowserHistory();

describe('Namibia configs: components/IRS Reports/JurisdictionReport', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Namibia configs: renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    let jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'na-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'na-focusAreas',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      )
    );

    const props = {
      history,
      jurisdictions,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_PLAN_URL}/${(plans[0] as GenericPlan).plan_id}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );
    const helmet = Helmet.peek();
    await flushPromises();
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot(
      'Namibia configs: breadcrumbs'
    );
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('Namibia configs: page title');
    expect(helmet.title).toEqual('IRS Reporting: IRS 2019-09-05 TEST');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.namibia2019
    );
    expect(wrapper.find('IRSIndicatorLegend').length).toEqual(1);
    expect(wrapper.find('IRSIndicatorLegend').props()).toEqual({
      indicatorRows: 'namibia2019',
      indicatorThresholds: indicatorThresholdsIRS,
      indicatorThresholdsLookUp: indicatorThresholdsLookUpIRS,
    });

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        '13',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '727c3d40-e118-564a-b231-aac633e6abce',
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
              comparator: '727c3d40-e118-564a-b231-aac633e6abce',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          order_by_cols: ['["jurisdiction_depth",+true]', '["jurisdiction_name",+true]'],
          row_limit: 1000,
        },
      ],
      [
        '12',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '727c3d40-e118-564a-b231-aac633e6abce',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          order_by_cols: ['["jurisdiction_depth",+true]', '["jurisdiction_name",+true]'],
          row_limit: 1000,
        },
      ],
    ]);

    expect(supersetServiceMock).toHaveBeenCalledTimes(3);
    wrapper.unmount();
  });

  it('drills down correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    let jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'na-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'na-focusAreas',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      )
    );

    const props = {
      history,
      jurisdictions,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_PLAN_URL}/${(plans[0] as GenericPlan).plan_id}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );

    const baseURL = `${REPORT_IRS_PLAN_URL}/727c3d40-e118-564a-b231-aac633e6abce`;

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
    ).toEqual('IRS Reporting');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('IRS 2019-09-05 TEST');
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(2);
    expect(wrapper.find('h3.page-title').text()).toEqual('IRS Reporting: IRS 2019-09-05 TEST');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });

    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.namibia2019
    );

    // namibia URL
    expect(
      wrapper.find(`a[href$="${baseURL}/0dc2d15b-be1d-45d3-93d8-043a3a916f30"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/0dc2d15b-be1d-45d3-93d8-043a3a916f30"]`)
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
    ).toEqual('Namibia');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Reporting: IRS 2019-09-05 TEST: Namibia'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      plansTableColumns.namibia2019
    );

    expect(wrapper.find('DrillDownTable a').map(e => e.props().href)).toEqual([
      `${baseURL}/0b142aff-341c-4d15-878e-55942bc873aa/map`,
      `${baseURL}/0b142aff-341c-4d15-878e-55942bc873aa/map`,
    ]);
  });
});
