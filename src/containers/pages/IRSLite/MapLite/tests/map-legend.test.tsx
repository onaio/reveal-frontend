import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { IRSReportingMap } from '../';
import { MAP, REPORT_IRS_LITE_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  getGenericJurisdictionByJurisdictionId,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  GenericPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import * as fixtures from '../../JurisdictionsReportLite/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env', () => ({
  GISIDA_MAPBOX_TOKEN: 'hunter2',
  GISIDA_TIMEOUT: 3000,
  HIDDEN_MAP_LEGEND_ITEMS: [],
  SUPERSET_IRS_LITE_REPORTING_INDICATOR_ROWS: 'zambia2020',
  SUPERSET_IRS_LITE_REPORTING_INDICATOR_STOPS: 'zambia2020',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES: '11,12',
  SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE: '13',
  SUPERSET_JURISDICTIONS_SLICE: 1,
  SUPERSET_MAX_RECORDS: 2000,
}));

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaAkros1JSON) || [];
const jurisdiction2Data = superset.processData(fixtures.ZambiaKMZ421JSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));
store.dispatch(fetchJurisdictions(jurisdictionData));
store.dispatch(fetchJurisdictions(jurisdiction2Data));

const history = createBrowserHistory();

describe('components/IRS Reports/IRSReportingMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders map legend correctly with hidden items', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const focusArea = getGenericJurisdictionByJurisdictionId(
      store.getState(),
      'zm-focusAreas',
      '0f973eb6-7204-55f6-9f54-299d10647a9c'
    );

    const jurisdiction = getJurisdictionById(
      store.getState(),
      '56e45196-882b-55ac-ba9e-3caeacb431a9'
    );

    const props = {
      focusArea,
      history,
      jurisdiction,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: '56e45196-882b-55ac-ba9e-3caeacb431a9',
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/56e45196-882b-55ac-ba9e-3caeacb431a9/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSReportingMap {...props} />
      </Router>
    );
    await flushPromises();
    wrapper.update();
    expect(wrapper.find('.sidebar-legend-item').length).toEqual(5);
    expect(toJson(wrapper.find('.sidebar-legend-item'))).toMatchSnapshot('Legend items');
    wrapper.unmount();
  });
});
