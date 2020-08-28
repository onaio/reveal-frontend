import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedMdaPointJurisdictionReport, { MdaPointJurisdictionReport } from '../';
import { REPORT_MDA_POINT_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import { genericFetchPlans } from '../../../../../store/ducks/generic/plans';
import { GenericPlan } from '../../../../../store/ducks/generic/plans';
import { MDAPointPlans } from '../../../../../store/ducks/generic/tests/fixtures';
import * as fixtures from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

/** register the reducers */
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.MDAPointJurisdictionsJSON) || [];
const jurisdictionData = superset.processData(fixtures.MDAPointJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('esw-jurisdictions', jurisdictionData));
store.dispatch(fetchGenericJurisdictions('esw-focusAreas', focusAreaData));
store.dispatch(genericFetchPlans(MDAPointPlans as GenericPlan[]));

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
          planId: (MDAPointPlans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_MDA_POINT_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_POINT_PLAN_URL}/${(MDAPointPlans[0] as GenericPlan).plan_id}`,
      },
    };
    shallow(
      <Router history={history}>
        <MdaPointJurisdictionReport {...props} />
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
          planId: (MDAPointPlans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_MDA_POINT_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_POINT_PLAN_URL}/${(MDAPointPlans[0] as GenericPlan).plan_id}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMdaPointJurisdictionReport {...props} />
        </Router>
      </Provider>
    );
    await flushPromises();
    expect(wrapper.find('GenericJurisdictionReport').props()).toMatchSnapshot();
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(wrapper.find('.page-title').text()).toEqual(
      'MDA Point Reporting: MDA-Point-2019-09-05 TEST'
    );
    expect((wrapper.find('DrillDownTable').props().data as any).length).toEqual(5);
  });
});
