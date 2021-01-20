import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { IRSLiteReportingMap } from '../';
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
import genericStructuresReducer, {
  fetchGenericStructures,
  getGenericStructures,
  reducerName as genericStructuresReducerName,
} from '../../../../../store/ducks/generic/structures';
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import * as fixtures from '../../JurisdictionsReportLite/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env', () => ({
  GISIDA_MAPBOX_TOKEN: 'hunter2',
  GISIDA_TIMEOUT: 3000,
  HIDDEN_MAP_LEGEND_ITEMS: [],
  SUPERSET_IRS_LITE_REPORTING_INDICATOR_ROWS: 'zambia2020',
  SUPERSET_IRS_LITE_REPORTING_INDICATOR_STOPS: 'zambia2020',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES: '11',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_FOCUS_AREA_SLICE: '12',
  SUPERSET_IRS_LITE_REPORTING_PLANS_SLICE: '13',
  SUPERSET_IRS_LITE_REPORTING_STRUCTURES_DATA_SLICE: '14',
  SUPERSET_JURISDICTIONS_SLICE: 1,
  SUPERSET_MAX_RECORDS: 2000,
}));

jest.mock('../../../../../components/GisidaLite', () => {
  const MemoizedGisidaLiteMock = () => <div>Mock component</div>;
  return {
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const structureData = superset.processData(fixtures.ZambiaStructuresJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));
store.dispatch(fetchGenericStructures('zm-structures', structureData));
store.dispatch(fetchJurisdictions(jurisdictionData));

const history = createBrowserHistory();

describe('components/IRS Reports/IRSLiteReportingMap', () => {
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
      'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'
    );

    const structures = getGenericStructures(
      store.getState(),
      'zm-structures',
      'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'
    );

    const jurisdiction = getJurisdictionById(
      store.getState(),
      'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'
    );

    const props = {
      focusArea,
      history,
      jurisdiction,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2',
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/ce13e7f4-6926-4be0-9117-519bd1cc4bb2/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
      structures,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSLiteReportingMap {...props} />
      </Router>
    );
    await flushPromises();
    wrapper.update();
    expect(wrapper.find('.sidebar-legend-item').length).toEqual(3);
    expect(toJson(wrapper.find('.sidebar-legend-item'))).toMatchSnapshot('Legend items');
    wrapper.unmount();
  });
});
