import {
  ConnectedJurisdictionAssignmentReRouting,
  getNextUrl,
} from '../JurisdictionAssignmentReRouting';

import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { cloneDeep } from 'lodash';
import React from 'react';
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

describe('jurisdictionView/EntryView', () => {
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

  it('jurisdictionAssignmentRouting works correctly', () => {
    // dispatch the plan and the tree
    store.dispatch(fetchTree(sampleHierarchy));
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
    wrapper.update();

    const location = (wrapper.find('Router').props() as any).history.location;
    expect(location.pathname).toEqual(
      `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${irsPlan.identifier}/2942`
    );
  });
});
