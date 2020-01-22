import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedIrsPlans, { IrsPlans } from '..';
import { IRS_PLANS } from '../../../../../configs/lang';
import { FI_SINGLE_URL } from '../../../../../constants';
import store from '../../../../../store';
import { Plan } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

describe('containers/pages/IRS', () => {
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
        path: FI_SINGLE_URL,
        url: FI_SINGLE_URL,
      },
      plansArray: fixtures.plans as Plan[],
      plansIdArray: fixtures.plansIdArray,
    };
    shallow(
      <Router history={history}>
        <IrsPlans {...props} />
      </Router>
    );
  });

  it('renders plans list correctly', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        path: FI_SINGLE_URL,
        url: FI_SINGLE_URL,
      },
      plansArray: fixtures.plans as Plan[],
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
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
