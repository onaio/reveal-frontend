import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Router } from 'react-router';
import { PlanDefinitionList } from '../';
import { PLANS } from '../../../../../constants';
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
    const mockList = jest.fn(() => {});
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
    expect(toJson(wrapper.find('HeaderBreadcrumb'))).toMatchSnapshot('Headerbreadcrumb');

    // there is this table that should be within the page
    expect(toJson(wrapper.find('table.plans-list'))).toMatchSnapshot('planlistTable');

    // check that openSRPService is called
    expect(classMock).toHaveBeenCalledWith('/plans');

    // fetchPlans is called with response from service.list
    expect(fetchPlansMock).toBeCalledWith({});

    wrapper.unmount();
  });
});
