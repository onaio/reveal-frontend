import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedAutoSelectView from '..';
import { AUTO_ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import store from '../../../../../store';
import hierarchiesReducer, {
  reducerName as hierarchiesReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { sampleHierarchy } from '../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import plansReducer, { reducerName } from '../../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { jurisdictionsMetadataArray } from '../../../../../store/ducks/tests/fixtures';

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

jest.mock('../../helpers/Slider', () => {
  const structureSliderMock = (_: any) => <div id="structureSlider">Draggable slider</div>;
  return {
    ConnectedJurisdictionSelectionsSlider: structureSliderMock,
  };
});

jest.mock('../../../AssigmentMapWrapper', () => {
  const mockComponent2 = (_: any) => <div id="mockComponent2">Assignment Wrapper</div>;
  return {
    ConnectedAssignmentMapWrapper: mockComponent2,
  };
});

describe('src/containers/JurisdictionView/AutoSelect View', () => {
  /** renders correctly, a full render cycle
   *  check that errors are raised.
   * works correctly wth store
   */
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    fetch.resetMocks();
  });

  it('shows loader', async () => {
    const plan = plans[0];
    fetch
      .once(JSON.stringify(jurisdictionsMetadataArray), { status: 200 })
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(sampleHierarchy), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId: '2942' },
        path: `${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAutoSelectView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      wrapper.update();
    });

    expect(wrapper.find('Ripple').length).toEqual(1);
  });

  it('works correctly with store', async () => {
    const plan = plans[0];
    fetch
      .once(JSON.stringify(jurisdictionsMetadataArray), { status: 200 })
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(sampleHierarchy), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId: '2942' },
        path: `${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAutoSelectView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(wrapper.text()).toMatchInlineSnapshot(
      `"Planning toolA2-Lusaka Akros Test Focus 2A2-Lusaka Akros Test Focus 2Auto target jurisdictions by riskRefine selected jurisdictionsDraggable slider"`
    );

    // check props given to mock component
    const passedProps: any = wrapper.find('structureSliderMock').props();
    expect(passedProps.plan.identifier).toEqual(plan.identifier);
    expect(passedProps.rootJurisdictionId).toEqual('2942');

    // rendered component
    expect(wrapper.text()).toMatchSnapshot('should be about oov');
  });

  it('plan error Message', async () => {
    const plan = plans[0];
    fetch
      .once(JSON.stringify([]), { status: 200 })
      .once(JSON.stringify({}), { status: 500 })
      .once(JSON.stringify(sampleHierarchy), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId: '2942' },
        path: `${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAutoSelectView {...props} />
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

  it('getting root jurisdiction error Message', async () => {
    const plan = plans[0];
    fetch
      .once(JSON.stringify(jurisdictionsMetadataArray), { status: 200 })
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(sampleHierarchy), { status: 500 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier, rootId: '2942' },
        path: `${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAutoSelectView {...props} />
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
