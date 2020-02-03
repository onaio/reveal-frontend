import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { UpdatePlan } from '..';
import { PlanDefinition } from '../../../../../configs/settings';
import { PLAN_UPDATE_URL } from '../../../../../constants';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { updatePlanFormProps } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('components/InterventionPlan/UpdatePlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function getProps() {
    const mock: any = jest.fn();
    const serviceMock: any = jest.fn(async () => []);
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
      service: serviceMock,
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
    expect(wrapper.find('PlanForm').props()).toEqual({
      ...updatePlanFormProps,
      formHandler: expect.any(Function),
    });
    wrapper.unmount();
  });
});
