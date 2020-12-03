import { library } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { renderTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import MockDate from 'mockdate';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import {
  CURRENT_FOCUS_INVESTIGATION,
  USER_HAS_NO_PLAN_ASSIGNMENTS,
} from '../../../../../configs/lang';
import { FI_URL, REACTIVE_QUERY_PARAM, ROUTINE_QUERY_PARAM } from '../../../../../constants';
import * as errorUtils from '../../../../../helpers/errors';
import store from '../../../../../store';
import * as planDefFixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { fetchPlansByUser } from '../../../../../store/ducks/opensrp/planIdsByUser';
import reducer, {
  fetchPlans,
  reducerName,
  removePlansAction,
} from '../../../../../store/ducks/plans';
import { InterventionType } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedActiveFocusInvestigation, { ActiveFocusInvestigation } from '../../active';
import {
  activeFocusInvestigationProps,
  nullJurisdictionIdsPlans,
  selectedPlan1,
  selectedPlan24,
} from './fixtures';

// tslint:disable-next-line: no-var-requires
const dataLoading = require('../../../../../helpers/dataLoading/plans');

reducerRegistry.register(reducerName, reducer);

library.add(faExternalLinkSquareAlt);
const history = createBrowserHistory();
jest.mock('../../../../../configs/env', () => {
  const orig = require.requireActual('../../../../../configs/__mocks__/env');
  return {
    ...orig,
    DISPLAYED_PLAN_TYPES: ['FI', 'IRS', 'MDA', 'MDA-Point', 'Dynamic-FI'],
  };
});

jest.mock('../../../../../helpers/dataLoading/plans', () => {
  const original = require.requireActual('../../../../../helpers/dataLoading/plans');
  return { ...original, loadPlansByUserFilter: async () => [] };
});

describe('containers/pages/ActiveFocusInvestigation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(removePlansAction);
    MockDate.reset();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
    };
    shallow(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders without crashing for null jurisdictions_name_path', () => {
    const mock: any = jest.fn();
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
    };
    shallow(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders ActiveFocusInvestigation correctly $ changes page title', async () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
      supersetService: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(CURRENT_FOCUS_INVESTIGATION);
    expect(wrapper.find(ActiveFocusInvestigation).props().caseTriggeredPlans).toEqual(
      activeFocusInvestigationProps.caseTriggeredPlans
    );
    expect(wrapper.find(ActiveFocusInvestigation).props().routinePlans).toEqual(
      activeFocusInvestigationProps.routinePlans
    );
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb').props()).toEqual({
      currentPage: {
        label: 'Focus Investigations',
        url: '/focus-investigation',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    });
    wrapper.unmount();
  });

  it('renders ActiveFocusInvestigation correctly for null jurisdictions', async () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdiction_parent_id: '2977',
          plan_id: fixtures.plan2.id,
        },
        path: FI_URL,
        url: FI_URL,
      },
      plan: fixtures.plan2,
      routinePlans: [fixtures.plan1],
      supersetService: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(wrapper.find(ActiveFocusInvestigation).props().caseTriggeredPlans).toEqual(
      activeFocusInvestigationProps.caseTriggeredPlans
    );
    expect(wrapper.find(ActiveFocusInvestigation).props().routinePlans).toEqual(
      activeFocusInvestigationProps.routinePlans
    );
    wrapper.unmount();
  });

  it('tracking error due to null jurisdiction ids', async () => {
    // aim here is to see if an error is raised
    const errorHandlerSpy = jest.spyOn(errorUtils, 'displayError');
    const envModule = require('../../../../../configs/env');
    envModule.DISPLAYED_PLAN_TYPES = 'FI,IRS,MDA,MDA-Point,Dynamic-FI,Dynamic-IRS,Dynamic-MDA'.split(
      ','
    );
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(nullJurisdictionIdsPlans as any[]));
    const props = {
      history,
      location: mock,
      match: mock,
      supersetService: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(errorHandlerSpy).not.toHaveBeenCalled();
  });

  it('works with the Redux store', async () => {
    const envModule = require('../../../../../configs/env');
    envModule.DISPLAYED_PLAN_TYPES = 'FI,IRS,MDA,MDA-Point,Dynamic-FI,Dynamic-IRS,Dynamic-MDA'.split(
      ','
    );
    store.dispatch(fetchPlans([...fixtures.plans, fixtures.plan104]));
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve([...fixtures.plans, fixtures.plan104]));
    const props = {
      history,
      location: mock,
      match: mock,
      supersetService: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(wrapper.text()).toMatchSnapshot('A large unstyled string of the rendered output');
    wrapper.find('DrillDownTable').forEach(table => renderTable(table));
  });

  it('does not show loading when we have resolved promises', async () => {
    // resolve superset's request with empty data, it should not show the loader.
    const mock: any = jest.fn();
    const supersetMock: any = jest.fn(async () => []);
    const props = {
      history,
      location: mock,
      match: mock,
      supersetService: supersetMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    // shows ripple here
    expect(wrapper.find('Ripple').length).toEqual(1);
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    // now you dont see the ripple
    expect(wrapper.find('Ripple').length).toEqual(0);
    wrapper.unmount();
  });

  it('handles search correctly for case triggered plans', async () => {
    store.dispatch(fetchPlans([fixtures.plan24, fixtures.plan25]));

    const props = {
      history,
      location: {
        pathname: FI_URL,
        search: `?${REACTIVE_QUERY_PARAM}=Jane`,
      },
      match: {
        isExact: true,
        params: {},
        path: `${FI_URL}`,
        url: `${FI_URL}`,
      },
      supersetService: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    renderTable(wrapper, 'Expect single non header tr with title includes jane');
  });

  it('handles case insensitive searches correctly', async () => {
    store.dispatch(fetchPlans([fixtures.plan1, fixtures.plan22]));

    const props = {
      history,
      location: {
        pathname: FI_URL,
        search: `?${ROUTINE_QUERY_PARAM}=LUANG`,
      },
      match: {
        isExact: true,
        params: {},
        path: `${FI_URL}`,
        url: `${FI_URL}`,
      },
      supersetService: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    renderTable(wrapper, 'expect the luang tr as only non header tr');
    wrapper.unmount();
  });

  it('renders empty tables if search query does not match any case trigger or routine plans', async () => {
    store.dispatch(fetchPlans([fixtures.plan1, fixtures.plan22, fixtures.plan24, fixtures.plan25]));

    const props = {
      history,
      location: {
        pathname: FI_URL,
        search: `?${ROUTINE_QUERY_PARAM}=Amazon&${REACTIVE_QUERY_PARAM}=Amazon`,
      },
      match: {
        isExact: true,
        params: {},
        path: `${FI_URL}`,
        url: `${FI_URL}`,
      },
      supersetService: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    renderTable(wrapper, 'Should only have header rows');
    expect(wrapper.text()).toMatchSnapshot('should have 2 no data found texts');
  });

  it('filters plans by userName resulting in no plans', async () => {
    const planDef1 = cloneDeep(planDefFixtures.plans[0]);
    planDef1.identifier = '10f9e9fa-ce34-4b27-a961-72fab5206ab6';
    const userName = 'ghost';
    store.dispatch(fetchPlans([fixtures.completeRoutinePlan, fixtures.plan2]));
    store.dispatch(fetchPlansByUser([planDef1], userName));
    const props = {
      history,
      location: {
        pathname: FI_URL,
        search: `?user=${userName}`,
      },
      match: {
        isExact: true,
        params: {},
        path: `${FI_URL}`,
        url: `${FI_URL}`,
      },
      supersetService: jest.fn().mockImplementation(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(
      wrapper
        .find('Table')
        .at(0)
        .prop('data')
    ).toEqual([]);
    expect(
      wrapper
        .find('Table')
        .at(1)
        .prop('data')
    ).toEqual([]);

    // no plans but loader is not showing
    expect(wrapper.find('Ripple').length).toEqual(0);
    expect(wrapper.text().includes(USER_HAS_NO_PLAN_ASSIGNMENTS));
  });

  it('filters plans by userName', async () => {
    const planDef1 = cloneDeep(planDefFixtures.plans[0]);
    planDef1.identifier = '10f9e9fa-ce34-4b27-a961-72fab5206ab6';
    const userName = 'ghost';
    store.dispatch(
      fetchPlans([fixtures.plan1, fixtures.completeRoutinePlan, fixtures.plan24, fixtures.plan2])
    );
    store.dispatch(fetchPlansByUser([planDef1], userName));

    const planInterventionFilters = {
      clause: 'WHERE',
      comparator: ['FI', 'Dynamic-FI'],
      expressionType: 'SIMPLE',
      operator: 'in',
      subject: 'plan_intervention_type',
    };

    const props = {
      history,
      location: {
        pathname: FI_URL,
        search: `?user=${userName}`,
      },
      match: {
        isExact: true,
        params: {},
        path: `${FI_URL}`,
        url: `${FI_URL}`,
      },
      supersetService: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve([]))
        .mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(props.supersetService).toHaveBeenCalledTimes(2);
    expect(props.supersetService.mock.calls[0]).toEqual([
      0,
      {
        adhoc_filters: [planInterventionFilters],
        row_limit: 3000,
      },
    ]);
    expect(props.supersetService.mock.calls[1]).toEqual([
      0,
      {
        adhoc_filters: [
          planInterventionFilters,
          {
            clause: 'WHERE',
            comparator: [planDef1.identifier],
            expressionType: 'SIMPLE',
            operator: 'in',
            subject: 'plan_id',
          },
        ],
        row_limit: 1,
      },
    ]);

    expect(wrapper.find('.user-filter-info').text()).toMatchInlineSnapshot(
      `"User filter on: Only plans assigned to ghost are listed."`
    );
    expect(
      wrapper
        .find('Table')
        .at(0)
        .prop('data')
    ).toEqual([selectedPlan24]);
    expect(
      wrapper
        .find('Table')
        .at(1)
        .prop('data')
    ).toEqual([selectedPlan1]);
  });

  it('renders ActiveFocusInvestigation correctly $ changes page title', async () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve([]));

    // spy on fn for geting user assigned plans
    const spyLoadPlansByUserFilter = jest.spyOn(dataLoading, 'loadPlansByUserFilter');

    const userName = 'test_user_1';
    const userPlanIds = ['user-1-plan-id-1', 'user-1-plan-id-2'];

    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
      supersetService: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );

    await act(async () => {
      await flushPromises();
    });

    // the only call we make to superset is for getting all plans
    expect(props.supersetService.mock.calls.length).toEqual(1);
    // user assigned plans not called yet
    expect(spyLoadPlansByUserFilter).toHaveBeenCalledTimes(0);

    // simulate updating of userName and userPlanIds
    wrapper.setProps({
      children: React.cloneElement(wrapper.props().children, { userName, userPlanIds }),
    });

    await act(async () => {
      await flushPromises();
    });

    // make another call to superset to get user plans
    expect(props.supersetService.mock.calls.length).toEqual(2);
    expect(props.supersetService.mock.calls[1]).toEqual([
      0,
      {
        adhoc_filters: [
          {
            clause: 'WHERE',
            comparator: ['FI', 'Dynamic-FI'],
            expressionType: 'SIMPLE',
            operator: 'in',
            subject: 'plan_intervention_type',
          },
          {
            clause: 'WHERE',
            comparator: userPlanIds,
            expressionType: 'SIMPLE',
            operator: 'in',
            subject: 'plan_id',
          },
        ],
        row_limit: 2,
      },
    ]);

    // user assigned plans called on passing user name
    expect(spyLoadPlansByUserFilter).toHaveBeenCalledTimes(1);
    expect(spyLoadPlansByUserFilter).toHaveBeenCalledWith(userName);
  });

  it('calls superset with the correct params', async () => {
    const envModule = require('../../../../../configs/env');
    envModule.DISPLAYED_PLAN_TYPES = 'FI,IRS,MDA,MDA-Point,Dynamic-FI,Dynamic-IRS,Dynamic-MDA'.split(
      ','
    );
    const actualFormData = superset.getFormData;
    const getFormDataMock: any = jest.fn();
    getFormDataMock.mockImplementation((...args: any) => {
      return actualFormData(...args);
    });
    superset.getFormData = getFormDataMock;
    const mock: any = jest.fn();
    const supersetMock: any = jest.fn();
    supersetMock
      .mockImplementationOnce(() => Promise.resolve(fixtures.plans))
      .mockImplementationOnce(() => Promise.resolve([]));
    const props = {
      history,
      location: mock,
      match: mock,
      supersetService: supersetMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    const supersetParams = {
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: [InterventionType.FI, InterventionType.DynamicFI],
          expressionType: 'SIMPLE',
          operator: 'in',
          subject: 'plan_intervention_type',
        },
      ],

      row_limit: 3000,
    };

    const supersetCallList = [
      [
        3000,
        [
          {
            comparator: [InterventionType.FI, InterventionType.DynamicFI],
            operator: 'in',
            subject: 'plan_intervention_type',
          },
        ],
      ],
    ];

    expect((superset.getFormData as any).mock.calls).toEqual(supersetCallList);
    expect(supersetMock).toHaveBeenCalledWith(0, supersetParams);
    wrapper.unmount();
  });

  it('should handle falsy result correctly', async () => {
    const supersetServiceMock: any = jest
      .fn(() => Promise.resolve(fixtures.plans))
      .mockImplementationOnce(async () => null);

    const mock: any = jest.fn();
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    // shows ripple here
    expect(wrapper.find('Ripple').length).toEqual(1);

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(props.fetchPlansActionCreator).not.toHaveBeenCalled();

    // now you dont see the ripple
    expect(wrapper.find('Ripple').length).toEqual(0);
    wrapper.unmount();
  });
});
