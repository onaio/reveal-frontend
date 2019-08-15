import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedPlanCompletion, { PlanCompletion } from '..';
import { OPENSRP_PLANS, PLAN_COMPLETION_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import reducer, {
  fetchPlans,
  getPlanById,
  Plan,
  PlanStatus,
  reducerName,
} from '../../../../../../store/ducks/plans';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';

reducerRegistry.register(reducerName, reducer);
const history = createBrowserHistory();

describe('@containers/pages/map/planCompletion/', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    // expect(wrapper).toMatchSnapshot();

    // check the page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Mark A1-Tha Luang Village 1 Focus 01 as complete');
    wrapper.unmount();
  });

  it('works with the redux store', () => {
    const mock: any = jest.fn();
    store.dispatch(fetchPlans([fixtures.plans] as any));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/13`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanCompletion {...props} />
        </Router>
      </Provider>
    );

    // expect(wrapper).toMatchSnapshot();
    wrapper.unmount();
  });

  it('goes back on cancelling mark as complete', async () => {
    const mock: any = jest.fn();
    store.dispatch(fetchPlans([fixtures.plans] as any));
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
    // const wrapper = mount(
    //   <Provider store={store}>
    //     <Router history={history}>
    //       <ConnectedPlanCompletion {...props} />
    //     </Router>
    //   </Provider>
    // );

    const discoWrapper = mount(<PlanCompletion plan={fixtures.plan1 as Plan} {...props} />);

    const cancelButton = discoWrapper.find('#complete-plan-cancel-btn');
    expect(cancelButton.length).toEqual(1);
    cancelButton.simulate('click');
    // check that history url after clicking cancel points to singleFi url

    // check that plan still has the previous plan_status
    const plan1FromStore = getPlanById(store.getState(), fixtures.plan1.id);
    expect(plan1FromStore).toBe(PlanStatus.ACTIVE);

    discoWrapper.unmount();
  });

  it('things it should do when confirm  mark as complete', () => {
    // calls correct url with the right arguments
    const mockUpdate = jest.fn(() => ({}));
    const classMock = jest.fn().mockImplementation(() => {
      return {
        update: mockUpdate,
      };
    });
    const mock: any = jest.fn();
    store.dispatch(fetchPlans([fixtures.plans] as any));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${PLAN_COMPLETION_URL}/:id`,
        url: `${PLAN_COMPLETION_URL}/13`,
      },
      serviceClass: classMock,
    };
    // const wrapper = mount(
    //   <Provider store={store}>
    //     <Router history={history}>
    //       <ConnectedPlanCompletion {...props} />
    //     </Router>
    //   </Provider>
    // );
    const discoWrapper = mount(<PlanCompletion plan={fixtures.plan1 as Plan} {...props} />);
    const confirmButton = discoWrapper.find('#complete-plan-confirm-btn');
    expect(confirmButton.length).toEqual(1);

    confirmButton.simulate('click');
    expect(classMock).toBeCalledTimes(1);
    expect(classMock).toBeCalledWith(OPENSRP_PLANS);
    const completedPlan = cloneDeep(fixtures.plan1);
    completedPlan.plan_status = PlanStatus.COMPLETE;
    expect(mockUpdate).toBeCalledWith(completedPlan);

    // check the plan in the store
    const plan1FromStore = getPlanById(store.getState(), fixtures.plan1.id);
    expect(plan1FromStore).toBe(PlanStatus.COMPLETE);
    discoWrapper.unmount();
  });
});
