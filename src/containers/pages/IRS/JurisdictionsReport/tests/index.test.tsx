import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Router } from 'react-router';
import { JurisdictionReport } from '../';
import { REPORT_IRS_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionByJurisdictionId,
  getGenericJurisdictionsArray,
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
import { IRSTableColumns } from '../helpers';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-jurisdictions', jurisdictionData));
store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));

const history = createBrowserHistory();

describe('components/IRS Reports/JurisdictionReport', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    let jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-focusAreas',
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
          planId: (plans[0] as IRSPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_PLAN_URL}/${(plans[0] as IRSPlan).plan_id}`,
      },
      plan: plans[0] as IRSPlan,
    };
    shallow(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    let jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-focusAreas',
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
          planId: (plans[0] as IRSPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_PLAN_URL}/${(plans[0] as IRSPlan).plan_id}`,
      },
      plan: plans[0] as IRSPlan,
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );
    const helmet = Helmet.peek();
    await flushPromises();
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(helmet.title).toEqual('IRS Reporting: IRS 2019-09-05 TEST');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      IRSTableColumns.zambiaJurisdictions2019
    );
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
          order_by_cols: ['["jurisdiction_depth",+true]'],
          row_limit: 3000,
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
          order_by_cols: ['["jurisdiction_depth",+true]'],
          row_limit: 3000,
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
        'zm-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-focusAreas',
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
          planId: (plans[0] as IRSPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_PLAN_URL}/${(plans[0] as IRSPlan).plan_id}`,
      },
      plan: plans[0] as IRSPlan,
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
      IRSTableColumns.zambiaJurisdictions2019
    );

    // Zambia URL
    expect(
      wrapper.find(`a[href$="${baseURL}/22bc44dd-752d-4c20-8761-617361b4f1e7"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/22bc44dd-752d-4c20-8761-617361b4f1e7"]`)
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
    ).toEqual('Zambia');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Reporting: IRS 2019-09-05 TEST: Zambia'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      IRSTableColumns.zambiaJurisdictions2019
    );

    // Lusaka URL
    expect(
      wrapper.find(`a[href$="${baseURL}/fd5a22ba-fa0e-4fdc-ae1c-1db8965b7b43"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/fd5a22ba-fa0e-4fdc-ae1c-1db8965b7b43"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(5);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(4);
    expect(
      wrapper
        .find('HeaderBreadcrumb a')
        .last()
        .text()
    ).toEqual('Zambia');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('Lusaka');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Reporting: IRS 2019-09-05 TEST: Lusaka'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      IRSTableColumns.zambiaJurisdictions2019
    );

    // Lusaka Test
    expect(
      wrapper.find(`a[href$="${baseURL}/8f1fd4cf-264d-4ed6-8838-e538c5845d46"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/8f1fd4cf-264d-4ed6-8838-e538c5845d46"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(6);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(5);
    expect(
      wrapper
        .find('HeaderBreadcrumb a')
        .last()
        .text()
    ).toEqual('Lusaka');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('Lusaka_Test');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Reporting: IRS 2019-09-05 TEST: Lusaka_Test'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      IRSTableColumns.zambiaJurisdictions2019
    );

    // Lusaka HFC
    expect(
      wrapper.find(`a[href$="${baseURL}/2bf9915d-8725-4061-983d-5938802ac0f0"]`).length
    ).toEqual(1);
    wrapper
      .find(`a[href$="${baseURL}/2bf9915d-8725-4061-983d-5938802ac0f0"]`)
      .first()
      .simulate('click', { button: 0 });
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(7);
    expect(wrapper.find('HeaderBreadcrumb a').length).toEqual(6);
    expect(
      wrapper
        .find('HeaderBreadcrumb a')
        .last()
        .text()
    ).toEqual('Lusaka_Test');
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('Lusaka HFC');
    expect(wrapper.find('h3.page-title').text()).toEqual(
      'IRS Reporting: IRS 2019-09-05 TEST: Lusaka HFC'
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      IRSTableColumns.zambiaFocusArea2019
    );

    expect(wrapper.find('DrillDownTable a').length).toEqual(14);
    expect(
      wrapper.find('DrillDownTable .plan-jurisdiction-name.main-span').map(e => e.text())
    ).toEqual([
      '  Akros 3',
      '  Akros_2',
      '  Ibex_1',
      '  Kalikiliki Settlement',
      '  Akros_1',
      '  Bauleni Settlement',
      '  Helen Kaunda Settlement',
    ]);
    expect(wrapper.find('DrillDownTable a').map(e => e.props().href)).toEqual([
      `${baseURL}/a049c269-6c06-47ef-b5b3-4f5f7736d97d/map`,
      `${baseURL}/a049c269-6c06-47ef-b5b3-4f5f7736d97d/map`,
      `${baseURL}/7aee968f-6b1f-427d-bba3-fa292937532b/map`,
      `${baseURL}/7aee968f-6b1f-427d-bba3-fa292937532b/map`,
      `${baseURL}/67f2211d-0cfc-4bde-be0e-bf8b5b3e0c2c/map`,
      `${baseURL}/67f2211d-0cfc-4bde-be0e-bf8b5b3e0c2c/map`,
      `${baseURL}/d7e42fb9-381c-4fc6-a4c1-7e112076c559/map`,
      `${baseURL}/d7e42fb9-381c-4fc6-a4c1-7e112076c559/map`,
      `${baseURL}/0dc2d15b-be1d-45d3-93d8-043a3a916f30/map`,
      `${baseURL}/0dc2d15b-be1d-45d3-93d8-043a3a916f30/map`,
      `${baseURL}/0b142aff-341c-4d15-878e-55942bc873aa/map`,
      `${baseURL}/0b142aff-341c-4d15-878e-55942bc873aa/map`,
      `${baseURL}/fdc73ce5-650a-4246-a2b3-a6665adc8249/map`,
      `${baseURL}/fdc73ce5-650a-4246-a2b3-a6665adc8249/map`,
    ]);
  });
});
