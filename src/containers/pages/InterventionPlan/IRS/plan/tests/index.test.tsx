import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { INTERVENTION_IRS_URL } from '../../../../../../constants';
import { FlexObject } from '../../../../../../helpers/utils';
import store from '../../../../../../store';
import jurisdictionReducer, {
  reducerName as jurisdictionReducerName,
} from '../../../../../../store/ducks/jurisdictions';
import { Organization } from '../../../../../../store/ducks/opensrp/organizations';
import plansReducer, {
  fetchPlanRecords,
  PlanRecordResponse,
  reducerName as plansReducerName,
} from '../../../../../../store/ducks/plans';
import { authorizeSuperset } from '../../../../../../store/ducks/superset';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import {
  irsPlanRecordResponse1,
  jurisdictionsArray,
  jurisdictionsById,
} from '../../tests/fixtures';
import ConnectedIrsPlan, { IrsPlan } from './..';

reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(plansReducerName, plansReducer);

jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('containers/pages/IRS/plan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(authorizeSuperset(true));
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

  it('renders IRS Plan page correctly', () => {
    const mock: any = jest.fn();
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
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    // check that the page title is rendered correctly
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders without crashing when loading plans with invlaid jurisdiction ids', () => {
    store.dispatch(fetchPlanRecords([irsPlanRecordResponse1 as PlanRecordResponse]));
    // store.dispatch()

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

  it('calls the correct API endpoints to load map and table', () => {
    store.dispatch(fetchPlanRecords([irsPlanRecordResponse1 as PlanRecordResponse])); // negates: opensrp (1) - get plan

    const mock: any = jest.fn();
    const { identifier: id } = irsPlanRecordResponse1;
    // const supersetServiceMock: any = jest.fn();
    // supersetServiceMock.mockImplementation(async () => jurisdictionsArray as FlexObject[]);

    fetch
      .mockResponseOnce(JSON.stringify([] as Organization[])) // opensrp (2) - get organizations: the only successful mock response
      .mockResponseOnce(JSON.stringify(jurisdictionsArray as FlexObject[])) // superset (3) - get all jurisdictions
      .mockResponseOnce(JSON.stringify([jurisdictionsArray[0]])); // opensrp (4) - get level 0 jurisdiction

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

    // check that the page renders more than just a spinner
    // todo - when more than the spinner loads, replace snapshot with better tests
    expect(toJson(wrapper.find('IrsPlan'))).toMatchSnapshot('IRS PLAN');

    // todo - mock click save buttons
    // const saveDraftButton = wrapper.find('.save-plan-as-draft-btn');
    // expect(saveDraftButton.length).toBe(1);
    // const saveFinalButton = wrapper.find('.save-as-finalized-plan-btn');
    // expect(saveDraftButton.length).toBe(1);

    wrapper.unmount();
  });
});
