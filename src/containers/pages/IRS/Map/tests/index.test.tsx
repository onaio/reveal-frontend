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
import { MAP, REPORT_IRS_PLAN_URL } from '../../../../../constants';
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
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import * as mapUtils from '../../../FocusInvestigation/map/active/helpers/utils';
import * as fixtures from '../../JurisdictionsReport/fixtures';
import { IRSIndicatorStops } from '../helpers';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

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

    expect(toJson(wrapper.find('MemoizedGisidaLiteMock div'))).toMatchSnapshot(
      'map renders correctly'
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
    const buildGsLiteLayersSpy = jest.spyOn(mapUtils, 'buildGsLiteLayers');
    const buildJurisdictionLayersSpy = jest.spyOn(mapUtils, 'buildJurisdictionLayers');
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
    mount(
      <Router history={history}>
        <IRSReportingMap {...props} />
      </Router>
    );

    expect(buildGsLiteLayersSpy).toBeCalledTimes(1);
    expect(buildGsLiteLayersSpy).toBeCalledWith('irs_report_structures', structures, null, {
      circleColor: {
        property: 'business_status',
        stops: IRSIndicatorStops.zambia2019,
        type: 'categorical',
      },
    });

    expect(buildJurisdictionLayersSpy).toBeCalledTimes(1);
    expect(buildJurisdictionLayersSpy).toBeCalledWith(jurisdiction);
  });
});
