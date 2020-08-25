import { Dictionary } from '@onaio/utils';
import { mount, ReactWrapper } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, RouteComponentProps, Switch } from 'react-router';
import { AUTO_ASSIGN_JURISDICTIONS_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import { fetchTree, selectNode } from '../../../../../../store/ducks/opensrp/hierarchies';
import { raZambiaHierarchy } from '../../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { irsPlans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { ConnectedSelectedStructuresTable } from '../structureSummary';

/** will use this to render table rows */
const renderTable = (wrapper: ReactWrapper, message: string) => {
  const trs = wrapper.find('table tr');
  trs.forEach(tr => {
    expect(tr.text()).toMatchSnapshot(message);
  });
};

describe('', () => {
  /** nothing but if drill down works, ooh and the structure total count is correct */
  it('structure Summary works correctly ', () => {
    const plan = irsPlans[0];
    // prepare store: should have a tree with  at-least one selected leaf node
    store.dispatch(fetchTree(raZambiaHierarchy));
    // select Akros_1   3951
    store.dispatch(selectNode('0ddd9ad1-452b-4825-a92a-49cb9fc82d18', '3951', plan.identifier));

    /** current architecture does not use the structureSummary table as a view
     * it is seen as a controlled component that is feed some data from controlling component
     * That's why there was a need to have this custom view and a mock routing system.
     */
    const CustomView = (props: RouteComponentProps<Dictionary>) => {
      const mockProps = {
        autoSelectionFlow: false,
        currentParentId: props.match.params.parentId,
        planId: plan.identifier,
        rootJurisdictionId: '0ddd9ad1-452b-4825-a92a-49cb9fc82d18',
      };
      return <ConnectedSelectedStructuresTable {...mockProps} />;
    };

    const App = () => {
      return (
        <Switch>
          <Route
            exact={true}
            path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={CustomView}
          />
          <Route
            exact={true}
            path={`${AUTO_ASSIGN_JURISDICTIONS_URL}/:planId`}
            component={CustomView}
          />
        </Switch>
      );
    };

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              hash: '',
              pathname: `${AUTO_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
              search: '',
              state: {},
            },
          ]}
        >
          <App />
        </MemoryRouter>
      </Provider>
    );

    renderTable(wrapper, 'should have single node(parent node)');
    const tbodyRow = wrapper.find('tbody tr');
    expect(tbodyRow.length).toEqual(1);
    expect(
      tbodyRow
        .at(0)
        .text()
        .includes('Zambia')
    ).toBeTruthy();

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"ra Zambia13"`);

    // test drilldown
    tbodyRow
      .at(0)
      .find('NodeCell Link a')
      .simulate('click', { button: 0 });

    wrapper.update();
    renderTable(wrapper, 'after first click');

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Lusaka13"`);

    wrapper
      .find('tbody tr')
      .at(0)
      .find('NodeCell a')
      .simulate('click', { button: 0 });

    wrapper.update();
    renderTable(wrapper, 'after second click');

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Mtendere13"`);

    wrapper
      .find('tbody tr')
      .at(0)
      .find('NodeCell a')
      .simulate('click', { button: 0 });

    wrapper.update();
    renderTable(wrapper, 'after third click');

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Akros_113"`);

    // akros is the last child it should not be clickable
    expect(toJson(wrapper.find('tbody tr NodeCell span'))).toMatchSnapshot(
      'should not have btn-link or onClick handler'
    );
  });
});
