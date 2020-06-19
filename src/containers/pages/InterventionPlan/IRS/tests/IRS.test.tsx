import { renderTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedIrsPlans, { IrsPlans } from '..';
import { DRAFTS_PARENTHESIS, IRS_PLANS } from '../../../../../configs/lang';
import { INTERVENTION_IRS_DRAFTS_URL, QUERY_PARAM_TITLE } from '../../../../../constants';
import store from '../../../../../store';
import { plansJSON } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import plansReducer, {
  fetchPlanRecords,
  PlanRecordResponse,
  PlanStatus,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

reducerRegistry.register(plansReducerName, plansReducer);

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('containers/pages/IRS', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const mock: any = jest.fn();
    fetch.once(JSON.stringify([]));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: INTERVENTION_IRS_DRAFTS_URL,
        url: INTERVENTION_IRS_DRAFTS_URL,
      },
      plansArray: [],
    };
    shallow(
      <Router history={history}>
        <IrsPlans {...props} />
      </Router>
    );
    await new Promise(resolve => setImmediate(resolve));
  });

  it('renders plans list correctly', async () => {
    const mock: any = jest.fn();
    fetch.once(JSON.stringify([]));
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: INTERVENTION_IRS_DRAFTS_URL,
        url: INTERVENTION_IRS_DRAFTS_URL,
      },
      plansArray: [fixtures.plan1],
    };

    const wrapper = mount(
      <Router history={history}>
        <IrsPlans {...props} />
      </Router>
    );

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(`${IRS_PLANS}${DRAFTS_PARENTHESIS}`);
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot('drill down table props');
    expect(wrapper.find('a.create-plan').text()).toEqual('Create New Plan');
    expect(wrapper.find('a.create-plan').props()).toMatchSnapshot('button props');
    wrapper.unmount();
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
        path: INTERVENTION_IRS_DRAFTS_URL,
        url: INTERVENTION_IRS_DRAFTS_URL,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlans {...props} />
        </Router>
      </Provider>
    );

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    const dumbComponent = wrapper.find('IrsPlans');
    const dumbComponentProps = dumbComponent.props() as any;
    expect(dumbComponentProps.plansArray).toEqual([]);

    const samplePlanRecord = fixtures.planRecordResponse3;
    samplePlanRecord.status = PlanStatus.DRAFT;
    store.dispatch(fetchPlanRecords([samplePlanRecord] as PlanRecordResponse[]));
    wrapper.update();

    expect((wrapper.find('IrsPlans').props() as any).plansArray.length).toEqual(1);
    wrapper.unmount();
  });

  it('Search works correctly', async () => {
    fetch.mockResponse(plansJSON);
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
        path: INTERVENTION_IRS_DRAFTS_URL,
        url: INTERVENTION_IRS_DRAFTS_URL,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlans {...props} />
        </Router>
      </Provider>
    );

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    renderTable(wrapper, 'find single row for entry with Khlong ');
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
        path: INTERVENTION_IRS_DRAFTS_URL,
        url: INTERVENTION_IRS_DRAFTS_URL,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlans {...props} />
        </Router>
      </Provider>
    );

    expect(wrapper.find('Ripple').length).toEqual(1);

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    renderTable(wrapper, 'find No Data Found text');
    wrapper.unmount();
  });
});
