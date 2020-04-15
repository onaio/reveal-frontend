import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { IRSPlansList } from '../';
import { IRSPlan } from '../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

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
    fetch.mockResponseOnce(JSON.stringify({}));
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

  it('handles search correctly', async () => {
    const props = {
      fetchPlans: jest.fn(),
      plans: fixtures.plans as IRSPlan[],
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSPlansList {...props} />
      </Router>
    );
    wrapper
      .find('Input')
      .at(0)
      .simulate('change', { target: { value: 'Berg' } });
    // Wait for debounce
    await new Promise(r => setTimeout(r, 1500));
    wrapper.mount();
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('Berg Namibia 2019');
  });

  it('handles a case insensitive search', async () => {
    const props = {
      fetchPlans: jest.fn(),
      plans: fixtures.plans as IRSPlan[],
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSPlansList {...props} />
      </Router>
    );
    wrapper
      .find('Input')
      .at(0)
      .simulate('change', { target: { value: 'BERG' } });
    // Wait for debounce
    await new Promise(r => setTimeout(r, 1500));
    wrapper.mount();
    expect(
      wrapper
        .find('tbody tr td')
        .find('Link')
        .at(0)
        .text()
    ).toEqual('Berg Namibia 2019');
  });

  it('renders empty table if no search matches', async () => {
    const props = {
      fetchPlans: jest.fn(),
      plans: fixtures.plans as IRSPlan[],
      service: jest.fn().mockImplementationOnce(() => Promise.resolve([])),
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSPlansList {...props} />
      </Router>
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
