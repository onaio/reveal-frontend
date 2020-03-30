import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { INTERVENTION_IRS_URL } from '../../../../../../constants';
import { OpenSRPService } from '../../../../../../services/opensrp';
import store from '../../../../../../store';
import jurisdictionReducer, {
  reducerName as jurisdictionReducerName,
} from '../../../../../../store/ducks/jurisdictions';
import plansReducer, {
  fetchPlanRecords,
  PlanRecordResponse,
  reducerName as plansReducerName,
} from '../../../../../../store/ducks/plans';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import { irsPlanRecordResponse1, jurisdictionsById } from '../../tests/fixtures';
import { irsPlanDefinition1, jurisidictionResults } from '../../tests/fixtures';
import ConnectedIrsPlan, { IrsPlan } from './..';
import * as serviceCalls from './../serviceCalls';

reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(plansReducerName, plansReducer);

jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('containers/pages/IRS/plan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '1234' },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/1234`,
      },
      planId: '1234',
    };
    shallow(
      <Router history={history}>
        <IrsPlan {...props} />
      </Router>
    );
  });

  it('renders IRS Plan page correctly', async () => {
    const mock: any = jest.fn();
    const mockList = jest.fn();
    const mockRead = jest.fn();
    OpenSRPService.prototype.list = mockList;
    OpenSRPService.prototype.read = mockRead;
    mockRead.mockReturnValueOnce(Promise.resolve(irsPlanDefinition1));
    mockList.mockReturnValueOnce(Promise.resolve(fixtures.organizations));
    const supersetServiceMock: any = jest.fn(async () => jurisidictionResults);
    const loadPlanMock: any = jest.spyOn(serviceCalls, 'loadPlan');

    const { id } = fixtures.plan1;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/${id}`,
      },
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    await flushPromises();
    // check that the page title is rendered correctly
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(loadPlanMock).toBeCalled();
    expect(supersetServiceMock.mock.calls.length).toBe(1);
    wrapper.unmount();
  });

  it('renders without crashing when loading plans with invlaid jurisdiction ids', () => {
    store.dispatch(fetchPlanRecords([irsPlanRecordResponse1 as PlanRecordResponse]));

    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();
    const { identifier: id } = irsPlanRecordResponse1;

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => [
      jurisdictionsById['0'],
      jurisdictionsById['1A'],
      jurisdictionsById['1B'],
      jurisdictionsById['1Aa'],
      jurisdictionsById['1Ab'],
      jurisdictionsById['1Ba'],
      jurisdictionsById['1Bb'],
    ]);

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/${id}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );

    wrapper.unmount();
  });
});
