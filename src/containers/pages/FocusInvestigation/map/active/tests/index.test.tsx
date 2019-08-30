import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../../constants';
import { wrapFeatureCollection } from '../../../../../../helpers/utils';
import store from '../../../../../../store';
import { fetchGoals } from '../../../../../../store/ducks/goals';
import { fetchJurisdictions } from '../../../../../../store/ducks/jurisdictions';
import { fetchPlans, Plan } from '../../../../../../store/ducks/plans';
import { fetchTasks } from '../../../../../../store/ducks/tasks';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import ConnectedMapSingleFI, { MapSingleFIProps, SingleActiveFIMap } from '../../active/';

jest.mock('../../../../../../components/GisidaWrapper', () => {
  const GisidaWrapperMock = () => <div>I love oov</div>;
  return GisidaWrapperMock;
});
jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();

describe('containers/pages/FocusInvestigation/activeMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan1 as Plan,
      pointFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task3.geojson]),
      polygonFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task2.geojson]),
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
      supersetService: supersetServiceMock,
    };
    shallow(
      <Router history={history}>
        <SingleActiveFIMap {...props} />
      </Router>
    );
  });

  it('renders SingleActiveFimap correctly & changes page title', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan1 as Plan,
      pointFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task3.geojson]),
      polygonFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task2.geojson]),
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleActiveFIMap {...props} />
      </Router>
    );

    // what is passed as the document page title text
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Focus Investigation: A1-Tha Luang Village 1 Focus 01');

    // Check a few crucial components to make sure the page has rendered

    // check Header Breadcrumb
    const headerWrapper = wrapper.find('HeaderBreadcrumb');
    expect(toJson(headerWrapper)).toMatchSnapshot('HeaderWrapper');

    // Check gisida component using a mock
    expect(toJson(wrapper.find('GisidaWrapperMock'))).toMatchSnapshot('GisidaWrapperMock');

    // how about the selectPlan component
    expect(wrapper.find('SelectPlan').length).toEqual(1);

    // We should have progressBars somewhere in there
    expect(toJson(wrapper.find('.targetItem').first())).toMatchSnapshot('ProgressBar instance');

    wrapper.unmount();
  });

  it('works with redux store (gisidawrapper component that loads jurisdiction without structures and tasks)', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    store.dispatch(fetchGoals([fixtures.goal3]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1 as Plan]));
    store.dispatch(fetchTasks(fixtures.tasks));
    const props = {
      currentGoal: fixtures.goal3,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      pointFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task3.geojson]),
      polygonFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task2.geojson]),
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );

    expect(wrapper.find('GisidaWrapperMock').props()).toMatchSnapshot('GisidaWrapperMock');

    // Check data passed to component props that should come from redux

    const singleActiveWrapperProps = wrapper.find('SingleActiveFIMap').props();
    // plan prop
    expect((singleActiveWrapperProps as MapSingleFIProps).plan).toEqual(fixtures.plan1);

    // goals prop
    expect((singleActiveWrapperProps as MapSingleFIProps).goals).toEqual([]);

    // jurisdiction prop
    expect((singleActiveWrapperProps as MapSingleFIProps).jurisdiction).toEqual(
      fixtures.jurisdictions[0]
    );

    // plansByFocusArea
    expect((singleActiveWrapperProps as MapSingleFIProps).plansByFocusArea).toEqual([
      fixtures.plan1,
    ]);

    // structures
    expect((singleActiveWrapperProps as MapSingleFIProps).structures).toBeNull();

    wrapper.unmount();
  });

  it('calls superset with the correct params', async () => {
    const actualFormData = superset.getFormData;
    const getFormDataMock: any = jest.fn();
    getFormDataMock.mockImplementation((...args: any) => {
      return actualFormData(...args);
    });
    superset.getFormData = getFormDataMock;
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);
    store.dispatch(fetchGoals([fixtures.goal3]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1 as Plan]));
    store.dispatch(fetchTasks(fixtures.tasks));
    const props = {
      currentGoal: fixtures.goal3,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      pointFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task3.geojson]),
      polygonFeatureCollection: wrapFeatureCollection([fixtures.coloredTasks.task2.geojson]),
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    const jurisdictionParams = {
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'jurisdiction_id',
        },
      ],
      row_limit: 3000,
    };
    const supersetParams = {
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_id',
        },
      ],
      row_limit: 3000,
    };
    const goalParams = {
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_id',
        },
      ],
      order_by_cols: ['["action_prefix",+true]'],
      row_limit: 3000,
    };
    const getformDataCallList = [
      [
        3000,
        [
          {
            comparator: fixtures.plan1.jurisdiction_id,
            operator: '==',
            subject: 'jurisdiction_id',
          },
        ],
      ],
      [3000, [{ comparator: fixtures.plan1.plan_id, operator: '==', subject: 'plan_id' }]],
      [
        3000,
        [{ comparator: fixtures.plan1.plan_id, operator: '==', subject: 'plan_id' }],
        { action_prefix: true },
      ],
    ];
    const callList = [
      [1, jurisdictionParams],
      [2, jurisdictionParams],
      [0, jurisdictionParams],
      [3, goalParams],
      [4, supersetParams],
    ];

    await flushPromises();
    expect(supersetServiceMock.mock.calls).toEqual(callList);
    expect(supersetServiceMock).toHaveBeenCalledTimes(5);
    expect((superset.getFormData as any).mock.calls).toEqual(getformDataCallList);
    wrapper.unmount();
  });
});
