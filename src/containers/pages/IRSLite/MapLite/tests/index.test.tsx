import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Router } from 'react-router';
import { IRSReportingMap } from '../';
import { GREY } from '../../../../../colors';
import { SUPERSET_IRS_REPORTING_INDICATOR_STOPS } from '../../../../../configs/env';
import {
  circleLayerConfig,
  fillLayerConfig,
  lineLayerConfig,
} from '../../../../../configs/settings';
import { MAIN_PLAN, MAP, REPORT_IRS_PLAN_URL, STRUCTURE_LAYER } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
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
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import * as fixtures from '../../JurisdictionsReport/fixtures';
import { getGisidaWrapperProps, IRSIndicatorStops } from '../helpers';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const structureData = superset.processData(fixtures.ZambiaStructuresJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaAkros1JSON) || [];
const jurisdiction2Data = superset.processData(fixtures.ZambiaKMZ421JSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));
store.dispatch(fetchGenericStructures('zm-structures', structureData));
store.dispatch(fetchJurisdictions(jurisdictionData));
store.dispatch(fetchJurisdictions(jurisdiction2Data));

const history = createBrowserHistory();

describe('components/IRS Reports/IRSReportingMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      focusArea: getGenericJurisdictionByJurisdictionId(
        store.getState(),
        'zm-focusAreas',
        '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
      ),
      history,
      jurisdiction: getJurisdictionById(store.getState(), '0dc2d15b-be1d-45d3-93d8-043a3a916f30'),
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/0dc2d15b-be1d-45d3-93d8-043a3a916f30/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      structures: getGenericStructures(
        store.getState(),
        'zm-structures',
        '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
      ),
    };
    shallow(
      <Router history={history}>
        <IRSReportingMap {...props} />
      </Router>
    );
  });

  it('renders without structures', () => {
    const mock: any = jest.fn();
    const props = {
      focusArea: getGenericJurisdictionByJurisdictionId(
        store.getState(),
        'zm-focusAreas',
        '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
      ),
      history,
      jurisdiction: getJurisdictionById(store.getState(), '0dc2d15b-be1d-45d3-93d8-043a3a916f30'),
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/0dc2d15b-be1d-45d3-93d8-043a3a916f30/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      structures: {} as StructureFeatureCollection,
    };
    shallow(
      <Router history={history}>
        <IRSReportingMap {...props} />
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
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/0dc2d15b-be1d-45d3-93d8-043a3a916f30/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
      structures,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSReportingMap {...props} />
      </Router>
    );
    const helmet = Helmet.peek();
    await flushPromises();
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(helmet.title).toEqual('IRS 2019-09-05 TEST: Akros_1');
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
    expect(toJson(wrapper.find('.list-unstyled'))).toMatchSnapshot('No sprayed reasons');
    expect(wrapper.find('.list-unstyled li').length).toEqual(3);

    const indicatorStops = IRSIndicatorStops[SUPERSET_IRS_REPORTING_INDICATOR_STOPS];
    expect(wrapper.find('GisidaWrapper').props()).toEqual(
      getGisidaWrapperProps(jurisdiction as Jurisdiction, structures, indicatorStops)
    );

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        1,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
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
              comparator: '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
            {
              clause: 'WHERE',
              comparator: '727c3d40-e118-564a-b231-aac633e6abce',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 3000,
        },
      ],
      [
        '12',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
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
    ]);
    expect(supersetServiceMock).toHaveBeenCalledTimes(4);
    wrapper.unmount();
  });

  it('does not show not sprayed reasons count if they are not', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const focusArea = getGenericJurisdictionByJurisdictionId(
      store.getState(),
      'zm-focusAreas',
      '0dc2d15b-be1d-45d3-93d8-043a3a916f30'
    );

    const focusAreaClone = {
      ...focusArea,
      targstruct: 0,
      totstruct: 0,
      // tslint:disable-next-line: object-literal-sort-keys
      rooms_eligible: 0,
      rooms_sprayed: 0,
      sprayed_rooms_eligible: 0,
      sprayed_rooms_sprayed: 0,
      foundstruct: 0,
      notsprayed: 0,
      noteligible: 0,
      notasks: 0,
      sprayedstruct: 0,
      duplicates: 0,
      sprayed_duplicates: 0,
      notsprayed_reasons: '[]',
      notsprayed_reasons_counts: '{}',
      spraycov: 0,
      spraytarg: 0,
      spraysuccess: 0,
      structures_remaining_to_90_se: 0,
      roomcov: 0,
      reviewed_with_decision: 'n/a',
    };

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
      focusArea: focusAreaClone as GenericJurisdiction,
      history,
      jurisdiction,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: '0dc2d15b-be1d-45d3-93d8-043a3a916f30',
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/0dc2d15b-be1d-45d3-93d8-043a3a916f30/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      service: supersetServiceMock,
      structures,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSReportingMap {...props} />
      </Router>
    );

    await flushPromises();

    // not sprayed should not be response item titles
    expect(toJson(wrapper.find('.responseItem h6'))).toMatchSnapshot('Response item titles');
    expect(toJson(wrapper.find('.list-unstyled'))).toMatchSnapshot('No sprayed reasons');
    expect(wrapper.find('.list-unstyled li').length).toEqual(0);

    wrapper.unmount();
  });

  it('renders both Points and Polygons correctly', () => {
    const mock: any = jest.fn();

    const kmz421StructureData = superset.processData(fixtures.ZambiaKMZ421StructuresJSON) || [];

    store.dispatch(fetchGenericStructures('zm-kmz421-structures', kmz421StructureData));

    const jurisdiction = getJurisdictionById(
      store.getState(),
      '92a0c5f3-8b47-465e-961b-2998ad3f00a5'
    );

    const structures = getGenericStructures(
      store.getState(),
      'zm-kmz421-structures',
      '92a0c5f3-8b47-465e-961b-2998ad3f00a5'
    );

    const indicatorStops = IRSIndicatorStops[SUPERSET_IRS_REPORTING_INDICATOR_STOPS];

    const props = {
      focusArea: getGenericJurisdictionByJurisdictionId(
        store.getState(),
        'zm-focusAreas',
        '92a0c5f3-8b47-465e-961b-2998ad3f00a5'
      ),
      history,
      jurisdiction,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: '92a0c5f3-8b47-465e-961b-2998ad3f00a5',
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${
          (plans[0] as GenericPlan).plan_id
        }/92a0c5f3-8b47-465e-961b-2998ad3f00a5/${MAP}`,
      },
      plan: plans[0] as GenericPlan,
      structures,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSReportingMap {...props} />
      </Router>
    );

    expect(wrapper.find('GisidaWrapper').props()).toEqual(
      getGisidaWrapperProps(jurisdiction as Jurisdiction, structures, indicatorStops)
    );

    const structuresPopup = {
      body: `<div>
          <p class="heading">{{structure_type}}</p>
          <p>Status: {{business_status}}</p>
        </div>`,
      join: ['structure_jurisdiction_id', 'structure_jurisdiction_id'],
    };

    const structureStatusColors = {
      default: GREY,
      property: 'business_status',
      stops: indicatorStops,
      type: 'categorical',
    };

    expect((wrapper.find('GisidaWrapper').props() as any).layers).toEqual([
      {
        ...lineLayerConfig,
        id: `${MAIN_PLAN}-${(jurisdiction as Jurisdiction).jurisdiction_id}`,
        source: {
          ...lineLayerConfig.source,
          data: {
            ...lineLayerConfig.source.data,
            data: JSON.stringify((jurisdiction as Jurisdiction).geojson),
          },
        },
        visible: true,
      },
      {
        ...circleLayerConfig,
        filter: ['==', '$type', 'Point'],
        id: `${STRUCTURE_LAYER}-circle`,
        paint: {
          ...circleLayerConfig.paint,
          'circle-color': structureStatusColors,
          'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15.75, 2.5, 20.8, 50],
          'circle-stroke-color': structureStatusColors,
          'circle-stroke-opacity': 1,
        },
        popup: structuresPopup,
        source: {
          ...circleLayerConfig.source,
          data: {
            data: JSON.stringify(structures),
            type: 'stringified-geojson',
          },
          type: 'geojson',
        },
        visible: true,
      },
      {
        ...fillLayerConfig,
        filter: ['==', '$type', 'Polygon'],
        id: `${STRUCTURE_LAYER}-fill`,
        paint: {
          ...fillLayerConfig.paint,
          'fill-color': structureStatusColors,
          'fill-outline-color': structureStatusColors,
        },
        popup: structuresPopup,
        source: {
          ...fillLayerConfig.source,
          data: {
            ...fillLayerConfig.source.data,
            data: JSON.stringify(structures),
          },
        },
        visible: true,
      },
      {
        ...lineLayerConfig,
        filter: ['==', '$type', 'Polygon'],
        id: `${STRUCTURE_LAYER}-line`,
        paint: {
          'line-color': structureStatusColors,
          'line-opacity': 1,
          'line-width': 2,
        },
        source: {
          ...lineLayerConfig.source,
          data: {
            ...lineLayerConfig.source.data,
            data: JSON.stringify(structures),
          },
        },
      },
    ]);
  });
});
