import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedJurisdictionAssignmentView, { JurisdictionAssignmentView } from '..';
import { MANUAL_ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import store from '../../../../../store';
import hierarchiesReducer, {
  deforest,
  reducerName as hierarchiesReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { sampleHierarchy } from '../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { generateJurisdictionTree } from '../../../../../store/ducks/opensrp/hierarchies/utils';
import plansReducer, { reducerName } from '../../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { jurisdictionsMetadataArray } from '../../../../../store/ducks/tests/fixtures';
import { fetchCalls } from './fixtures';

reducerRegistry.register(reducerName, plansReducer);
reducerRegistry.register(hierarchiesReducerName, hierarchiesReducer);

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

jest.mock('../../helpers/JurisdictionTable', () => {
  const mockComponent = (_: any) => <div id="mockComponent">I love oov</div>;
  return {
    ConnectedJurisdictionTable: mockComponent,
  };
});

jest.mock('../../../AssigmentMapWrapper', () => {
  const mockComponent2 = (_: any) => <div id="mockComponent2">Assignment Wrapper</div>;
  return {
    ConnectedAssignmentMapWrapper: mockComponent2,
  };
});

describe('src/containers/JurisdictionView', () => {
  /** renders correctly, a full render cycle
   *  check that errors are raised.
   * works correctly wth store
   */
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    fetch.resetMocks();
    store.dispatch(deforest());
  });

  it('renders correctly', async () => {
    const plan = plans[0];
    const rootId = '2942';
    fetch
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(sampleHierarchy), { status: 200 });

    const props = {
      history,
      jurisdictionsMetadata: jurisdictionsMetadataArray,
      location: {
        hash: '',
        pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId },
        path: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
      plan: plans[0],
      tree: generateJurisdictionTree(sampleHierarchy),
    };

    const wrapper = mount(
      <Router history={history}>
        <JurisdictionAssignmentView {...props} />
      </Router>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(fetch.mock.calls).toEqual(fetchCalls);

    // check props given to mock component
    const passedProps: any = wrapper.find('mockComponent').props();
    expect(passedProps.plan.identifier).toEqual(plan.identifier);
    expect(passedProps.rootJurisdictionId).toEqual('2942');

    // rendered component
    expect(wrapper.text()).toMatchSnapshot('should be about oov');
  });

  it('works correctly with store', async () => {
    const plan = plans[0];
    const rootId = '2942';
    fetch
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(sampleHierarchy), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId },
        path: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionAssignmentView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // check props given to mock component
    const passedProps: any = wrapper.find('mockComponent').props();
    expect(passedProps.plan.identifier).toEqual(plan.identifier);
    expect(passedProps.rootJurisdictionId).toEqual('2942');

    // rendered component
    expect(wrapper.text()).toMatchSnapshot('should be about oov');
  });

  it('shows loader', async () => {
    const plan = plans[0];
    const rootId = '2942';
    fetch
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(sampleHierarchy), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId },
        path: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionAssignmentView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      wrapper.update();
    });

    expect(wrapper.find('Ripple').length).toEqual(1);
  });

  it('plan error Message', async () => {
    const plan = plans[0];
    const rootId = '2942';
    fetch
      .once(JSON.stringify(plan), { status: 500 })
      .once(JSON.stringify(sampleHierarchy), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId },
        path: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionAssignmentView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // check renderer error message
    expect(wrapper.text()).toMatchSnapshot('should be plan error page');
  });

  it('getting hierarchy error Message', async () => {
    const plan = plans[0];
    const rootId = '2942';

    fetch
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(sampleHierarchy), { status: 500 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId },
        path: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionAssignmentView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // check renderer error message
    expect(wrapper.text()).toMatchSnapshot('should also be jurisdiction error page');
  });
});
