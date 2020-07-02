import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { DraftPlans } from '..';
import { DRAFT_PLANS } from '../../../../../../configs/lang';
import { INTERVENTION_IRS_DRAFTS_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import plansReducer, { reducerName as plansReducerName } from '../../../../../../store/ducks/plans';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';

reducerRegistry.register(plansReducerName, plansReducer);

jest.mock('../../../../../../configs/env');

const history = createBrowserHistory();

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('src/containers/../PlanningView/DraftPlans', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
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
      <Provider store={store}>
        <Router history={history}>
          <DraftPlans {...props} />
        </Router>
      </Provider>
    );

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(DRAFT_PLANS);
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot('drill down table props');
    expect(wrapper.find('a.create-plan').text()).toEqual('Create New Plan');
    expect(wrapper.find('a.create-plan').props()).toMatchSnapshot('button props');
    wrapper.unmount();
  });
});
