import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedIrsPlans, { IrsPlans } from '..';
import { IRS_PLANS } from '../../../../../configs/lang';
import { FI_SINGLE_URL, INTERVENTION_IRS_URL } from '../../../../../constants';
import store from '../../../../../store';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import * as irsFixtures from '../tests/fixtures';

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

describe('containers/pages/IRS', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  xit('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: FI_SINGLE_URL,
        url: FI_SINGLE_URL,
      },
      plansArray: fixtures.plans,
      plansIdArray: fixtures.plansIdArray,
    };
    shallow(
      <Router history={history}>
        <IrsPlans {...props} />
      </Router>
    );
  });

  xit('renders plans list correctly', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        path: FI_SINGLE_URL,
        url: FI_SINGLE_URL,
      },
      plansArray: [fixtures.plan1],
      plansIdArray: fixtures.plansIdArray,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlans {...props} />
        </Router>
      </Provider>
    );
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(IRS_PLANS);
    expect(wrapper.find('IrsPlans').props()).toMatchSnapshot('irs plans props');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot('drill down table props');
    expect(wrapper.find('Button').text()).toEqual('Create New Plan');
    expect(wrapper.find('Button').props()).toMatchSnapshot('button props');
    wrapper.unmount();
  });

  xit('render loader when plansArray is empty', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        path: FI_SINGLE_URL,
        url: FI_SINGLE_URL,
      },
      plansArray: [],
      plansIdArray: fixtures.plansIdArray,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlans {...props} />
        </Router>
      </Provider>
    );
    expect(wrapper.find('Ripple').length).toEqual(1);
    wrapper.unmount();
  });

  it('renders correctly for intevention/irs', async () => {
    const mock: any = jest.fn();
    const supersetMock = jest.fn(async () => irsFixtures.plansArray);
    const props = {
      history,
      isReporting: true,
      location: mock,
      match: {
        isExact: true,
        path: INTERVENTION_IRS_URL,
        url: INTERVENTION_IRS_URL,
      },
      plansArray: [],
      plansIdArray: fixtures.plansIdArray,
      supersetService: supersetMock,
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

    expect(wrapper.text()).toMatchInlineSnapshot(`""`);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
