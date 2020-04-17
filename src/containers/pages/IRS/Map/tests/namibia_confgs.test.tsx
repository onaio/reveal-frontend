import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { IRSReportingMap } from '../';
import { INTERVENTION_IRS_URL, MAP } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  getGenericJurisdictionByJurisdictionId,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import genericStructuresReducer, {
  getGenericStructures,
  reducerName as genericStructuresReducerName,
} from '../../../../../store/ducks/generic/structures';
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import * as fixtures from '../../JurisdictionsReport/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env', () => ({
  SUPERSET_IRS_REPORTING_INDICATOR_ROWS: 'namibia2019',
  SUPERSET_IRS_REPORTING_INDICATOR_STOPS: 'namibia2019',
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES: '11,12',
  SUPERSET_IRS_REPORTING_PLANS_SLICE: '13',
  SUPERSET_IRS_REPORTING_STRUCTURES_DATA_SLICE: '14',
  SUPERSET_JURISDICTIONS_SLICE: 1,
  SUPERSET_MAX_RECORDS: 2000,
}));

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.NamibiaFocusAreasJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaAkros1JSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));
store.dispatch(fetchJurisdictions(jurisdictionData));

const history = createBrowserHistory();

describe('Namibia configs: components/IRS Reports/IRSReportingMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Namibia configs: renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const focusArea = getGenericJurisdictionByJurisdictionId(
      store.getState(),
      'zm-focusAreas',
      '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
    );

    const structures = getGenericStructures(
      store.getState(),
      'zm-structures',
      '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
    );

    const jurisdiction = getJurisdictionById(
      store.getState(),
      '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
    );

    const props = {
      focusArea,
      history,
      jurisdiction,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
          planId: (plans[0] as IRSPlan).plan_id,
        },
        path: `${INTERVENTION_IRS_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${INTERVENTION_IRS_URL}/${
          (plans[0] as IRSPlan).plan_id
        }/0dc2d15b-be1d-45d3-93d8-043a3a916f30/${MAP}`,
      },
      plan: plans[0] as IRSPlan,
      service: supersetServiceMock,
      structures,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSReportingMap {...props} />
      </Router>
    );
    await flushPromises();
    expect(toJson(wrapper.find('.sidebar-legend-item'))).toMatchSnapshot('Legend items');
    expect(toJson(wrapper.find('.responseItem h6'))).toMatchSnapshot('Response item titles');
    expect(toJson(wrapper.find('.responseItem p.indicator-description'))).toMatchSnapshot(
      'Namibia configs: Namibia configs: Response item descriptions'
    );
    expect(toJson(wrapper.find('p.indicator-breakdown'))).toMatchSnapshot(
      'Namibia configs: Indicator item breakdown'
    );
    expect(toJson(wrapper.find('.responseItem ProgressBar'))).toMatchSnapshot(
      'Namibia configs: Response item ProgressBar'
    );
    wrapper.unmount();
  });
});
