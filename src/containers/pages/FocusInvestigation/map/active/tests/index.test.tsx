import superset from '@onaio/superset-connector';
import { act } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import SelectComponent from '../../../../../../components/SelectPlan';
import { AN_ERROR_OCCURRED } from '../../../../../../configs/lang';
import {
  CASE_CONFIRMATION_GOAL_ID,
  FI_SINGLE_URL,
  RACD_REGISTER_FAMILY_ID,
} from '../../../../../../constants';
import * as helperErrors from '../../../../../../helpers/errors';
import { wrapFeatureCollection } from '../../../../../../helpers/utils';
import store from '../../../../../../store';
import * as goalDucks from '../../../../../../store/ducks/goals';
import * as jurisdictionDucks from '../../../../../../store/ducks/jurisdictions';
import * as planDucks from '../../../../../../store/ducks/plans';
import * as structureDucks from '../../../../../../store/ducks/structures';
import * as tasksDucks from '../../../../../../store/ducks/tasks';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import ConnectedMapSingleFI, { MapSingleFIProps, SingleActiveFIMap } from '../../active/';
import * as utils from '../helpers/utils';
import * as fixturesMap from './fixtures';
import {
  processedOneGoalGoals,
  processedOneGoalJurisdiction,
  processedOneGoalPlan,
  processedOneGoalTasks,
} from './fixtures';

jest.mock('../../../../../../components/GisidaLite', () => {
  const GisidaLiteMock = () => <div>I love oov</div>;
  const MemoizedGisidaLiteMock = () => <div>I love oov</div>;
  return {
    GisidaLite: GisidaLiteMock,
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});

jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();
const { fetchGoals } = goalDucks;
const { fetchJurisdictions } = jurisdictionDucks;
const fetchPlans = planDucks.fetchPlans;
const { fetchTasks } = tasksDucks;

describe('containers/pages/FocusInvestigation/activeMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(goalDucks.removeGoalsAction);
    store.dispatch(jurisdictionDucks.removeJurisdictionsAction);
    store.dispatch(planDucks.removePlansAction);
    store.dispatch(structureDucks.removeStructuresAction);
    store.dispatch(tasksDucks.removeTasksAction);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3 as goalDucks.Goal],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan1,
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

  it('renders SingleActiveFimap correctly & changes page title', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3 as goalDucks.Goal],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan1,
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
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // what is passed as the document page title text
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Focus Investigation: A1-Tha Luang Village 1 Focus 01');

    // Check a few crucial components to make sure the page has rendered

    // check Header Breadcrumb
    const headerWrapper = wrapper.find('Breadcrumb');
    expect(toJson(headerWrapper)).toMatchSnapshot('Breadcrumb');

    // Check gisida component using a mock
    expect(toJson(wrapper.find('MemoizedGisidaLiteMock div'))).toMatchSnapshot(
      'MemoizedGisidaLiteMock div'
    );

    const mapProps = wrapper.find('MemoizedGisidaLiteMock').props();
    expect((mapProps as any).mapCenter).toEqual([101.178374290466, 15.067896479158]);
    expect((mapProps as any).mapBounds).toEqual([
      101.164855957031,
      15.0577022766384,
      101.191892623901,
      15.0780906816776,
    ]);
    // Check Gisida component map layers
    expect((mapProps as any).layers.map((e: any) => e.key)).toMatchSnapshot('GisidaLite layers');

    // how about the selectPlan component
    expect(wrapper.find('SelectPlan').length).toEqual(1);

    // We should have progressBars somewhere in there
    expect(toJson(wrapper.find('.targetItem').first())).toMatchSnapshot('ProgressBar instance');
    wrapper.unmount();
  });

  it('works with redux store (gisidawrapper component that loads jurisdiction without structures and tasks)', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    store.dispatch(fetchGoals([fixtures.goal3 as goalDucks.Goal]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1]));
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
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // case confirmation activity link si not clickable
    expect(wrapper.find(CASE_CONFIRMATION_GOAL_ID)).toMatchSnapshot('Should not be clickable tag');

    // by default the RACD register families should be active
    expect(wrapper.find(`#${RACD_REGISTER_FAMILY_ID}`)).toMatchSnapshot(
      'should be active by default'
    );
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

    // structures
    expect((singleActiveWrapperProps as MapSingleFIProps).structures).toBeNull();

    // does not render the current plan under other plans select dropdown
    const otherPlansSelectProps = wrapper.find(SelectComponent).props();
    expect(otherPlansSelectProps.plansArray).toEqual([]);

    wrapper.unmount();
  });

  it('works correctly with Redux store when there is just one goal', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    store.dispatch(fetchGoals(processedOneGoalGoals));
    store.dispatch(fetchJurisdictions(processedOneGoalJurisdiction));
    store.dispatch(fetchPlans(processedOneGoalPlan));
    store.dispatch(fetchTasks(processedOneGoalTasks));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: processedOneGoalPlan[0].id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      pointFeatureCollection: wrapFeatureCollection(processedOneGoalTasks),
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const mapProps = wrapper.find('MemoizedGisidaLiteMock').props();
    expect((mapProps as any).mapCenter).toEqual([99.36859975, 11.33824805]);
    expect((mapProps as any).mapBounds).toEqual([99.3564178, 11.3296907, 99.3807817, 11.3468054]);
    // Check Gisida component map layers
    expect((mapProps as any).layers.map((e: any) => e.key)).toMatchSnapshot('GisidaLite layers');

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
    store.dispatch(fetchGoals([fixtures.goal3 as goalDucks.Goal]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1]));
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
          expressionType: 'SQL',
          sqlExpression: `(plan_id = '10f9e9fa-ce34-4b27-a961-72fab5206ab6') OR 
            (jurisdiction_id = '450fc15b-5bd2-468a-927a-49cb10d3bcac' AND goal_id = 'Case_Confirmation')`,
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
      [
        3000,
        [{ comparator: fixtures.plan1.plan_id, operator: '==', subject: 'plan_id' }],
        { action_prefix: true },
      ],
      [
        3000,
        [
          {
            sqlExpression: `(plan_id = '10f9e9fa-ce34-4b27-a961-72fab5206ab6') OR 
            (jurisdiction_id = '450fc15b-5bd2-468a-927a-49cb10d3bcac' AND goal_id = 'Case_Confirmation')`,
          },
        ],
      ],
    ];

    const callList = [
      [1, jurisdictionParams],
      [2, jurisdictionParams],
      [0, jurisdictionParams],
      [3, goalParams],
      [4, supersetParams],
      ['123', jurisdictionParams],
    ];

    await act(async () => {
      await flushPromises();
    });
    expect(supersetServiceMock.mock.calls).toEqual(callList);
    expect(supersetServiceMock).toHaveBeenCalledTimes(6);
    expect((superset.getFormData as any).mock.calls).toEqual(getformDataCallList);
    wrapper.unmount();
  });

  it('renders correctly when state is empty or page is refreshed', async () => {
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
      },
      plan: null,
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    expect(supersetServiceMock.mock.calls.length).toEqual(1);
    wrapper.unmount();
  });

  it('renders correctly when state is not empty', async () => {
    const supersetServiceMock: any = jest.fn(async () => []);
    store.dispatch(fetchGoals([fixtures.goal3 as goalDucks.Goal]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1]));
    store.dispatch(fetchTasks(fixtures.tasks));
    const props = {
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
      },
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    expect(supersetServiceMock.mock.calls.length).toEqual(6);
    wrapper.unmount();
  });

  it('displays the correct badge and mark complete when plan status is active', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3 as goalDucks.Goal],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan1,
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
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(wrapper.find('Badge').prop('color')).toEqual('warning');
    expect(toJson(wrapper.find('MarkCompleteLink'))).toMatchSnapshot('mark complete link');
    wrapper.unmount();
  });

  it('displays the correct badge and mark complete link when the plan status is draft', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3 as goalDucks.Goal],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.draftPlan.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.draftPlan,
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
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(wrapper.find('Badge').prop('color')).toEqual('warning');
    expect(wrapper.find('MarkCompleteLink').isEmptyRender()).toBe(true);
    wrapper.unmount();
  });

  it('displays the correct badge and mark complete link when the plan status is complete', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3 as goalDucks.Goal],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.completeRoutinePlan.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.completeRoutinePlan,
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
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(wrapper.find('Badge').prop('color')).toEqual('success');
    expect(wrapper.find('MarkCompleteLink').isEmptyRender()).toBe(true);
    wrapper.unmount();
  });

  it('renders correct detail view when plan focus investigation reason is routine', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3 as goalDucks.Goal],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.completeRoutinePlan.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.completeRoutinePlan,
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
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(
      toJson(
        wrapper
          .find('div.mapSidebar')
          .find('div')
          .at(1)
      )
    ).toMatchSnapshot('routine detail view');
    wrapper.unmount();
  });

  it('renders correct detail view when plan focus investigation reason is case triggered', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      currentGoal: fixtures.goal3.goal_id,
      goals: [fixtures.goal3 as goalDucks.Goal],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan2.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan2,
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
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(
      toJson(
        wrapper
          .find('div.mapSidebar')
          .find('div')
          .at(1)
      )
    ).toMatchSnapshot('case triggered detail view');
    wrapper.unmount();
  });

  it('should handle fetch data correctly', async () => {
    const supersetServiceMock: any = jest.fn(async () => []);
    const fetchGoalsActionsCreatorMock: any = jest.fn();
    const fetchJurisdictionsActionCreatorMock: any = jest.fn();
    const fetchPlansActionCreatorMock: any = jest.fn();
    const fetchStructuresActionCreatorMock: any = jest.fn();
    const fetchTasksActionCreatorMock: any = jest.fn();
    const fetchIndexCasesDetailsActionCreator: any = jest.fn();
    const plan = fixtures.plan1;
    void utils.fetchData(
      fetchGoalsActionsCreatorMock,
      fetchJurisdictionsActionCreatorMock,
      fetchPlansActionCreatorMock,
      fetchStructuresActionCreatorMock,
      fetchTasksActionCreatorMock,
      fetchIndexCasesDetailsActionCreator,
      plan,
      supersetServiceMock
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(supersetServiceMock.mock.calls.length).toBe(6);
  });

  it('should not fetch data if no plan id is provided', async () => {
    const supersetServiceMock: any = jest.fn(async () => []);
    const fetchGoalsActionsCreatorMock: any = jest.fn();
    const fetchJurisdictionsActionCreatorMock: any = jest.fn();
    const fetchPlansActionCreatorMock: any = jest.fn();
    const fetchStructuresActionCreatorMock: any = jest.fn();
    const fetchTasksActionCreatorMock: any = jest.fn();
    const fetchIndexCasesDetailsActionCreator: any = jest.fn();
    void utils.fetchData(
      fetchGoalsActionsCreatorMock,
      fetchJurisdictionsActionCreatorMock,
      fetchPlansActionCreatorMock,
      fetchStructuresActionCreatorMock,
      fetchTasksActionCreatorMock,
      fetchIndexCasesDetailsActionCreator,
      {} as planDucks.Plan,
      supersetServiceMock
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(supersetServiceMock.mock.calls.length).toBe(0);
  });

  it('should display an error if fetch data result is falsy', async () => {
    const supersetServiceMock: any = jest.fn(async () => null);
    const displayErrorMock = jest.spyOn(helperErrors, 'displayError');
    const fetchGoalsActionsCreatorMock: any = jest.fn();
    const fetchJurisdictionsActionCreatorMock: any = jest.fn();
    const fetchPlansActionCreatorMock: any = jest.fn();
    const fetchStructuresActionCreatorMock: any = jest.fn();
    const fetchTasksActionCreatorMock: any = jest.fn();
    const fetchIndexCasesDetailsActionCreator: any = jest.fn();
    const plan = fixtures.plan1;
    void utils.fetchData(
      fetchGoalsActionsCreatorMock,
      fetchJurisdictionsActionCreatorMock,
      fetchPlansActionCreatorMock,
      fetchStructuresActionCreatorMock,
      fetchTasksActionCreatorMock,
      fetchIndexCasesDetailsActionCreator,
      plan,
      supersetServiceMock
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(displayErrorMock.mock.calls.length).toBe(6);
  });

  it('handles errors correctly when fetching data', async () => {
    const supersetServiceMock: any = jest.fn(() => Promise.reject('error'));
    const displayErrorMock = jest.spyOn(helperErrors, 'displayError');
    store.dispatch(fetchGoals([fixtures.goal3 as goalDucks.Goal]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1]));
    store.dispatch(fetchTasks(fixtures.tasks));
    const props = {
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
      },
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    expect(displayErrorMock).toHaveBeenCalledTimes(6);
    wrapper.unmount();
  });

  it("should skip fetching data for slices with id '0'", async () => {
    const envModule = require('../../../../../../configs/env');
    envModule.SUPERSET_JURISDICTIONS_SLICE = '0';
    envModule.SUPERSET_JURISDICTION_EVENTS_SLICE = '0';
    envModule.SUPERSET_PLANS_SLICE = '0';
    const supersetServiceMock: any = jest.fn(async () => []);
    const fetchGoalsActionsCreatorMock: any = jest.fn();
    const fetchJurisdictionsActionCreatorMock: any = jest.fn();
    const fetchPlansActionCreatorMock: any = jest.fn();
    const fetchStructuresActionCreatorMock: any = jest.fn();
    const fetchTasksActionCreatorMock: any = jest.fn();
    const fetchIndexCasesDetailsActionCreator: any = jest.fn();
    const plan = fixtures.plan1;
    void utils.fetchData(
      fetchGoalsActionsCreatorMock,
      fetchJurisdictionsActionCreatorMock,
      fetchPlansActionCreatorMock,
      fetchStructuresActionCreatorMock,
      fetchTasksActionCreatorMock,
      fetchIndexCasesDetailsActionCreator,
      plan,
      supersetServiceMock
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(supersetServiceMock.mock.calls.length).toBe(3);
  });

  it('handles fetchData promise errors correctly', async () => {
    jest.spyOn(utils, 'fetchData').mockReturnValue(Promise.reject('fetch data promise failed'));
    const supersetServiceMock: any = jest.fn(() => Promise.reject('error'));
    const displayErrorMock = jest.spyOn(helperErrors, 'displayError');
    store.dispatch(fetchGoals([fixtures.goal3 as goalDucks.Goal]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1]));
    store.dispatch(fetchTasks(fixtures.tasks));
    const props = {
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
      },
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    expect(displayErrorMock).toHaveBeenCalledTimes(1);
    expect(displayErrorMock).toHaveBeenCalledWith(new Error(AN_ERROR_OCCURRED));
    wrapper.unmount();
  });

  it('should show error page when no plans or jurisdictions', async () => {
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
      },
      plan: null,
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(wrapper.find('ErrorPage').length).toBeTruthy();
    expect(wrapper.find('ErrorPage').text()).toMatchInlineSnapshot(
      `"An error ocurred. Please try and refresh the page.The specific error is: Plan or Jurisdiction not found"`
    );
    wrapper.unmount();
  });

  /**
   * @todo Investigate why this test case that contains jest.spyon is leading to failure of other tests
   * above. It is intentionally put at the end to eliminate this
   */
  it('selectors get called with correct arguments', async () => {
    // spy on the selectors
    const planByIdMock = jest.spyOn(planDucks, 'getPlanById');
    const currentGoalMock = jest.spyOn(goalDucks, 'getCurrentGoal');
    const goalPlanJurisdictionMock = jest.spyOn(goalDucks, 'getGoalsByPlanAndJurisdiction');
    const jurisdictionIdMock = jest.spyOn(jurisdictionDucks, 'getJurisdictionById');
    const structuresMock = jest.spyOn(structureDucks, 'getStructuresFCByJurisdictionId');
    const FCMock = jest.spyOn(tasksDucks, 'getFCByPlanAndGoalAndJurisdiction');
    // setup the component and mount
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    store.dispatch(fetchGoals([fixtures.goal3 as goalDucks.Goal]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1]));
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
    mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });

    // define expected results
    const planByIdExpected = [fixturesMap.existingState, 'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f'];
    const goalPlanJurisdictionexpected = [
      fixturesMap.existingState,
      '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
      '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    ];
    const jurisdictionIdExpected = [
      fixturesMap.existingState,
      '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    ];

    // perform the actual assertions
    expect(planByIdMock.mock.calls[0]).toEqual(planByIdExpected);
    expect(goalPlanJurisdictionMock.mock.calls[0]).toEqual(goalPlanJurisdictionexpected);
    expect(jurisdictionIdMock.mock.calls[0]).toEqual(jurisdictionIdExpected);

    expect(structuresMock).not.toBeCalled();
    expect(currentGoalMock).not.toBeCalled();
    expect(FCMock).not.toBeCalled();
  });
});
