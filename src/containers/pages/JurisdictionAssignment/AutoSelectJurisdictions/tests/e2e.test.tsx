import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router';
import ConnectedAutoSelectView from '..';
import { AUTO_ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import { renderTable } from '../../../../../helpers/testUtils';
import store from '../../../../../store';
import hierarchiesReducer, {
  deforest,
  deselectAllNodes,
  reducerName as hierarchiesReducerName,
} from '../../../../../store/ducks/opensrp/hierarchies';
import { zambiaHierarchy } from '../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import plansReducer, { reducerName } from '../../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { ResourceCalculation } from '../../helpers/ResourceCalcWidget';
import { autoSelectionJurisdictionMeta } from './fixtures';

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

describe('e2e test auto-selection flow', () => {
  afterEach(() => {
    store.dispatch(deselectAllNodes('22bc44dd-752d-4c20-8761-617361b4f1e7'));
    store.dispatch(deforest());
  });
  it('from slider auto-selection to refine jurisdictions', async () => {
    jest.setTimeout(30000);
    const envModule = require('../../../../../configs/env');
    envModule.ASSIGNMENT_PAGE_SHOW_MAP = true;

    const App = () => {
      return (
        <Switch>
          <Route
            exact={true}
            path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={ConnectedAutoSelectView}
          />
          <Route
            exact={true}
            path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId`}
            component={ConnectedAutoSelectView}
          />
        </Switch>
      );
    };

    const plan = plans[0];
    const rootId = '22bc44dd-752d-4c20-8761-617361b4f1e7';
    fetch
      .once(JSON.stringify(autoSelectionJurisdictionMeta), { status: 200 })
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(zambiaHierarchy), { status: 200 });

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              hash: '',
              pathname: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootId}`,
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

    expect(wrapper.text()).toMatchSnapshot('general page snapshot');

    /** we start with the slider component where we have tailored the metaData
     * to facilitate 2 nodes autoSelection:
     */
    // CWY_25 (178 structures) is selected by default during mount since it has a threshold of 80 > 0
    expect(wrapper.find('div.slider-section').text()).toMatchInlineSnapshot(`"Risk  0%00100"`);
    expect(
      wrapper
        .find('div.info-section')
        .first()
        .text()
    ).toMatchInlineSnapshot(`"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS178"`);
    expect(
      wrapper
        .find('div.info-section')
        .last()
        .text()
    ).toMatchInlineSnapshot(`"1 jurisdiction(s) selected"`);

    // click next to proceed to the structureSummary view
    wrapper.find('JurisdictionSelectionsSlider button.btn-success').simulate('click');

    act(() => {
      wrapper.update();
    });

    expect(wrapper.text()).toMatchSnapshot('structure summary step snapshot');

    /** structure summary step, check that drill-down only has the correct nodes */

    renderTable(wrapper, 'should have single node(parent node)');
    const tbodyRow = wrapper.find('tbody tr');
    expect(tbodyRow.length).toEqual(1);
    expect(
      tbodyRow
        .at(0)
        .text()
        .includes('Zambia')
    ).toBeTruthy();
    // expect only one tbody row
    expect(wrapper.find('tbody tr').length).toEqual(1);

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Zambia178"`);

    // test drilldown
    tbodyRow
      .at(0)
      .find('NodeCell Link a')
      .simulate('click', { button: 0 });

    wrapper.update();
    renderTable(wrapper, 'after first click');

    // expect only one tbody row
    expect(wrapper.find('tbody tr').length).toEqual(1);
    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Eastern178"`);

    wrapper
      .find('tbody tr')
      .at(0)
      .find('NodeCell a')
      .simulate('click', { button: 0 });

    wrapper.update();
    renderTable(wrapper, 'after second click');

    // expect only one tbody row
    expect(wrapper.find('tbody tr').length).toEqual(1);
    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Sinda178"`);

    wrapper
      .find('tbody tr')
      .at(0)
      .find('NodeCell a')
      .simulate('click', { button: 0 });

    wrapper.update();
    renderTable(wrapper, 'after third click');

    // expect only one tbody row
    expect(wrapper.find('tbody tr').length).toEqual(1);
    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Chiwuyu178"`);

    wrapper
      .find('tbody tr')
      .at(0)
      .find('NodeCell a')
      .simulate('click', { button: 0 });

    wrapper.update();
    renderTable(wrapper, 'after third click');

    // expect only one tbody row
    expect(wrapper.find('tbody tr').length).toEqual(1);
    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"CWY_25178"`);

    // CWY_25 is the last child it should not be clickable
    expect(toJson(wrapper.find('tbody tr NodeCell span'))).toMatchSnapshot(
      'should not have btn-link or onClick handler'
    );

    /** try resource calculation for CWY_25 */

    // simulate structure count change so that we can have 10 structures per team
    wrapper
      .find('input[name="structuresCount"]')
      .simulate('change', { target: { value: 10, name: 'structuresCount' } });
    wrapper.update();

    wrapper
      .find('input[name="teamsCount"]')
      .simulate('change', { target: { value: 3, name: 'teamsCount' } });
    wrapper.update();

    // see if there has been any change to the number of days, should start with 6 days
    // 178 structures / 30 structures per team for 3 teams => 178 / 30
    expect(wrapper.find('form p').text()).toMatchInlineSnapshot(
      `"6 daysat a rate of   structures per team per day with  Teams"`
    );

    // click next goto the refine jurisdiction selections section
    wrapper.find('SelectedStructuresTable button.btn-success').simulate('click');

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(wrapper.text()).toMatchSnapshot('refine selected jurisdictions component');

    /** we should now be in the jurisdictions refinement component,  */

    // here we check that the whole tree is shown i.e. not just nodes in
    // a path that has selected nodes.
    // there is now more than one node(the ones that is selected)
    expect(wrapper.find('tbody tr').length).toEqual(23);

    // drill up to parent node. // Zambia: it should now have more children
    // after drill-down than those showed in the structure summary step

    expect(
      wrapper
        .find('JurisdictionTable HeaderBreadcrumb BreadcrumbItem')
        .at(1)
        .text()
    ).toMatchInlineSnapshot(`"Zambia"`);
    wrapper
      .find('JurisdictionTable HeaderBreadcrumb BreadcrumbItem')
      .at(1)
      .find('a')
      .simulate('click', { button: 0 });

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // all children of Zambia are shown: only one of them is in a path that has
    // selected nodes
    expect(wrapper.find('tbody tr').length).toEqual(6);

    // simulate a click to check one of the immediate children of Zambia: Western
    // => effectively checking all leaf nodes that are descendants of Western
    wrapper.find('tbody tr').forEach(tr => {
      if (tr.text().includes('Western')) {
        // check the checkbox
        tr.find('input').simulate('change', { target: { name: '', checked: true } });
      }
    });

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // check for new selections
    wrapper.find('tbody tr').forEach(tr => {
      if (tr.text().includes('Western')) {
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
  });

  it('when there are no selected jurisdictions(without metaData)', async () => {
    jest.setTimeout(20000);
    const envModule = require('../../../../../configs/env');
    envModule.ASSIGNMENT_PAGE_SHOW_MAP = true;

    const App = () => {
      return (
        <Switch>
          <Route
            exact={true}
            path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={ConnectedAutoSelectView}
          />
          <Route
            exact={true}
            path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId`}
            component={ConnectedAutoSelectView}
          />
        </Switch>
      );
    };

    const plan = plans[0];
    const rootId = '22bc44dd-752d-4c20-8761-617361b4f1e7';
    fetch
      .once(JSON.stringify([]), { status: 200 })
      .once(JSON.stringify(plan), { status: 200 })
      .once(JSON.stringify(zambiaHierarchy), { status: 200 });

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              hash: '',
              pathname: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}/${rootId}`,
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

    expect(wrapper.text()).toMatchSnapshot('general page snapshot');

    /** we start with the slider component : there is no metadata so no matter what
     * threshold we set there will be no selected jurisdictions
     */
    // CWY_25 (178 structures) is selected by default during mount since it has a threshold of 80 > 0
    expect(wrapper.find('div.slider-section').text()).toMatchInlineSnapshot(`"Risk  0%00100"`);
    expect(
      wrapper
        .find('div.info-section')
        .first()
        .text()
    ).toMatchInlineSnapshot(`"NUMBER OF STRUCTURES IN SELECTED JURISDICTIONS0"`);
    expect(
      wrapper
        .find('div.info-section')
        .last()
        .text()
    ).toMatchInlineSnapshot(`"0 jurisdiction(s) selected"`);

    // click next to proceed to the structureSummary view
    wrapper.find('JurisdictionSelectionsSlider button.btn-success').simulate('click');

    act(() => {
      wrapper.update();
    });

    expect(wrapper.text()).toMatchSnapshot('structure summary step snapshot');

    /** structure summary step, this would not have any records */

    renderTable(wrapper, 'will not have any nodes');
    const tbodyRow = wrapper.find('tbody tr');
    expect(tbodyRow.length).toEqual(0);
    expect(wrapper.find('SelectedStructuresTable').text()).toMatchInlineSnapshot(
      `"....NameStructures CountThere are no descendant jurisdictions that are targeted.Continue to next step"`
    );

    /** What of the resource calculation component */

    // is an error page => will refactor this to an info message instead
    expect(wrapper.find(ResourceCalculation).text()).toMatchInlineSnapshot(
      `"Zambia:  There are no descendant jurisdictions that are targeted."`
    );

    // click next goto the refine jurisdiction selections section
    wrapper.find('SelectedStructuresTable button.btn-success').simulate('click');

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // expect(wrapper.text()).toMatchSnapshot('refine selected jurisdictions component');

    /** we should now be in the jurisdictions refinement component,  */

    // here we check that the whole tree is shown
    expect(wrapper.text()).toMatchSnapshot('full page rendered text');

    const bodyRows = wrapper.find('tbody tr');
    // test drilldown
    bodyRows
      .at(0)
      .find('NodeCell Link a')
      .simulate('click', { button: 0 });

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // all children of Zambia are shown:
    expect(wrapper.find('tbody tr').length).toEqual(6);

    // simulate a click to check one of the immediate children of Zambia: Western
    // => effectively checking all leaf nodes that are descendants of Western
    wrapper.find('tbody tr').forEach(tr => {
      if (tr.text().includes('Western')) {
        // check the checkbox
        tr.find('input').simulate('change', { target: { name: '', checked: true } });
      }
    });

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // check for new selections
    wrapper.find('tbody tr').forEach(tr => {
      if (tr.text().includes('Western')) {
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

    /** the resource calculation component updates accordingly */
    expect(wrapper.find(ResourceCalculation).text()).toMatchInlineSnapshot(
      `"Resource Estimate for Zambia0 daysat a rate of   structures per team per day with  Teams"`
    );

    // check resource calc behavior when drilling down to children node that does not
    // have selected jurisdictions
    wrapper.find('tbody tr').forEach(tr => {
      if (tr.text().includes('Eastern')) {
        // check the checkbox
        tr.find('NodeCell Link a').simulate('click', { button: 0 });
      }
    });
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    /** the resource calculation component updates accordingly */
    expect(wrapper.find(ResourceCalculation).text()).toMatchInlineSnapshot(
      `"Eastern:  There are no descendant jurisdictions that are targeted."`
    );
  });
});
