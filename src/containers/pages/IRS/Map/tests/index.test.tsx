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
import { INTERVENTION_IRS_URL, IRS_REPORTING_TITLE, MAP } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionByJurisdictionId,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import genericStructuresReducer, {
  fetchGenericStructures,
  GenericStructure,
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
import * as fixtures from '../../JurisdictionsReport/tests/fixtures';
import { getGisidaWrapperProps } from '../helpers';

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
const jurisdictionData = superset.processData(fixtures.ZambiaAkros1JSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));
store.dispatch(fetchGenericStructures('zm-structures', structureData));
store.dispatch(fetchJurisdictions(jurisdictionData));

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
          planId: (plans[0] as IRSPlan).plan_id,
        },
        path: `${INTERVENTION_IRS_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${INTERVENTION_IRS_URL}/${
          (plans[0] as IRSPlan).plan_id
        }/0dc2d15b-be1d-45d3-93d8-043a3a916f30/${MAP}`,
      },
      plan: plans[0] as IRSPlan,
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

  it('renders IRSReportingMap correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

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
    expect(helmet.title).toEqual('IRS 2019-09-05 TEST');
    expect(toJson(wrapper.find('mapSidebar h5'))).toMatchSnapshot('Sidebar title');
    expect(toJson(wrapper.find('sidebar-legend-item'))).toMatchSnapshot('Legend items');
    expect(toJson(wrapper.find('responseItem'))).toMatchSnapshot('Response items');
    expect(wrapper.find('GisidaWrapper').props()).toEqual(
      getGisidaWrapperProps(jurisdiction as Jurisdiction, structures)
    );
    wrapper.unmount();
  });
});
