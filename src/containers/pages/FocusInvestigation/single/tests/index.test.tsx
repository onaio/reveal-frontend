import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import MockDate from 'mockdate';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../constants';
import store from '../../../../../store';
import { fetchGoals } from '../../../../../store/ducks/goals';
import { fetchJurisdictions } from '../../../../../store/ducks/jurisdictions';
import { fetchPlans, Plan } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedSingleFI, { SingleFI } from '../../single';

jest.mock('../../../../../components/GisidaWrapper', () => {
  const GisidaWrapperMock = () => <div>I love oov</div>;
  return GisidaWrapperMock;
});

jest.mock('../../../../../configs/env');
const history = createBrowserHistory();

describe('containers/pages/SingleFI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.reset();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      completeReactivePlansArray: [fixtures.completeReactivePlan],
      completeRoutinePlansArray: [fixtures.completeRoutinePlan],
      currentReactivePlansArray: [fixtures.plan2],
      currentRoutinePlansArray: [fixtures.plan1],
      goalsArray: fixtures.plan1Goals,
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      planById: fixtures.plan1 as Plan,
      plansIdArray: fixtures.plansIdArray,
      supersetService: supersetServiceMock,
    };
    shallow(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
  });

  it('renders SingleFI correctly', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      completeReactivePlansArray: [fixtures.completeReactivePlan],
      completeRoutinePlansArray: [fixtures.completeRoutinePlan],
      currentReactivePlansArray: [fixtures.plan2],
      currentRoutinePlansArray: [fixtures.plan1],
      goalsArray: fixtures.plan1Goals,
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      planById: fixtures.plan1 as Plan,
      plansIdArray: fixtures.plansIdArray,
      supersetService: supersetServiceMock,
      // tslint:disable-next-line: object-literal-sort-keys
      fetchPlansActionCreator: jest.fn(),
      fetchGoalsActionCreator: jest.fn(),
      fetchJurisdictionActionCreator: jest.fn(),
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
    // check that the documents title was changed correctly
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Focus Investigations in NVI_439');

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('GisidaWrapperMock').props()).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.unmount();
  });

  it('renders SingleFI correctly for null plan jurisdction id', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      completeReactivePlansArray: [],
      completeRoutinePlansArray: [],
      currentReactivePlansArray: [],
      currentRoutinePlansArray: [],
      goalsArray: [],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan5.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      planById: fixtures.plan5,
      plansArray: [fixtures.plan5],
      plansIdArray: [fixtures.plan5.id],
      supersetService: supersetServiceMock,
      // tslint:disable-next-line: object-literal-sort-keys
      fetchPlansActionCreator: jest.fn(),
      fetchGoalsActionCreator: jest.fn(),
      fetchJurisdictionActionCreator: jest.fn(),
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
    expect(wrapper.find('GisidaWrapperMock').length).toEqual(0);
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.unmount();
  });

  it('It works with the Redux store', () => {
    const mock: any = jest.fn();
    store.dispatch(fetchPlans(fixtures.plans as Plan[]));
    store.dispatch(fetchGoals(fixtures.goals));
    store.dispatch(fetchJurisdictions(fixtures.jurisdictions));
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      completeReactivePlansArray: [fixtures.completeReactivePlan],
      completeRoutinePlansArray: [fixtures.completeRoutinePlan],
      currentReactivePlansArray: [fixtures.plan2],
      currentRoutinePlansArray: [fixtures.plan1],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      supersetService: supersetServiceMock,
      // tslint:disable-next-line: object-literal-sort-keys
      fetchPlansActionCreator: jest.fn(),
      fetchGoalsActionCreator: jest.fn(),
      fetchJurisdictionActionCreator: jest.fn(),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleFI {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('GisidaWrapperMock').props()).toMatchSnapshot();
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
    const supersetMock: any = jest.fn();
    supersetMock.mockImplementation(() => Promise.resolve([]));
    store.dispatch(fetchPlans(fixtures.plans as Plan[]));
    store.dispatch(fetchGoals(fixtures.goals));
    store.dispatch(fetchJurisdictions(fixtures.jurisdictions));
    const props = {
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      supersetService: supersetMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleFI {...props} />
        </Router>
      </Provider>
    );

    const goalsParams = {
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

    await flushPromises();
    const getFormDataCallList = [
      [3000, [{ comparator: fixtures.plan1.plan_id, operator: '==', subject: 'plan_id' }]],
      [
        3000,
        [{ comparator: fixtures.plan1.plan_id, operator: '==', subject: 'plan_id' }],
        { action_prefix: true },
      ],
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
    ];

    const callList = [
      [0, jurisdictionParams],
      [3, goalsParams],
      [1, jurisdictionParams],
    ];
    expect(supersetMock).toHaveBeenCalledTimes(3);
    expect((superset.getFormData as any).mock.calls).toEqual(getFormDataCallList);
    expect(supersetMock.mock.calls).toEqual(callList);
    wrapper.unmount();
  });
});
