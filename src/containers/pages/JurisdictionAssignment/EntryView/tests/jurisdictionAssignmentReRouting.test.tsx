import {
  ConnectedJurisdictionAssignmentReRouting,
  getNextUrl,
} from '../JurisdictionAssignmentReRouting';

import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { cloneDeep } from 'lodash';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router';
import {
  AUTO_ASSIGN_JURISDICTIONS_URL,
  MANUAL_ASSIGN_JURISDICTIONS_URL,
} from '../../../../../constants';
import store from '../../../../../store';
import hierarchyReducer, {
  fetchTree,
  reducerName as hierarchyReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { sampleHierarchy } from '../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { generateJurisdictionTree } from '../../../../../store/ducks/opensrp/hierarchies/utils';
import planDefinitionReducer, {
  addPlanDefinition,
  reducerName as planDefinitionReducerName,
} from '../../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { InterventionType } from '../../../../../store/ducks/plans';

reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

jest.mock('../../../../../configs/env');

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('jurisdictionView/EntryView', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  it('getNextUrl works ok', () => {
    // auto Selection is enabled/disabled
    let tree = generateJurisdictionTree(sampleHierarchy);
    let irsPlan = cloneDeep(plans[1]);
    irsPlan.jurisdiction = [{ code: tree.model.id }];
    let enableAutoSelection = true;
    let enabledPlanTypes = [InterventionType.IRS, InterventionType.DynamicIRS];
    let url = getNextUrl(irsPlan, tree, enableAutoSelection, enabledPlanTypes);
    expect(url).toEqual(AUTO_ASSIGN_JURISDICTIONS_URL);

    // autoSelection is disabled
    enableAutoSelection = false;
    tree = generateJurisdictionTree(sampleHierarchy);
    irsPlan = cloneDeep(plans[1]);
    irsPlan.jurisdiction = [{ code: tree.model.id }];
    enabledPlanTypes = [InterventionType.IRS, InterventionType.DynamicIRS];
    url = getNextUrl(irsPlan, tree, enableAutoSelection, enabledPlanTypes);
    expect(url).toEqual(MANUAL_ASSIGN_JURISDICTIONS_URL);

    // plantype is not whitelisted
    enableAutoSelection = false;
    tree = generateJurisdictionTree(sampleHierarchy);
    const fiPlan = cloneDeep(plans[0]);
    irsPlan.jurisdiction = [{ code: tree.model.id }];
    enabledPlanTypes = [InterventionType.IRS, InterventionType.DynamicIRS];
    url = getNextUrl(fiPlan, tree, enableAutoSelection, enabledPlanTypes);
    expect(url).toEqual(MANUAL_ASSIGN_JURISDICTIONS_URL);

    // plan has more than one jurisdictions
    enableAutoSelection = true;
    tree = generateJurisdictionTree(sampleHierarchy);
    irsPlan = cloneDeep(plans[1]);
    enabledPlanTypes = [InterventionType.IRS, InterventionType.DynamicIRS];
    url = getNextUrl(irsPlan, tree, enableAutoSelection, enabledPlanTypes);
    expect(url).toEqual(MANUAL_ASSIGN_JURISDICTIONS_URL);

    // plan has one jurisdiction that is not the rootJurisdiction
    enableAutoSelection = false;
    tree = generateJurisdictionTree(sampleHierarchy);
    irsPlan = cloneDeep(plans[1]);
    irsPlan.jurisdiction = [{ code: 'randomJurisdictionId' }];
    enabledPlanTypes = [InterventionType.IRS, InterventionType.DynamicIRS];
    url = getNextUrl(irsPlan, tree, enableAutoSelection, enabledPlanTypes);
    expect(url).toEqual(MANUAL_ASSIGN_JURISDICTIONS_URL);
  });

  it('jurisdictionAssignmentRouting works correctly', async () => {
    // dispatch the plan and the tree
    fetch.once(JSON.stringify(sampleHierarchy));
    const irsPlan = cloneDeep(plans[1]);
    store.dispatch(addPlanDefinition(irsPlan));

    const wrapperComponent = () => {
      const props = {
        plan: irsPlan,
        rootJurisdictionId: '2942',
      };
      return <ConnectedJurisdictionAssignmentReRouting {...props} />;
    };
    // wrap with Memory Router and see if it redirects to the returned url
    const App = () => {
      return (
        <Switch>
          {/* tslint:disable-next-line: jsx-no-lambda */}
          <Route path={MANUAL_ASSIGN_JURISDICTIONS_URL} component={() => <div id="manual" />} />
          {/* tslint:disable-next-line: jsx-no-lambda */}
          <Route path={AUTO_ASSIGN_JURISDICTIONS_URL} component={() => <div id="auto" />} />
          {/* tslint:disable-next-line: jsx-no-lambda */}
          <Route path="/" component={wrapperComponent} />
        </Switch>
      );
    };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: `/`, search: '', hash: '', state: {} }]}>
          <App />
        </MemoryRouter>
        ;
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/location/hierarchy/2942?return_structure_count=true',
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

    const location = (wrapper.find('Router').props() as any).history.location;
    expect(location.pathname).toEqual(
      `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${irsPlan.identifier}/2942`
    );
  });

  it('does not show loader when fetching tree that is in store', async () => {
    // dispatch the plan and the tree
    store.dispatch(fetchTree(sampleHierarchy));
    fetch.once(JSON.stringify(sampleHierarchy));
    const irsPlan = cloneDeep(plans[1]);
    store.dispatch(addPlanDefinition(irsPlan));

    const wrapperComponent = () => {
      const props = {
        plan: irsPlan,
        rootJurisdictionId: '2942',
      };
      return <ConnectedJurisdictionAssignmentReRouting {...props} />;
    };
    // wrap with Memory Router and see if it redirects to the returned url
    const App = () => {
      return (
        <Switch>
          {/* tslint:disable-next-line: jsx-no-lambda */}
          <Route path={MANUAL_ASSIGN_JURISDICTIONS_URL} component={() => <div id="manual" />} />
          {/* tslint:disable-next-line: jsx-no-lambda */}
          <Route path={AUTO_ASSIGN_JURISDICTIONS_URL} component={() => <div id="auto" />} />
          {/* tslint:disable-next-line: jsx-no-lambda */}
          <Route path="/" component={wrapperComponent} />
        </Switch>
      );
    };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: `/`, search: '', hash: '', state: {} }]}>
          <App />
        </MemoryRouter>
        ;
      </Provider>
    );

    await act(async () => {
      wrapper.update();
    });

    // we are not showing loading despite the fact that we did not flush promises
    expect(wrapper.find('Ripple').length).toEqual(0);

    const location = (wrapper.find('Router').props() as any).history.location;
    expect(location.pathname).toEqual(
      `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${irsPlan.identifier}/2942`
    );
  });
});
