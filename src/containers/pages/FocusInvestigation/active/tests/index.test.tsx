import { library } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { renderTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import MockDate from 'mockdate';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { CURRENT_FOCUS_INVESTIGATION } from '../../../../../configs/lang';
import { FI_URL, REACTIVE_QUERY_PARAM, ROUTINE_QUERY_PARAM } from '../../../../../constants';
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
import { activeFocusInvestigationProps, selectedPlan1, selectedPlan24 } from './fixtures';

reducerRegistry.register(reducerName, reducer);

library.add(faExternalLinkSquareAlt);
const history = createBrowserHistory();
jest.mock('../../../../../configs/env');

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

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
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
      match: mock,
      routinePlans: [fixtures.plan1],
      supersetService: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(wrapper.find(ActiveFocusInvestigation).props().caseTriggeredPlans).toEqual(
      activeFocusInvestigationProps.caseTriggeredPlans
    );
    expect(wrapper.find(ActiveFocusInvestigation).props().routinePlans).toEqual(
      activeFocusInvestigationProps.routinePlans
    );
    wrapper.unmount();
  });

  it('works with the Redux store', async () => {
    store.dispatch(fetchPlans(fixtures.plans));
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
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
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(wrapper.text()).toMatchSnapshot('A large unstyled string of the rendered output');
  });

  it('calls superset with the correct params', async () => {
    const actualFormData = superset.getFormData;
    const getFormDataMock: any = jest.fn();
    getFormDataMock.mockImplementation((...args: any) => {
      return actualFormData(...args);
    });
    superset.getFormData = getFormDataMock;
    const mock: any = jest.fn();
    const supersetMock: any = jest.fn();
    supersetMock.mockImplementation(() => Promise.resolve(fixtures.plans));
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
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    const supersetParams = {
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: 'FI',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_intervention_type',
        },
      ],
      row_limit: 2000,
    };

    const supersetCallList = [
      [
        2000,
        [{ comparator: InterventionType.FI, operator: '==', subject: 'plan_intervention_type' }],
      ],
    ];
    expect((superset.getFormData as any).mock.calls).toEqual(supersetCallList);
    expect(supersetMock).toHaveBeenCalledWith(0, supersetParams);
    wrapper.unmount();
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
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
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
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
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
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    renderTable(wrapper, 'Should only have header rows');
    expect(wrapper.text()).toMatchSnapshot('should have 2 no data found texts');
  });

  it('filters plans by userName', async () => {
    const planDef1 = cloneDeep(planDefFixtures.plans[0]);
    planDef1.identifier = '10f9e9fa-ce34-4b27-a961-72fab5206ab6';
    const userName = 'ghost';
    store.dispatch(
      fetchPlans([fixtures.plan1, fixtures.completeRoutinePlan, fixtures.plan24, fixtures.plan2])
    );
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
      supersetService: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

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
      supersetService: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
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
  });
});
