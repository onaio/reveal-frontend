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
import ConnectedIRSLiteReportingMap, { IRSLiteReportingMap } from '../';
import { GisidaLiteProps } from '../../../../../components/GisidaLite';
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
  StructureFeatureCollection,
} from '../../../../../store/ducks/generic/structures';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import { InterventionType } from '../../../../../store/ducks/plans';
import * as fixtures from '../../JurisdictionsReportLite/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const structureData = superset.processData(fixtures.ZambiaStructuresJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];
const jurisdictionData2 = superset.processData(fixtures.ZambiaJurisdictionsGeojsonJSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));
store.dispatch(fetchGenericStructures('zm-structures', structureData));
store.dispatch(fetchJurisdictions(jurisdictionData));
store.dispatch(fetchJurisdictions(jurisdictionData2));

const history = createBrowserHistory();

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

describe('components/IRS Reports/IRSLiteReportingMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      focusArea: getGenericJurisdictionByJurisdictionId(
        store.getState(),
        'zm-focusAreas',
        'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'
      ),
      history,
      jurisdiction: getJurisdictionById(store.getState(), 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'),
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
      structures: getGenericStructures(
        store.getState(),
        'zm-structures',
        'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'
      ),
    };
    shallow(
      <Router history={history}>
        <IRSLiteReportingMap {...props} />
      </Router>
    );
  });

  it('renders without structures', () => {
    const mock: any = jest.fn();
    const props = {
      focusArea: getGenericJurisdictionByJurisdictionId(
        store.getState(),
        'zm-focusAreas',
        'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'
      ),
      history,
      jurisdiction: getJurisdictionById(store.getState(), 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'),
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
      structures: {} as StructureFeatureCollection,
    };
    shallow(
      <Router history={history}>
        <IRSLiteReportingMap {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
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
    const helmet = Helmet.peek();
    await act(async () => {
      await flushPromises();
    });
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(helmet.title).toEqual(
      'IRS 2019-09-05 TEST: so_Sompani_Health_Post_MACEPA_IRS_Lite_2020'
    );
    expect(toJson(wrapper.find('.mapSidebar h5'))).toMatchSnapshot('Sidebar title');
    expect(toJson(wrapper.find('.sidebar-legend-item'))).toMatchSnapshot('Legend items');
    expect(toJson(wrapper.find('.responseItem h6'))).toMatchSnapshot('Response item titles');
    expect(toJson(wrapper.find('.responseItem p.indicator-description'))).toMatchSnapshot(
      'Response item descriptions'
    );
    expect(toJson(wrapper.find('p.indicator-breakdown'))).toMatchSnapshot(
      'Indicator item breakdown'
    );
    expect(toJson(wrapper.find('.responseItem ProgressBar'))).toMatchSnapshot(
      'Response item ProgressBar'
    );

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        1,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
          ],
          row_limit: 1,
        },
      ],
      [
        '14',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
            {
              clause: 'WHERE',
              comparator: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 2000,
        },
      ],
      [
        '12',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
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
    ]);
    expect(supersetServiceMock).toHaveBeenCalledTimes(4);
    wrapper.unmount();
  });

  it('renders not found', async () => {
    const mock: any = jest.fn();
    const props = {
      focusArea: getGenericJurisdictionByJurisdictionId(
        store.getState(),
        'zm-focusAreas',
        'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'
      ),
      history,
      jurisdiction: getJurisdictionById(store.getState(), 'ce13e7f4-6926-4be0-9117-519bd1cc4bb2'),
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/ce13e7f4-6926-4be0-9117-519bd1cc4bb2/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      structures: {} as StructureFeatureCollection,
    };

    const wrapper = mount(
      <Router history={history}>
        <IRSLiteReportingMap {...props} />
      </Router>
    );

    await act(async () => {
      await flushPromises();
    });

    expect(toJson(wrapper.find('NotFound'))).toMatchSnapshot('Not Found');
  });

  it('map props are generated without structures', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const focusArea = getGenericJurisdictionByJurisdictionId(
      store.getState(),
      'zm-focusAreas',
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
      structures: null,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSLiteReportingMap {...props} />
      </Router>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(
      'IRS 2019-09-05 TEST: so_Sompani_Health_Post_MACEPA_IRS_Lite_2020'
    );
    // map zoom, mapCenter and Bounds are generated without structures
    expect(wrapper.find('MemoizedGisidaLiteMock').length).toEqual(1);
    expect((wrapper.find('MemoizedGisidaLiteMock').props() as GisidaLiteProps).zoom).toEqual(11);
    expect((wrapper.find('MemoizedGisidaLiteMock').props() as GisidaLiteProps).mapCenter).toEqual([
      27.669583969324798,
      -16.7185900742225,
    ]);
    expect((wrapper.find('MemoizedGisidaLiteMock').props() as GisidaLiteProps).mapBounds).toEqual([
      27.5511379390647,
      -16.7924169179064,
      27.7880299995849,
      -16.6447632305386,
    ]);
  });

  it('loads error page when data is invalid', async () => {
    const mock = jest.fn();
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve([]));
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve([]));
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve([]));
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve(plans));

    const props = {
      history,
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
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSLiteReportingMap {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(wrapper.find('ErrorPage').text()).toEqual(
      'An error ocurred. Please try and refresh the page.The specific error is: An Error Ocurred'
    );
    wrapper.unmount();
  });

  it('works correctly with store', async () => {
    const mock = jest.fn();
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve(jurisdictionData));
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve(structureData));
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve(focusAreaData));
    supersetServiceMock.mockImplementationOnce(() => Promise.resolve(plans));

    const props = {
      history,
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
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSLiteReportingMap {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('.page-title').text()).toEqual(
      'IRS 2019-09-05 TEST: so_Sompani_Health_Post_MACEPA_IRS_Lite_2020'
    );
    expect(wrapper.find('MemoizedGisidaLiteMock').length).toEqual(1);
    expect(supersetServiceMock).toHaveBeenCalledTimes(4);
    wrapper.unmount();
  });
});
