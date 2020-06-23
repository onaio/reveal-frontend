import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import NewDraftPlan from '../index';
import { planFormProps } from './fixtures';

const history = createBrowserHistory();

describe('containers/pages/NewIRSPlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<NewDraftPlan />);
  });

  it('renders correctly', () => {
    const wrapper = mount(
      <Router history={history}>
        <NewDraftPlan />
      </Router>
    );

    // check that page title is displayed
    expect(toJson(wrapper.find('h3.mb-3.page-title'))).toMatchSnapshot('page title');

    // check that PlanForm receives the correct props
    expect(wrapper.find('PlanForm').props()).toEqual({
      ...planFormProps,
      formHandler: expect.any(Function),
    });
    // check that there's a Row that nests a Col that nests a PlanForm
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('Row').find('Col')).toHaveLength(1);
    expect(
      wrapper
        .find('Row')
        .find('Col')
        .find('PlanForm')
    ).toHaveLength(1);

    wrapper.unmount();
  });
});
