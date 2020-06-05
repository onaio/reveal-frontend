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
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES: '11, 12',
  SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES: '12',
}));

const history = createBrowserHistory();

describe('App no backend', () => {
  it('integration: renders App correctly', async () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    // user redirected to login
    expect(wrapper.text()).toMatchInlineSnapshot(
      `"HomeLoginPlease log in with one of the following providers: "`
    );
    expect((wrapper.find('Router').props() as any).history).toMatchObject({
      location: {
        pathname: REACT_LOGIN_URL,
      },
    });
  });
});
