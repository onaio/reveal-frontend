import { Dictionary } from '@onaio/utils/dist/types/types';
import { mount, ReactWrapper } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Route, Router, Switch } from 'react-router';
import { MemoryRouter, RouteComponentProps } from 'react-router-dom';
import { ConnectedJurisdictionTable } from '..';
import { ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import store from '../../../../../store';
import { sampleHierarchy } from '../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

/** will use this to render table rows */
const renderTable = (wrapper: ReactWrapper, message: string) => {
  const trs = wrapper.find('table tr');
  trs.forEach(tr => {
    expect(tr.text()).toMatchSnapshot(message);
  });
};

describe('src/containers/pages/jurisdictionView/jurisdictionTable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    fetch.resetMocks();
  });

  it('works correctly through a full render cycle', async () => {
    const plan = plans[0];

    /** current architecture does not use the Jurisdiction table as a view
     * it is seen as a controlled component that is feed some data from controlling component
     * That's why there was a need to have this custom view and a mock routing system.
     */
    const CustomView = (props: RouteComponentProps<Dictionary>) => {
      const mockProps = {
        currentParentId: props.match.params.parentId,
        plan,
        rootJurisdictionId: '2942',
      };
      return <ConnectedJurisdictionTable {...mockProps} />;
    };

    const App = () => {
      return (
        <Switch>
          <Route
            exact={true}
            path={`${ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={CustomView}
          />
          <Route exact={true} path={`${ASSIGN_JURISDICTIONS_URL}/:planId`} component={CustomView} />
        </Switch>
      );
    };

    fetch.once(JSON.stringify(sampleHierarchy), { status: 200 });

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              hash: '',
              pathname: `${ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
              search: '',
              state: {},
            },
          ]}
        >
          <App />
        </MemoryRouter>
      </Provider>
    );

    // first flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    renderTable(wrapper, 'should have single node(parent node)');
    const tbodyRow = wrapper.find('tbody tr');
    expect(tbodyRow.length).toEqual(1);
    expect(
      tbodyRow
        .at(0)
        .text()
        .includes('Lusaka')
    ).toBeTruthy();

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
        .includes('Mtendere')
    ).toBeTruthy();

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
        .includes('Akros_1')
    ).toBeTruthy();

    // akros is the last child it should not be clickable
    expect(toJson(wrapper.find('tbody tr NodeCell span'))).toMatchSnapshot(
      'should not have btn-link or onClick handler'
    );
  });

  it('selects and deselect nodes', async () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'jurisdiction-tooltip-2942');
    document.body.appendChild(div);

    const div1 = document.createElement('div');
    div1.setAttribute('id', 'jurisdiction-tooltip-3951');
    document.body.appendChild(div1);
    fetch.once(JSON.stringify(sampleHierarchy), { status: 200 });
    const plan = plans[0];
    const props = {
      plan,
      rootJurisdictionId: '2942',
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionTable {...props} />
        </Router>
      </Provider>
    );

    // first flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    const parentNodeRow = wrapper.find('tbody tr').at(0);
    // create snapshot of checkbox before getting checked
    expect(toJson(parentNodeRow.find('input'))).toMatchSnapshot('should be unchecked');

    await act(async () => {
      // simulate click on checkbox to check
      parentNodeRow.find('input').simulate('change', { target: { name: '', checked: true } });
      wrapper.update();
    });

    expect(
      toJson(
        wrapper
          .find('tbody tr')
          .at(0)
          .find('input')
      )
    ).toMatchSnapshot('should be now checked');

    await act(async () => {
      // simulate click on checkbox to unchecked
      wrapper
        .find('tbody tr')
        .at(0)
        .find('input')
        .simulate('change', { target: { name: '', checked: false } });
      wrapper.update();
    });

    // checkbox is now deselected again
    expect(
      toJson(
        wrapper
          .find('tbody tr')
          .at(0)
          .find('input')
      )
    ).toMatchSnapshot('should be now deselected');
  });

  it('shows loader', async () => {
    fetch.once(JSON.stringify(sampleHierarchy), { status: 200 });
    const plan = plans[0];
    const props = {
      plan,
      rootJurisdictionId: '2942',
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionTable {...props} />
        </Router>
      </Provider>
    );

    // first flush promises
    await act(async () => {
      wrapper.update();
    });

    expect(wrapper.find('Ripple').length).toEqual(1);
  });

  it('shows errorMessage', async () => {
    fetch.once(JSON.stringify({}), { status: 500 });
    const plan = plans[0];
    const props = {
      plan,
      rootJurisdictionId: '2942',
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionTable {...props} />
        </Router>
      </Provider>
    );

    // first flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // here we see the error message in snapshot
    expect(wrapper.find('ErrorPage').text()).toMatchSnapshot(
      'should have jurisdiction hierarchy error message'
    );
  });
});
