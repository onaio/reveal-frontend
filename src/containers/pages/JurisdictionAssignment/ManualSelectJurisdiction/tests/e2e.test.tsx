import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router';
import ConnectedJurisdictionAssignmentView from '..';
import { MANUAL_ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import { renderTable } from '../../../../../helpers/testUtils';
import store from '../../../../../store';
import hierarchiesReducer, {
  reducerName as hierarchiesReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { raZambiaHierarchy } from '../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import plansReducer, { reducerName } from '../../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { e2eFetchCalls } from './fixtures';

reducerRegistry.register(reducerName, plansReducer);
reducerRegistry.register(hierarchiesReducerName, hierarchiesReducer);

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../configs/env');

jest.mock('reactstrap', () => {
  const original = require.requireActual('reactstrap');
  return { ...original, Tooltip: () => null };
});

jest.mock('../../../AssigmentMapWrapper', () => {
  const mockComponent2 = (_: any) => <div id="mockComponent2">Assignment Wrapper</div>;
  return {
    ConnectedAssignmentMapWrapper: mockComponent2,
  };
});

it('plans with existing node selections', async () => {
  jest.setTimeout(10000);
  const envModule = require('../../../../../configs/env');
  envModule.ASSIGNMENT_PAGE_SHOW_MAP = true;
  envModule.OPENSRP_API_BASE_URL = 'https://test.smartregister.org/opensrp/rest/';

  const App = () => {
    return (
      <Switch>
        <Route
          exact={true}
          path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
          component={ConnectedJurisdictionAssignmentView}
        />
        <Route
          exact={true}
          path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId`}
          component={ConnectedJurisdictionAssignmentView}
        />
      </Switch>
    );
  };

  const plan = plans[0];
  // plan should have selections: Akros_3, ra_CDZ_139e
  plan.jurisdiction = [
    { code: '45017166-cc14-4f2f-b83f-4a72ce17bf91' },
    { code: 'fa351dc7-478c-4be9-be60-de05827dba8e' },
  ];
  const rootId = '0ddd9ad1-452b-4825-a92a-49cb9fc82d18';
  fetch
    .once(JSON.stringify(plan), { status: 200 })
    .once(JSON.stringify(raZambiaHierarchy), { status: 200 });

  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          {
            hash: '',
            pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootId}`,
            search: '',
            state: {},
          },
        ]}
      >
        <App />
      </MemoryRouter>
    </Provider>
  );

  await act(async () => {
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
  });

  // check props given to mock component
  const passedProps: any = wrapper.find('mockComponent2').props();
  expect(passedProps.currentParentId).toBeUndefined();
  expect(passedProps.rootJurisdictionId).toEqual(rootId);

  // rendered component
  expect(wrapper.text()).toMatchSnapshot('general snapshot of page');

  // we now need to check that existing assignments are selected
  renderTable(wrapper, 'should have single node(parent node)');
  let tbodyRow = wrapper.find('tbody tr');
  expect(tbodyRow.length).toEqual(1);
  expect(
    tbodyRow
      .at(0)
      .text()
      .includes('Zambia')
  ).toBeTruthy();

  // drilldown to Akros_3 and check if its selected
  // drilldown to ra Zambia
  tbodyRow
    .at(0)
    .find('NodeCell Link a')
    .simulate('click', { button: 0 });
  await act(async () => {
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
  });
  renderTable(wrapper, 'after first click');
  // nodes are not selected because none of them is akros_3
  wrapper.find('tbody tr').forEach(tr =>
    expect(
      tr
        .find('td input')
        .at(0)
        .props().checked
    ).toBeFalsy()
  );

  // drillDown to Lusaka
  tbodyRow = wrapper.find('tbody tr');
  tbodyRow
    .at(0)
    .find('NodeCell Link a')
    .simulate('click', { button: 0 });
  await act(async () => {
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
  });
  renderTable(wrapper, 'after second click');
  // nodes are not selected because none of them is akros_3
  expect(tbodyRow.length).toEqual(4);
  expect(
    tbodyRow
      .at(0)
      .text()
      .includes('Mtendere')
  ).toBeTruthy();
  wrapper.find('tbody tr').forEach(tr =>
    expect(
      tr
        .find('td input')
        .at(0)
        .props().checked
    ).toBeFalsy()
  );

  // drillDown to Mtendere where akros_3 lies
  tbodyRow = wrapper.find('tbody tr');
  tbodyRow
    .at(0)
    .find('NodeCell Link a')
    .simulate('click', { button: 0 });
  await act(async () => {
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
  });
  renderTable(wrapper, 'after third click');
  // akros_3 node should  be selected while the others are not
  expect(tbodyRow.length).toEqual(2);
  wrapper.find('tbody tr').forEach(tr => {
    if (tr.text().includes('Akros_3')) {
      expect(
        tr
          .find('td input')
          .at(0)
          .props().checked
      ).toBeTruthy();
    } else {
      expect(
        tr
          .find('td input')
          .at(0)
          .props().checked
      ).toBeFalsy();
    }
  });
  // 2 fetch calls one for plan and another for hierarchy.
  expect(fetch.mock.calls).toEqual(e2eFetchCalls);
});
