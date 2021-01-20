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
import { ASSIGN_PLAN_URL, MANUAL_ASSIGN_JURISDICTIONS_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import {
  deforest,
  deselectAllNodes,
  fetchTree,
} from '../../../../../../store/ducks/opensrp/hierarchies';
import { sampleHierarchy } from '../../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import {
  irsPlans,
  plans,
} from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { PlanStatus } from '../../../../../../store/ducks/plans';
import { afterDraftSave, afterSaveAndActivate } from './fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../../configs/env');

const history = createBrowserHistory();

jest.mock('reactstrap', () => {
  const original = require.requireActual('reactstrap');
  return { ...original, Tooltip: () => null };
});

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

  beforeEach(() => {
    store.dispatch(fetchTree(sampleHierarchy));
  });

  afterEach(() => {
    store.dispatch(deselectAllNodes('2942'));
    store.dispatch(deforest());
  });

  it('works correctly through a full render cycle', async () => {
    const plan = irsPlans[0];

    const activateDiv = document.createElement('div');
    activateDiv.setAttribute('id', 'save-and-activate-wrapper');
    document.body.appendChild(activateDiv);

    const draftDiv = document.createElement('div');
    draftDiv.setAttribute('id', 'save-draft-wrapper');
    document.body.appendChild(draftDiv);

    /** current architecture does not use the Jurisdiction table as a view
     * it is seen as a controlled component that is feed some data from controlling component
     * That's why there was a need to have this custom view and a mock routing system.
     */
    const CustomView = (props: RouteComponentProps<Dictionary>) => {
      const mockProps = {
        autoSelectionFlow: false,
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
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={CustomView}
          />
          <Route
            exact={true}
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`}
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
              pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
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

    renderTable(wrapper, 'should have single node(parent node)');
    const tbodyRow = wrapper.find('tbody tr');
    expect(tbodyRow.length).toEqual(1);
    expect(
      tbodyRow
        .at(0)
        .text()
        .includes('Lusaka')
    ).toBeTruthy();

    // simulate click on checkbox to check
    tbodyRow.find('input').simulate('change', { target: { name: '', checked: true } });
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    renderTable(wrapper, 'input checked');

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
        .includes('1')
    ).toBeTruthy();

    // test drilldown
    tbodyRow
      .at(0)
      .find('NodeCell Link a')
      .simulate('click', { button: 0 });

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
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

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
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
    const plan = irsPlans[0];
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

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    // simulate click on parent checkbox to check
    wrapper
      .find('.thead-plan-orgs input')
      .simulate('change', { target: { name: '', checked: true } });

    wrapper.update();
    expect(toJson(wrapper.find('.thead-plan-orgs input'))).toMatchSnapshot('should now be checked');

    // simulate click on parent checkbox to uncheck
    wrapper
      .find('.thead-plan-orgs input')
      .simulate('change', { target: { name: '', checked: false } });

    wrapper.update();
    expect(toJson(wrapper.find('.thead-plan-orgs input'))).toMatchSnapshot('should be unchecked');

    const parentNodeRow = wrapper.find('tbody tr').at(0);
    // create snapshot of checkbox before getting checked
    expect(toJson(parentNodeRow.find('input'))).toMatchSnapshot('should be unchecked');

    // simulate click on checkbox to check
    parentNodeRow.find('input').simulate('change', { target: { name: '', checked: true } });
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
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

    // simulate click on checkbox to unchecked
    wrapper
      .find('tbody tr')
      .at(0)
      .find('input')
      .simulate('change', { target: { name: '', checked: false } });

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
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

  it('disables and enables checkbox for FI plans', async () => {
    const plan = plans[0];
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
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={CustomView}
          />
          <Route
            exact={true}
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`}
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
              pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
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

    const tbodyRow = wrapper.find('tbody tr');
    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .find('input')
        .prop('disabled')
    ).toBe(true);

    // drilldown
    tbodyRow
      .at(0)
      .find('NodeCell Link a')
      .simulate('click', { button: 0 });
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .find('input')
        .prop('disabled')
    ).toBe(true);

    // drill down
    wrapper
      .find('tbody tr')
      .at(0)
      .find('NodeCell a')
      .simulate('click', { button: 0 });
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .find('input')
        .prop('disabled')
    ).toBe(false);
  });

  it('makes correct calls after clicking save draft action', async () => {
    const plan = { ...plans[0], status: PlanStatus.DRAFT };

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
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={CustomView}
          />
          <Route
            exact={true}
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`}
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
              pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
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

    // save draft button is disabled
    expect(wrapper.find('#save-draft button').prop('disabled')).toEqual(true);
    // select a jurisdiction
    const tbodyRow = wrapper.find('tbody tr');
    tbodyRow.find('input').simulate('change', { target: { name: '', checked: true } });
    // save draft button is enabled
    expect(wrapper.find('#save-draft button').prop('disabled')).toEqual(false);

    // simulate a click on draft
    wrapper.find('#save-draft button').simulate('click');

    // flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // check fetch request
    expect(fetch.mock.calls[0]).toEqual(afterDraftSave);
  });

  it('makes correct calls after clicking save and activate', async () => {
    const plan = { ...plans[0], status: PlanStatus.DRAFT };

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
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId/:rootId/:parentId`}
            component={CustomView}
          />
          <Route
            exact={true}
            path={`${MANUAL_ASSIGN_JURISDICTIONS_URL}/:planId`}
            component={CustomView}
          />
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
              pathname: `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${plan.identifier}`,
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

    // save & activate button is disabled
    expect(wrapper.find('#save-and-activate button').prop('disabled')).toEqual(true);
    // select a jurisdiction
    const tbodyRow = wrapper.find('tbody tr');
    tbodyRow.find('input').simulate('change', { target: { name: '', checked: true } });
    // save & activate button is enabled
    expect(wrapper.find('#save-and-activate button').prop('disabled')).toEqual(false);

    // simulate a click on draft
    wrapper.find('#save-and-activate button').simulate('click');

    // flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // check fetch request
    expect(fetch.mock.calls[0]).toEqual(afterSaveAndActivate);

    // check redirection
    expect((wrapper.find('Router').props() as any).history.location.pathname).toEqual(
      `${ASSIGN_PLAN_URL}/${plan.identifier}`
    );
  });
});
