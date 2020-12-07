import { renderTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { createConnectedOpenSRPPlansList } from '..';
import { ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED } from '../../../../../../../configs/env';
import { USER_HAS_NO_PLAN_ASSIGNMENTS } from '../../../../../../../configs/lang';
import { PLANNING_VIEW_URL, QUERY_PARAM_TITLE } from '../../../../../../../constants';
import store from '../../../../../../../store';
import {
  plans,
  plansJSON,
} from '../../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import plansReducer, {
  fetchPlanRecords,
  InterventionType,
  PlanRecordResponse,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../../../../store/ducks/plans';
import * as fixtures from '../../../../../../../store/ducks/tests/fixtures';
import { draftPageColumns } from '../../utils';

/** register the plans reducer */
reducerRegistry.register(plansReducerName, plansReducer);

jest.mock('../../../../../../../configs/env');

const history = createBrowserHistory();

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const ConnectedOpenSRPPlansList = createConnectedOpenSRPPlansList();

describe('src/../PlanningView/OpenSRPPlansList', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('works correctly with store', async () => {
    const mock: any = jest.fn();
    fetch.mockResponse(plansJSON);
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: '',
        url: '',
      },
      planStatuses: ['draft'],
      tableColumns: draftPageColumns,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedOpenSRPPlansList {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    const samplePlanRecord = fixtures.planRecordResponse3;
    samplePlanRecord.status = PlanStatus.DRAFT;
    store.dispatch(fetchPlanRecords([samplePlanRecord] as PlanRecordResponse[]));
    wrapper.update();

    expect((wrapper.find('OpenSRPPlansList').props() as any).plansArray.length).toEqual(2);
    wrapper.unmount();
  });

  it('Search works correctly', async () => {
    // the assertion for the undefined plan is that we do not get an error
    const undefinedPlan = { ...plans[0], plan_title: undefined, identifier: 'planTitleWithout' };
    const fullList = [...plans, undefinedPlan];
    fetch.mockResponse(JSON.stringify(fullList));
    const props = {
      history,
      location: {
        hash: '',
        pathname: '',
        search: `${QUERY_PARAM_TITLE}=Khlong `,
        state: '',
      },
      match: {
        isExact: true,
        params: {},
        path: '',
        url: '',
      },
      planStatuses: ['draft'],
      tableColumns: draftPageColumns,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedOpenSRPPlansList {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    renderTable(wrapper, 'find single row for entry with Khlong ');
    wrapper.unmount();
  });

  it('errorMessage shown when there userName has no plans assigned', async () => {
    // the assertion for the undefined plan is that we do not get an error
    const fullList = [...plans];
    fetch.mockResponse(JSON.stringify(fullList));
    fetch.mockResponse(JSON.stringify([]));
    const props = {
      history,
      location: {
        hash: '',
        pathname: '',
        search: `?user=${'nonExistentUserName'}`,
        state: '',
      },
      match: {
        isExact: true,
        params: {},
        path: '',
        url: '',
      },
      planStatuses: ['draft'],
      tableColumns: draftPageColumns,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedOpenSRPPlansList {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(wrapper.text()).toMatchSnapshot();
    expect(wrapper.text().includes(USER_HAS_NO_PLAN_ASSIGNMENTS)).toBeTruthy();
    wrapper.unmount();
  });

  it('does not show loader for no data', async () => {
    fetch.mockReject(new Error('No Plans returned'));
    const props = {
      history,
      location: {
        hash: '',
        pathname: '',
        search: `${QUERY_PARAM_TITLE}=usadafasdgaka`,
        state: '',
      },
      match: {
        isExact: true,
        params: {},
        path: PLANNING_VIEW_URL,
        url: PLANNING_VIEW_URL,
      },
      planStatuses: ['draft'],
      tableColumns: draftPageColumns,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedOpenSRPPlansList {...props} />
        </Router>
      </Provider>
    );

    expect(wrapper.find('Ripple').length).toEqual(1);

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    renderTable(wrapper, 'find No Data Found text');
    wrapper.unmount();
  });

  it('Displays right plan interventions', async () => {
    const envModule = require('../../../../../../../configs/env');
    envModule.ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED = [InterventionType.MDA];
    const mock: any = jest.fn();
    fetch.mockResponse(plansJSON);
    const props = {
      history,
      interventionTypes: ASSIGN_TEAMS_PLAN_TYPES_DISPLAYED as InterventionType[],
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: '',
        url: '',
      },
      tableColumns: draftPageColumns,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedOpenSRPPlansList {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect((wrapper.find('OpenSRPPlansList').props() as any).plansArray.length).toEqual(1);
    wrapper.unmount();
  });
});
