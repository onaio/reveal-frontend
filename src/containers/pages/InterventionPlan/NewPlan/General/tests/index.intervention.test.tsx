import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { defaultProps as defaultPlanFormProps } from '../../../../../../components/forms/PlanForm';
import store from '../../../../../../store';
import { removePlanDefinitions } from '../../../../../../store/ducks/opensrp/PlanDefinition';
import ConnectedBaseNewPlan from '../index';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

jest.mock('../../../../../../configs/env', () => ({
  ENABLED_FI_REASONS: ['Case Triggered', 'Routine'],
  PLAN_TYPES_ALLOWED_TO_CREATE: ['IRS'],
  PLAN_TYPES_WITH_MULTI_JURISDICTIONS: ['IRS', 'MDA-Point', 'Dynamic-IRS', 'Dynamic-MDA'],
}));

describe('containers/pages/NewPlan: single enabled intervention type', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
    jest.clearAllMocks();
    store.dispatch(removePlanDefinitions());
  });

  it('renders without crashing', () => {
    shallow(<ConnectedBaseNewPlan />);
  });

  it('renders correctly', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedBaseNewPlan />
        </Router>
      </Provider>
    );

    // check that page title is displayed
    expect(wrapper.find('h3.mb-3.page-title').text()).toEqual('Create New Plan');
    // jurisdictionLabel is contry for IRS
    expect(wrapper.find('PlanForm').props()).toEqual({
      ...defaultPlanFormProps,
      addPlan: expect.any(Function),
      allowMoreJurisdictions: true,
      formHandler: expect.any(Function),
    });

    // check that there's a Row that nests a Col that nests a PlanForm
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('Row').find('Col')).toHaveLength(2);
    expect(
      wrapper
        .find('Row')
        .find('Col#planform-col-container')
        .find('PlanForm')
    ).toHaveLength(1);

    // FI intervention type not loaded loaded
    expect(wrapper.find('#fiStatus').length).toBeFalsy();
    expect(wrapper.find('#fiReason').length).toBeFalsy();
  });
});
