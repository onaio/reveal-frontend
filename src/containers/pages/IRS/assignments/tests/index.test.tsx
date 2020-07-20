import { renderTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { OpenSRPPlansList, tableColumns } from '../';
import { ASSIGN_PLANS } from '../../../../../configs/lang';
import { ASSIGN_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';
import plansReducer, {
  fetchPlanRecords,
  PlanRecordResponse,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

/** register the plan definitions reducer */
reducerRegistry.register(plansReducerName, plansReducer);

const history = createBrowserHistory();

describe('components/IRS Reports/IRSPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: ASSIGN_PLANS,
        url: ASSIGN_PLAN_URL,
      },
      plansArray: [],
      sortByDate: true,
      tableColumns,
    };
    shallow(
      <Router history={history}>
        <OpenSRPPlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', async () => {
    fetch.mockResponseOnce(fixtures.planRecords);
    store.dispatch(fetchPlanRecords(fixtures.extractedPlans as PlanRecordResponse[]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: ASSIGN_PLANS,
        url: ASSIGN_PLAN_URL,
      },
      planStatuses: ['active'],
      plansArray: fixtures.planRecords,
      sortByDate: true,
      tableColumns,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <OpenSRPPlansList {...props} />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    renderTable(wrapper);
    wrapper.unmount();
  });
});
