import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { INTERVENTION_IRS_URL } from '../../../../../../constants';
import { OpenSRPService } from '../../../../../../services/opensrp';
import store from '../../../../../../store';
import * as planDucks from '../../../../../../store/ducks/plans';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import {
  irsPlanDefinition1,
  irsPlanRecord1,
  irsPlanRecordNoJurisdictionIds,
  irsPlanRecordResponse1,
  jurisdictionsById,
  jurisidictionResults,
  locationResults,
  parentlessParentJurisdictionResults,
} from '../../tests/fixtures';
import ConnectedIrsPlan, { IrsPlan } from './..';

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

  it('renders without crashing when loading plans with invalid jurisdiction ids', () => {
    store.dispatch(
      planDucks.fetchPlanRecords([irsPlanRecordResponse1 as planDucks.PlanRecordResponse])
    );

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

  it('renders correctly if prop planById is not null', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock = jest.fn(async () => jurisidictionResults);
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
      planById: irsPlanRecord1,
      supersetService: supersetServiceMock,
    };
    const mockList = jest.fn();
    OpenSRPService.prototype.list = mockList;
    mockList.mockReturnValueOnce(Promise.resolve(fixtures.organizations));
    const extractPlanRecordResponseFromPlanPayloadMock = jest.spyOn(
      planDucks,
      'extractPlanRecordResponseFromPlanPayload'
    );

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(toJson(wrapper.find('Connect(IrsPlan)'))).toMatchSnapshot();
    expect(extractPlanRecordResponseFromPlanPayloadMock).not.toBeCalled();
    wrapper.unmount();
  });

  it('renders correctly if a jurisidiction parent is parentless', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock = jest.fn(async () => parentlessParentJurisdictionResults);
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
      planById: irsPlanRecord1,
      supersetService: supersetServiceMock,
    };
    const mockRead = jest.fn();
    const mockList = jest.fn();
    OpenSRPService.prototype.read = mockRead;
    OpenSRPService.prototype.list = mockList;
    mockRead.mockReturnValueOnce(Promise.resolve(locationResults));
    mockList.mockReturnValueOnce(Promise.resolve(fixtures.organizations));

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(toJson(wrapper.find('Connect(IrsPlan)'))).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders correctly if planById.plan_jurisdictions_ids is undefined', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock = jest.fn(async () => jurisidictionResults);
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
      planById: irsPlanRecordNoJurisdictionIds,
      supersetService: supersetServiceMock,
    };
    const mockList = jest.fn();
    OpenSRPService.prototype.list = mockList;
    mockList.mockReturnValueOnce(Promise.resolve(fixtures.organizations));

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(toJson(wrapper.find('Connect(IrsPlan)'))).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders IRS Plan page correctly', async () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => jurisidictionResults);
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

    const mockRead = jest.fn();
    const mockList = jest.fn();
    OpenSRPService.prototype.read = mockRead;
    OpenSRPService.prototype.list = mockList;
    mockRead.mockReturnValueOnce(Promise.resolve(irsPlanDefinition1));
    mockList.mockReturnValueOnce(Promise.resolve(fixtures.organizations));
    const extractPlanRecordResponseFromPlanPayloadMock = jest.spyOn(
      planDucks,
      'extractPlanRecordResponseFromPlanPayload'
    );

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(toJson(wrapper.find('Connect(IrsPlan)'))).toMatchSnapshot();
    expect(extractPlanRecordResponseFromPlanPayloadMock.mock.calls.length).toBe(1);
    expect(mockList.mock.calls.length).toBe(1);
    expect(supersetServiceMock.mock.calls.length).toBe(1);
    wrapper.unmount();
  });
});
