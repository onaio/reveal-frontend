import { renderTable } from '@onaio/drill-down-table';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { IRSAssignmentPlansList } from '../';
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
      plans: [],
    };
    shallow(
      <Router history={history}>
        <IRSAssignmentPlansList {...props} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const plans = fixtures.planRecords;
    const props = {
      plans,
    };
    const wrapper = mount(
      <Router history={history}>
        <IRSAssignmentPlansList {...props} />
      </Router>
    );
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    renderTable(wrapper);
    wrapper.unmount();
  });
});
