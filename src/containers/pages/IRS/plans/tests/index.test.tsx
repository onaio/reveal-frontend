import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedIRSPlansList, { IRSPlansList } from '../';
import store from '../../../../../store';
import { fetchIRSPlans, IRSPlan } from '../../../../../store/ducks/generic/plans';
import IRSPlansReducer, {
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';

reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);

const history = createBrowserHistory();

describe('components/IRS Reports/IRSPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      plans: fixtures.plans as IRSPlan[],
    };
    shallow(
      <Router history={history}>
        <IRSPlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    const props = {
      plans: fixtures.plans as IRSPlan[],
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSPlansList {...props} />
      </Router>
    );
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(toJson(wrapper.find('thead tr th'))).toMatchSnapshot('table headers');
    expect(toJson(wrapper.find('tbody tr td'))).toMatchSnapshot('table rows');
    wrapper.unmount();
  });

  it('Works with store', async () => {
    const supersetMock: any = jest.fn(async () => fixtures.plans);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPlansList service={supersetMock} />
        </Router>
      </Provider>
    );
    expect(wrapper.find('Ripple').length).toEqual(1);

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(
      wrapper
        .find('tbody tr td')
        .at(0)
        .text()
    ).toMatchSnapshot('First table row');
    wrapper.unmount();
  });

  it('Does not show loader when store has data', async () => {
    store.dispatch(fetchIRSPlans(fixtures.plans as IRSPlan[]));
    const supersetMock: any = jest.fn(async () => fixtures.plans);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIRSPlansList service={supersetMock} />
        </Router>
      </Provider>
    );
    expect(wrapper.find('Ripple').length).toEqual(0);
    expect(
      wrapper
        .find('tbody tr td')
        .at(0)
        .text()
    ).toMatchSnapshot('First table rows');
    wrapper.unmount();
  });
});
