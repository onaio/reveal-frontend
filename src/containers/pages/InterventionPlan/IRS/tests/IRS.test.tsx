import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedIrsPlans, { IrsPlans } from '..';
import { IRS_PLANS } from '../../../../../configs/lang';
import { INTERVENTION_IRS_DRAFTS_URL } from '../../../../../constants';
import store from '../../../../../store';
import { fetchPlanRecords } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('containers/pages/IRS', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
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
  });

  it('renders plans list correctly', () => {
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
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(IRS_PLANS);
    expect(wrapper.find('IrsPlans').props()).toMatchSnapshot('irs plans props');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot('drill down table props');
    expect(wrapper.find('Button').text()).toEqual('Create New Plan');
    expect(wrapper.find('Button').props()).toMatchSnapshot('button props');
    wrapper.unmount();
  });

  it('works correctly with store', () => {
    store.dispatch(fetchPlanRecords([]));
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
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlans {...props} />
        </Router>
      </Provider>
    );

    const dumbComponent = wrapper.find('IrsPlans');
    const dumbComponentProps = dumbComponent.props() as any;

    expect(dumbComponentProps.plansArray).toEqual([]);
  });
});
