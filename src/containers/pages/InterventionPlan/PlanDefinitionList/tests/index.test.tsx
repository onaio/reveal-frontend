import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedPlanDefinitionList, { PlanDefinitionList } from '../';
import store from '../../../../../store';
import { fetchPlanDefinitions } from '../../../../../store/ducks/opensrp/PlanDefinition';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('components/InterventionPlan/PlanDefinitionList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      plans: fixtures.plans,
    };
    shallow(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    fetch.mockResponseOnce(fixtures.plansJSON);
    const props = {
      plans: fixtures.plans,
    };
    const wrapper = mount(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('handles search correctly', async () => {
    store.dispatch(fetchPlanDefinitions(fixtures.plans));

    const props = {
      fetchPlans: jest.fn(),
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    wrapper
      .find('Input')
      .at(0)
      .simulate('change', { target: { value: 'Mosh' } });
    // Wait for debounce
    await new Promise(r => setTimeout(r, 1500));
    wrapper.mount();
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('A Test By Mosh');
  });

  it('handles a case insensitive search', async () => {
    store.dispatch(fetchPlanDefinitions(fixtures.plans));

    const props = {
      fetchPlans: jest.fn(),
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    wrapper
      .find('Input')
      .at(0)
      .simulate('change', { target: { value: 'MOsh' } });
    // Wait for debounce
    await new Promise(r => setTimeout(r, 1500));
    wrapper.mount();
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('A Test By Mosh');
  });

  it('renders empty table if no search matches', async () => {
    store.dispatch(fetchPlanDefinitions(fixtures.plans));

    const props = {
      fetchPlans: jest.fn(),
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    wrapper
      .find('Input')
      .at(0)
      .simulate('change', { target: { value: 'OOOOOOOPPOAPOPAO' } });
    // Wait for debounce
    await new Promise(r => setTimeout(r, 1500));
    wrapper.mount();
    expect(toJson(wrapper.find('tbody tr'))).toEqual(null);
  });
});
