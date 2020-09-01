import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedMDAJurisdictionReport, { MDAJurisdictionReport } from '../';
import { REPORT_MDA_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import { genericFetchPlans } from '../../../../../store/ducks/generic/plans';
import { GenericPlan } from '../../../../../store/ducks/generic/plans';
import { DynamicMDAPlans } from '../../../../../store/ducks/generic/tests/fixtures';
import * as fixtures from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

/** register the reducers */
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const jurisdictionData = superset.processData(fixtures.MDAJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('1338', jurisdictionData));
store.dispatch(genericFetchPlans(DynamicMDAPlans as GenericPlan[]));

describe('components/MDA Reports/JurisdictionReport', () => {
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
          planId: (DynamicMDAPlans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_MDA_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_PLAN_URL}/${(DynamicMDAPlans[0] as GenericPlan).plan_id}`,
      },
    };
    shallow(
      <Router history={history}>
        <MDAJurisdictionReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (DynamicMDAPlans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_MDA_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_PLAN_URL}/${(DynamicMDAPlans[0] as GenericPlan).plan_id}`,
      },
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDAJurisdictionReport {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('GenericJurisdictionReport').props() as any).toMatchSnapshot({
      history: expect.any(Object) /** just for purposes of making snapshot smaller */,
      jurisdictions: expect.any(Array) /** just for purposes of making snapshot smaller */,
      plan: expect.any(Object) /** just for purposes of making snapshot smaller */,
      service: expect.any(Function) /** just for purposes of making snapshot smaller */,
    });

    expect((wrapper.find('GenericJurisdictionReport').props() as any).plan).toEqual(
      DynamicMDAPlans[0]
    );
    expect((wrapper.find('GenericJurisdictionReport').props() as any).jurisdictions).toEqual(
      jurisdictionData
    );

    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(wrapper.find('.page-title').text()).toEqual(
      'MDA Reporting: Dynamic-MDA-2019-09-05 TEST'
    );
    expect((wrapper.find('DrillDownTable').props().data as any).length).toEqual(4);
    expect(wrapper.find('DrillDownTable .thead').text()).toMatchSnapshot('table headers');
    expect(supersetServiceMock.mock.calls).toEqual([
      [
        '1337',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '40357eff-81b6-4e32-bd3d-484019689f7c',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 1,
        },
      ],
      [
        '1338',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '40357eff-81b6-4e32-bd3d-484019689f7c',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          order_by_cols: ['["jurisdiction_depth",+true]', '["jurisdiction_name",+true]'],
          row_limit: 3000,
        },
      ],
    ]);
  });
});
