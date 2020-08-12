import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { AN_ERROR_OCCURRED } from '../../../../../configs/lang';
import { FI_SINGLE_URL } from '../../../../../constants';
import * as errorHelpers from '../../../../../helpers/errors';
import { extractPlan } from '../../../../../helpers/utils';
import store from '../../../../../store';
import jurisdictionReducer, {
  fetchJurisdictions,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import plansReducer, {
  Plan,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import { defaultActiveFIProps, FIJurisdiction } from '../index';

/** mock the envs */
jest.mock('../../../../../configs/env');

/**
 * This mock is necessary because FIJurisdiction renders the JurisdictionMap
 * component by passing to it a callback function that is then called with the
 * jurisdiction object.  We have to simulate this so that JurisdictionMap can have
 * a valid jurisdiction.
 */
jest.mock('../../../../JurisdictionMap', () => {
  const JurisdictionMap = (props: any) => {
    const { callback } = props;

    // Unfortunately jest does not let us access any variables defined out of this
    // scope
    callback(
      {
        geojson: {
          geometry: {
            coordinates: [
              [
                [101.166915893555, 15.0715019595332],
                [101.165628433228, 15.069429992157],
                [101.164855957031, 15.0649130333519],
                [101.164898872375, 15.061473449978],
                [101.165843009949, 15.0585311116698],
                [101.168718338013, 15.0577022766384],
                [101.173524856567, 15.0577437184666],
                [101.179447174072, 15.0583653449216],
                [101.183996200562, 15.0589455279759],
                [101.189103126526, 15.0597743581685],
                [101.191892623901, 15.0629238834779],
                [101.191549301147, 15.0671093647448],
                [101.19086265564, 15.0727036913665],
                [101.190605163574, 15.0748170653661],
                [101.188631057739, 15.0768061040682],
                [101.185412406921, 15.0769304183694],
                [101.182150840759, 15.0772619228176],
                [101.177172660828, 15.0780906816776],
                [101.174211502075, 15.0777591785211],
                [101.172151565552, 15.0765989134045],
                [101.168503761292, 15.0753557651845],
                [101.166915893555, 15.0715019595332],
              ],
            ],
            type: 'Polygon',
          },
          id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
          properties: {
            jurisdiction_name: 'TLv1_01',
            jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
          },
          type: 'Feature',
        },
        jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
      } // TODO: find a way to call this from fixtures
    );
    return <div>I love oov</div>;
  };
  return JurisdictionMap;
});

/** register reducers */
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

const history = createBrowserHistory();

describe('containers/FocusInvestigation/Jurisdiction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();

    const props = {
      ...defaultActiveFIProps,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { jurisdictionId: fixtures.jurisdiction1.jurisdiction_id },
        path: `${FI_SINGLE_URL}/:jurisdictionId`,
        url: `${FI_SINGLE_URL}/${fixtures.jurisdiction1.jurisdiction_id}`,
      },
    };
    shallow(
      <MemoryRouter>
        <FIJurisdiction {...props} />
      </MemoryRouter>
    );
  });

  it('renders correctly', async () => {
    store.dispatch(fetchJurisdictions([fixtures.jurisdiction1]));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const props = {
      ...defaultActiveFIProps,
      completeReactivePlans: [fixtures.plan101 as Plan],
      completeRoutinePlans: [fixtures.plan103 as Plan],
      currentReactivePlans: [fixtures.plan99 as Plan],
      currentRoutinePlans: [fixtures.plan102 as Plan],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: {
        isExact: true,
        params: { jurisdictionId: fixtures.jurisdiction1.jurisdiction_id },
        path: `${FI_SINGLE_URL}/:jurisdictionId`,
        url: `${FI_SINGLE_URL}/${fixtures.jurisdiction1.jurisdiction_id}`,
      },
      supersetService: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <FIJurisdiction {...props} />
        </MemoryRouter>
      </Provider>
    );

    /** Show loading indicator */
    expect(wrapper.find('FIJurisdiction>Ripple').length).toEqual(1);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    /** No longer show loading indicator */
    expect(wrapper.find('FIJurisdiction>Ripple').length).toEqual(0);

    // check that the documents title was changed correctly
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Focus Investigations in TLv1_01');

    expect(
      wrapper
        .find('h2.page-title')
        .last()
        .text()
    ).toEqual('Focus Investigations in TLv1_01');

    // check breadcrumbs
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb li').length).toEqual(7);
    // check the hierarchy
    expect(toJson(wrapper.find('HeaderBreadcrumb li a'))).toMatchSnapshot('HeaderBreadcrumb li a');
    // check last item
    expect(
      wrapper
        .find('HeaderBreadcrumb li')
        .last()
        .text()
    ).toEqual('TLv1_01');

    expect(
      wrapper
        .find('.focus-area-info-title')
        .last()
        .text()
    ).toEqual('Focus Area Information');

    expect(toJson(wrapper.find('JurisdictionMap'))).toMatchSnapshot('JurisdictionMap');
    expect(toJson(wrapper.find('.focus-area-info-section dl'))).toMatchSnapshot(
      'focus-area-info-section'
    );

    expect(
      wrapper
        .find('h4.fi-table.current')
        .last()
        .text()
    ).toEqual('Current Focus Investigations');

    expect(
      wrapper
        .find('h4.fi-table.complete')
        .last()
        .text()
    ).toEqual('Complete Focus Investigations');

    // subsection titles
    expect(
      wrapper
        .find('.current-plans h3.page-title')
        .first()
        .text()
    ).toEqual('Reactive');
    expect(
      wrapper
        .find('.current-plans h3.page-title')
        .last()
        .text()
    ).toEqual('Routine');

    expect(
      wrapper
        .find('.complete-plans h3.page-title')
        .first()
        .text()
    ).toEqual('Reactive');
    expect(
      wrapper
        .find('.complete-plans h3.page-title')
        .last()
        .text()
    ).toEqual('Routine');

    expect(wrapper.find('.current-plans TableHeader').length).toEqual(2);
    expect(
      wrapper
        .find('.current-plans TableHeader')
        .first()
        .props() as any
    ).toEqual({
      plansArray: [fixtures.plan99],
    });
    expect(
      wrapper
        .find('.current-plans TableHeader')
        .last()
        .props() as any
    ).toEqual({
      plansArray: [fixtures.plan102],
    });
    expect(toJson(wrapper.find('.current-plans LinkAsButton a').first())).toMatchSnapshot(
      'Link to create new plans'
    );

    expect(
      wrapper
        .find('.current-plans DrillDownTable')
        .first()
        .props()
    ).toMatchSnapshot({
      data: expect.any(Array) /** just for purposes of making snapshot smaller */,
    });
    expect(
      wrapper
        .find('.current-plans DrillDownTable')
        .first()
        .props().data
    ).toEqual([extractPlan(fixtures.plan99 as Plan)]);

    expect(
      wrapper
        .find('.current-plans DrillDownTable')
        .last()
        .props()
    ).toMatchSnapshot({
      data: expect.any(Array) /** just for purposes of making snapshot smaller */,
    });
    expect(
      wrapper
        .find('.current-plans DrillDownTable')
        .last()
        .props().data
    ).toEqual([extractPlan(fixtures.plan102 as Plan)]);

    expect(wrapper.find('.complete-plans TableHeader').length).toEqual(2);
    expect(
      wrapper
        .find('.complete-plans TableHeader')
        .first()
        .props() as any
    ).toEqual({
      plansArray: [fixtures.plan101],
    });
    expect(
      wrapper
        .find('.complete-plans TableHeader')
        .last()
        .props() as any
    ).toEqual({
      plansArray: [fixtures.plan103],
    });
    expect(toJson(wrapper.find('.complete-plans LinkAsButton a').first())).toMatchSnapshot(
      'Link to create new plans'
    );

    expect(
      wrapper
        .find('.complete-plans DrillDownTable')
        .first()
        .props()
    ).toMatchSnapshot({
      data: expect.any(Array) /** just for purposes of making snapshot smaller */,
    });
    expect(
      wrapper
        .find('.complete-plans DrillDownTable')
        .first()
        .props().data
    ).toEqual([extractPlan(fixtures.plan101 as Plan)]);

    expect(
      wrapper
        .find('.complete-plans DrillDownTable')
        .last()
        .props()
    ).toMatchSnapshot({
      data: expect.any(Array) /** just for purposes of making snapshot smaller */,
    });
    expect(
      wrapper
        .find('.complete-plans DrillDownTable')
        .last()
        .props().data
    ).toEqual([extractPlan(fixtures.plan103 as Plan)]);
  });

  it('renders empty tables correctly', async () => {
    store.dispatch(fetchJurisdictions([fixtures.jurisdiction1]));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const props = {
      ...defaultActiveFIProps,
      completeReactivePlans: [],
      completeRoutinePlans: [],
      currentReactivePlans: [],
      currentRoutinePlans: [],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: {
        isExact: true,
        params: { jurisdictionId: fixtures.jurisdiction1.jurisdiction_id },
        path: `${FI_SINGLE_URL}/:jurisdictionId`,
        url: `${FI_SINGLE_URL}/${fixtures.jurisdiction1.jurisdiction_id}`,
      },
      supersetService: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <FIJurisdiction {...props} />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('.current-plans NullDataTable').length).toEqual(2);

    expect(
      wrapper
        .find('.current-plans NullDataTable')
        .first()
        .text()
    ).toMatchInlineSnapshot(`"Reactive    No Investigations Found"`);
    expect(
      wrapper
        .find('.current-plans NullDataTable')
        .last()
        .text()
    ).toMatchInlineSnapshot(
      `"RoutineNameFI StatusProvinceDistrictCantonVillageFocus AreaStatusStart DateEnd DateNo Investigations Found"`
    );
  });

  it('renders supersetService error correctly', async () => {
    const mockDisplayError: any = jest.fn();
    (errorHelpers as any).displayError = mockDisplayError;

    const error = new Error('Catastrophy!!');

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockRejectedValue(error);

    const props = {
      ...defaultActiveFIProps,
      completeReactivePlans: [],
      completeRoutinePlans: [],
      currentReactivePlans: [],
      currentRoutinePlans: [],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: jest.fn() as any,
      match: {
        isExact: true,
        params: { jurisdictionId: fixtures.jurisdiction1.jurisdiction_id },
        path: `${FI_SINGLE_URL}/:jurisdictionId`,
        url: `${FI_SINGLE_URL}/${fixtures.jurisdiction1.jurisdiction_id}`,
      },
      supersetService: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <FIJurisdiction {...props} />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(mockDisplayError.mock.calls).toEqual([[error]]);
    expect(mockDisplayError).toHaveBeenCalledTimes(1);

    expect(toJson(wrapper.find('div'))).toMatchSnapshot('supersetService error');
  });

  it('renders fetch error correctly', async () => {
    const mockDisplayError: any = jest.fn();
    (errorHelpers as any).displayError = mockDisplayError;

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => undefined);

    const props = {
      ...defaultActiveFIProps,
      completeReactivePlans: [],
      completeRoutinePlans: [],
      currentReactivePlans: [],
      currentRoutinePlans: [],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: jest.fn() as any,
      match: {
        isExact: true,
        params: { jurisdictionId: fixtures.jurisdiction1.jurisdiction_id },
        path: `${FI_SINGLE_URL}/:jurisdictionId`,
        url: `${FI_SINGLE_URL}/${fixtures.jurisdiction1.jurisdiction_id}`,
      },
      supersetService: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <FIJurisdiction {...props} />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(mockDisplayError.mock.calls).toEqual([[new Error(AN_ERROR_OCCURRED)]]);
    expect(mockDisplayError).toHaveBeenCalledTimes(1);

    expect(toJson(wrapper.find('div'))).toMatchSnapshot('jurisdiction error');
  });
});
