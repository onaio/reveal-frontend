import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { UpdatePlan } from '..';
import { PlanDefinition } from '../../../../../configs/settings';
import { PLAN_UPDATE_URL } from '../../../../../constants';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('components/InterventionPlan/UpdatePlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function getProps() {
    const mock: any = jest.fn();
    return {
      fetchPlan: mock,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plans[1].identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${fixtures.plans[1].identifier}`,
      },
      plan: fixtures.plans[1] as PlanDefinition,
    };
  }

  it('renders without crashing', () => {
    fetch.mockResponseOnce(JSON.stringify(fixtures.plans[1]));
    shallow(
      <Router history={history}>
        <UpdatePlan {...getProps()} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    fetch.mockResponseOnce(JSON.stringify(fixtures.plans[1]));
    const wrapper = mount(
      <Router history={history}>
        <UpdatePlan {...getProps()} />
      </Router>
    );
    expect(toJson(wrapper.find('Breadcrumb'))).toMatchSnapshot('Breadcrumb');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('Page title');
    expect(wrapper.find('PlanForm').props()).toMatchSnapshot('PlanForm');
    wrapper.unmount();
  });

  it('pass correct data to store: API responds with array', async () => {
    // fetch with a array response
    fetch.mockResponseOnce(JSON.stringify([fixtures.plans[1]]));
    const wrapper = mount(
      <Router history={history}>
        <UpdatePlan {...getProps()} />
      </Router>
    );
    await new Promise(resolve => setImmediate(resolve));
    const FetchPlanSpy = jest.spyOn(wrapper.props().children.props, 'fetchPlan');
    expect(FetchPlanSpy).toHaveBeenCalledWith(fixtures.plans[1]);
    wrapper.unmount();
  });

  it('pass correct data to store: API responds with object', async () => {
    // fetch with an object response
    fetch.mockResponseOnce(JSON.stringify(fixtures.plans[1]));
    const wrapper = mount(
      <Router history={history}>
        <UpdatePlan {...getProps()} />
      </Router>
    );
    await new Promise(resolve => setImmediate(resolve));
    const FetchPlanSpy = jest.spyOn(wrapper.props().children.props, 'fetchPlan');
    expect(FetchPlanSpy).toHaveBeenCalledWith(fixtures.plans[1]);
    wrapper.unmount();
  });
});
