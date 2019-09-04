import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedPlanDefinitionList, { PlanDefinitionList } from '../';
import { OPENSRP_PLANS, PLANS } from '../../../../../constants';
import store from '../../../../../store';
import { fetchPlanDefinitions } from '../../../../../store/ducks/opensrp/PlanDefinition';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('components/InterventionPlan/PlanDefinitionList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
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

  it('renders plan definition list correctly', async () => {
    // tslint:disable-next-line: no-empty
    const mockList = jest.fn(async () => ({}));
    const classMock = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    const fetchPlansMock = jest.fn();
    const props = {
      fetchPlans: fetchPlansMock,
      plans: [fixtures.plan1],
      service: classMock,
    };
    const wrapper = mount(
      <Router history={history}>
        <PlanDefinitionList {...props} />
      </Router>
    );

    await flushPromises();

    // check that page title is set
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(PLANS);

    // check that headerBredcrumb is displayed
    expect(toJson(wrapper.find('Breadcrumb'))).toMatchSnapshot('Breadcrumb');

    // there is this table that should be within the page
    expect(toJson(wrapper.find('table.plans-list tbody tr td').first())).toMatchSnapshot(
      'planlistTable single first tbody row data'
    );

    // check that openSRPService is called
    expect(classMock).toHaveBeenCalledWith(OPENSRP_PLANS);

    // fetchPlans is called with response from service.list
    expect(fetchPlansMock).toBeCalledWith({});

    wrapper.unmount();
  });

  it('works with redux store', () => {
    // check props from redux contain expected values
    // tslint:disable-next-line: no-empty
    const mockList = jest.fn(async () => ({}));
    const classMock = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    store.dispatch(fetchPlanDefinitions([fixtures.plan1] as any));
    const fetchPlansMock = jest.fn();
    const props = {
      fetchPlans: fetchPlansMock,
      service: classMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    const dumbComponent = wrapper.find(PlanDefinitionList);
    expect(dumbComponent.length).toEqual(1);
    expect(dumbComponent.props().plans).toEqual([fixtures.plan1]);
  });
});
