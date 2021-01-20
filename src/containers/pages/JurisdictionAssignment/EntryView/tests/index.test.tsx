import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { ConnectedEntryView } from '..';
import { ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import store from '../../../../../store';
import hierarchyReducer, {
  reducerName as hierarchyReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import planDefinitionReducer, {
  reducerName as planDefinitionReducerName,
} from '../../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { akros2, lusaka, mtendere } from '../../ManualSelectJurisdiction/tests/fixtures';

reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

const history = createBrowserHistory();

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../configs/env');

jest.mock('../JurisdictionAssignmentReRouting', () => {
  const MockComponent = () => <div id="mock-wrapper">I love oov</div>;
  return {
    ConnectedJurisdictionAssignmentReRouting: MockComponent,
  };
});

describe('JurisdictionAssignment/JurisdictionEntry', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    fetch.resetMocks();
  });

  it('makes the correct calls to api', async () => {
    const plan = plans[0];

    fetch
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify([akros2]), { status: 200 })
      .once(JSON.stringify(mtendere), { status: 200 })
      .once(JSON.stringify(lusaka), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier },
        path: `${ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedEntryView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // we now check the fetch calls
    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/plans/356b6b84-fc36-4389-a44a-2b038ed2f38d',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&return_geometry=false&jurisdiction_ids=3952',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/3019?is_jurisdiction=true&return_geometry=false',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
      [
        'https://test.smartregister.org/opensrp/rest/location/2942?is_jurisdiction=true&return_geometry=false',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ]);

    expect(wrapper.text()).toMatchInlineSnapshot(`"I love oov"`);
  });

  it('shows plan error', async () => {
    const plan = plans[0];

    fetch
      .once(JSON.stringify(plan), { status: 500 })
      .once(JSON.stringify([akros2]), { status: 200 })
      .once(JSON.stringify(mtendere), { status: 200 })
      .once(JSON.stringify(lusaka), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier },
        path: `${ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedEntryView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(wrapper.text()).toMatchInlineSnapshot(
      `"An error ocurred. Please try and refresh the page.The specific error is: Unable to load plan"`
    );
  });

  it('shows jurisdiction error', async () => {
    const plan = plans[0];

    fetch
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify([akros2]), { status: 500 })
      .once(JSON.stringify(mtendere), { status: 200 })
      .once(JSON.stringify(lusaka), { status: 200 });

    const props = {
      history,
      location: {
        hash: '',
        pathname: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier },
        path: `${ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedEntryView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(wrapper.text()).toMatchInlineSnapshot(
      `"An error ocurred. Please try and refresh the page.The specific error is: Could not load jurisdiction"`
    );
  });

  it('shows jurisdiction error for tree request', async () => {
    const plan = plans[0];

    fetch
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify([akros2]), { status: 200 })
      .once(JSON.stringify(mtendere), { status: 200 })
      .once(JSON.stringify(lusaka), { status: 200 });
    const props = {
      history,
      location: {
        hash: '',
        pathname: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { planId: plan.identifier },
        path: `${ASSIGN_JURISDICTIONS_URL}/:planId`,
        url: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedEntryView {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(wrapper.text()).toMatchInlineSnapshot(
      `"An error ocurred. Please try and refresh the page.The specific error is: Could not load jurisdiction"`
    );
  });
});
