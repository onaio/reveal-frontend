import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { toast } from 'react-toastify';
import ConnectedPlanCompletion, { PlanCompletion } from '..';
import { NO_PLAN_FOUND_ERROR, PLAN_STATUS_UPDATE_ERROR } from '../../../../../../configs/lang';
import { FI_SINGLE_MAP_URL, PLAN_COMPLETION_URL, PLAN_LIST_URL } from '../../../../../../constants';
import * as helperUtils from '../../../../../../helpers/utils';
import {
  plansListResponse,
  updateResponse,
} from '../../../../../../services/opensrp/tests/fixtures/plans';
import store from '../../../../../../store';
import reducer, {
  fetchPlans,
  getPlanById,
  PlanStatus,
  reducerName,
  removePlansAction,
} from '../../../../../../store/ducks/plans';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import { payload } from './fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../../configs/env');

reducerRegistry.register(reducerName, reducer);
const history = createBrowserHistory();

describe('@containers/pages/map/planCompletion/', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(removePlansAction);
    fetch.resetMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/13`,
      },
      plan: fixtures.plan1,
    };
    shallow(
      <Router history={history}>
        <PlanCompletion {...props} />
      </Router>
    );
  });

  it('renders correctly', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/13`,
      },
      plan: fixtures.plan1,
    };
    const wrapper = mount(
      <Router history={history}>
        <PlanCompletion {...props} />
      </Router>
    );

    expect(toJson(wrapper.find('#plan-completion-page-wrapper'))).toMatchSnapshot();
    const cancelButton = wrapper.find('#complete-plan-cancel-btn');
    expect(cancelButton.length).toEqual(1);
    const confirmButton = wrapper.find('#complete-plan-confirm-btn');
    expect(confirmButton.length).toEqual(1);
    // check the page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Mark A1-Tha Luang Village 1 Focus 01 as complete');
    wrapper.unmount();
  });

  it('works with the redux store', () => {
    const mock: any = jest.fn();
    store.dispatch(fetchPlans(fixtures.plans as any));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f`,
      },
      serviceClass: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanCompletion {...props} />
        </Router>
      </Provider>
    );

    expect(toJson(wrapper.find('h2.page-title'))).toMatchSnapshot();
    wrapper.unmount();
  });

  it('E2E test flow for cancel mark as complete for planCompletion', async () => {
    const mock: any = jest.fn();
    store.dispatch(fetchPlans(fixtures.plans as any));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f`,
      },
    };

    const discoWrapper = mount(<PlanCompletion plan={fixtures.plan1} {...props} />);
    const cancelButton = discoWrapper.find('#complete-plan-cancel-btn');
    cancelButton.simulate('click');
    // check that history url after clicking cancel points to singleFi url
    discoWrapper.update();
    expect(discoWrapper.props().history.action).toEqual('REPLACE');
    expect(discoWrapper.props().history.location.pathname).toEqual(
      `${FI_SINGLE_MAP_URL}/${fixtures.plan1.id}`
    );

    // check that plan still has the previous plan_status
    const plan1FromStore = getPlanById(store.getState(), fixtures.plan1.id);
    expect(plan1FromStore!.plan_status).toBe(PlanStatus.ACTIVE);

    discoWrapper.unmount();
  });

  it('E2E things it should do when confirm  mark as complete', async () => {
    // calls correct url with the right arguments
    const mock: any = jest.fn();
    store.dispatch(fetchPlans(fixtures.plans as any));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f`,
      },
    };

    const expectedCalledUrl =
      'https://test.smartregister.org/opensrp/rest/plans/10f9e9fa-ce34-4b27-a961-72fab5206ab6';
    fetch.once(JSON.stringify([plansListResponse[0]])).once(JSON.stringify(updateResponse));

    const discoWrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanCompletion plan={fixtures.plan1} {...props} />
        </Router>
      </Provider>
    );
    const confirmButton = discoWrapper.find('#complete-plan-confirm-btn');
    confirmButton.simulate('click');
    await flushPromises();
    const plan1FromStore = getPlanById(store.getState(), fixtures.plan1.id);
    const completedPlan = cloneDeep(fixtures.plan1);
    completedPlan.plan_status = PlanStatus.COMPLETE;

    expect(discoWrapper.props().children.props.history.action).toEqual('PUSH');
    expect(discoWrapper.props().children.props.history.location.pathname).toEqual(
      `${PLAN_LIST_URL}`
    );

    expect(fetch).toBeCalledTimes(2);
    expect(fetch.mock.calls[0][0]).toEqual(expectedCalledUrl);
    expect(fetch.mock.calls[1][0]).toEqual('https://test.smartregister.org/opensrp/rest/plans');

    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual(payload.body);

    expect(plan1FromStore).toEqual(completedPlan);

    discoWrapper.unmount();
  });

  it('E2E flow for cancel mark as complete in Connected component', async () => {
    const mock: any = jest.fn();
    store.dispatch(fetchPlans(fixtures.plans as any));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f`,
      },
      serviceClass: mock,
    };
    const discoWrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanCompletion {...props} />
        </Router>
      </Provider>
    );
    const cancelButton = discoWrapper.find('#complete-plan-cancel-btn');
    expect(cancelButton.length).toEqual(1);
    cancelButton.simulate('click');
    // check that history url after clicking cancel points to singleFi url
    discoWrapper.update();
    expect(discoWrapper.props().children.props.history.action).toEqual('REPLACE');
    expect(discoWrapper.props().children.props.history.location.pathname).toEqual(
      `${FI_SINGLE_MAP_URL}/${fixtures.plan1.id}`
    );

    // check that plan still has the previous plan_status
    const plan1FromStore = getPlanById(store.getState(), fixtures.plan1.id);
    expect(plan1FromStore!.plan_status).toBe(PlanStatus.ACTIVE);

    discoWrapper.unmount();
  });

  it('growl on error when reading plan', async () => {
    store.dispatch(fetchPlans(fixtures.plans as any));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f`,
      },
    };
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;
    fetch.mockReject(new Error('some error message'), { status: 500 });

    const discoWrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanCompletion {...props} />
        </Router>
      </Provider>
    );

    const confirmButton = discoWrapper.find('#complete-plan-confirm-btn');
    expect(confirmButton.length).toEqual(1);
    confirmButton.simulate('click');

    await flushPromises();

    expect(mockGrowl).toHaveBeenCalledWith(`${PLAN_STATUS_UPDATE_ERROR}: some error message`, {
      type: toast.TYPE.ERROR,
    });
  });

  it('growl on error when updating plan', async () => {
    store.dispatch(fetchPlans(fixtures.plans as any));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f`,
      },
    };
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;
    fetch.once(JSON.stringify([plansListResponse[0]]));
    fetch.mockReject(new Error('Some error'), { status: 500 });

    const discoWrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanCompletion {...props} />
        </Router>
      </Provider>
    );

    const confirmButton = discoWrapper.find('#complete-plan-confirm-btn');
    expect(confirmButton.length).toEqual(1);
    confirmButton.simulate('click');

    await flushPromises();

    expect(mockGrowl).toHaveBeenCalledWith(`${PLAN_STATUS_UPDATE_ERROR}: Some error`, {
      type: toast.TYPE.ERROR,
    });
  });

  it('growl on read if no plan received', async () => {
    store.dispatch(fetchPlans(fixtures.plans as any));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f`,
      },
    };
    const mockGrowl: any = jest.fn();
    (helperUtils as any).growl = mockGrowl;
    fetch.once(JSON.stringify([])).once(JSON.stringify(updateResponse));

    const discoWrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanCompletion {...props} />
        </Router>
      </Provider>
    );

    const confirmButton = discoWrapper.find('#complete-plan-confirm-btn');
    expect(confirmButton.length).toEqual(1);
    confirmButton.simulate('click');

    await flushPromises();

    expect(mockGrowl).toHaveBeenCalledWith(NO_PLAN_FOUND_ERROR, { type: toast.TYPE.ERROR });
  });
});
