import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { REACT_LOGIN_URL } from '../../constants';
import store from '../../store';
import App from '../App';

jest.mock('../../configs/env', () => ({
  BACKEND_ACTIVE: false,
  DISPLAYED_PLAN_TYPES: ['FI', 'IRS', 'IRS-Lite', 'MDA', 'MDA-Point'],
  ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS: 'COVERAGE,POPULATION,RISK,STRUCTURE,TARGET,OTHER_POPULATION'.split(
    ','
  ),
  HIDDEN_PLAN_STATUSES: ['retired'],
  SUPERSET_DYNAMIC_MDA_REPORTING_JURISDICTIONS_DATA_SLICES: '1338',
  SUPERSET_IRS_LITE_REPORTING_JURISDICTIONS_DATA_SLICES: '11, 12',
  SUPERSET_IRS_MOPUP_REPORTING_JURISDICTIONS_DATA_SLICES: '0',
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES: '11, 12',
  SUPERSET_MDA_LITE_REPORTING_JURISDICTIONS_DATA_SLICES: '1',
  SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES: '12',
  SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES: '1',
}));

const history = createBrowserHistory();

describe('App no backend', () => {
  it('integration: renders App correctly', async () => {
    const LogoutComponent = () => null;

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={LogoutComponent} />
        </Router>
      </Provider>
    );

    // user redirected to login
    expect(wrapper.text()).toMatchInlineSnapshot(
      `"HomePlanManage PlansLoginPlease log in with one of the following providers"`
    );
    expect((wrapper.find('Router').props() as any).history).toMatchObject({
      location: {
        pathname: REACT_LOGIN_URL,
      },
    });
  });
});
