import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import GoogleAnalytics from 'react-ga';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { PLAN_LIST_URL } from '../../constants';
import store from '../../store';
import App from '../App';
import { expressAPIResponse } from './fixtures';

jest.mock('../../configs/env');

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
const history = createBrowserHistory();

describe('App', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Reset history
    history.push('/');
  });

  const LogoutComponent = () => null;

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={LogoutComponent} />
        </Router>
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it('tracks pages correctly', async () => {
    GoogleAnalytics.pageview = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={LogoutComponent} />
        </Router>
      </Provider>
    );
    expect(GoogleAnalytics.pageview).toBeCalledWith('/');
    history.push(PLAN_LIST_URL);
    expect(GoogleAnalytics.pageview).toBeCalledWith(PLAN_LIST_URL);
    wrapper.unmount();
  });

  it('integration: renders App correctly', async () => {
    fetch.mockResponse(JSON.stringify(expressAPIResponse));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={LogoutComponent} />
        </Router>
      </Provider>
    );
    // before resolving get oauth state request, the user is logged out
    expect(wrapper.text()).toMatchInlineSnapshot(
      `"HomePlanManage PlansAssignMonitorFocus InvestigationIRS ReportingIRS Lite ReportingIRS Performance ReportingIRS Mop-up ReportingMDA Point ReportingMDA ReportingAdminTeamsPractitionersClientsLogin v0.4.2"`
    );
    expect(toJson(wrapper.find('footer'))).toMatchSnapshot('footer');
    expect(wrapper.text()).toMatchInlineSnapshot(
      `"HomePlanManage PlansAssignMonitorFocus InvestigationIRS ReportingIRS Lite ReportingIRS Performance ReportingIRS Mop-up ReportingMDA Point ReportingMDA ReportingAdminTeamsPractitionersClientsLogin v0.4.2"`
    );

    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(fetch.mock.calls).toEqual([['http://localhost:3000/oauth/state']]);

    // after resolving get oauth state request superset user is logged in
    expect((wrapper.find('Router').props() as any).history).toMatchObject({
      location: {
        pathname: '/',
      },
    });

    expect(wrapper.text()).toMatchSnapshot('The displayed text');
    const supersetUserIsUser = wrapper.text().includes('superset-user');
    const supersetUserIsLogged = wrapper.text().includes('Sign Out');
    expect(supersetUserIsLogged).toBeTruthy();
    expect(supersetUserIsUser).toBeTruthy();
    wrapper.unmount();
  });

  it('tracks dimensions correctly', async () => {
    fetch.mockResponse(JSON.stringify(expressAPIResponse));
    GoogleAnalytics.set = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={LogoutComponent} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(GoogleAnalytics.set).toBeCalledWith({ env: 'test', username: 'superset-user' });
    wrapper.unmount();
  });

  it('does not track dimensions of google analytics code is not set', async () => {
    fetch.mockResponse(JSON.stringify(expressAPIResponse));
    const envModule = require('../../configs/env');
    envModule.GA_CODE = '';
    GoogleAnalytics.set = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={LogoutComponent} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(GoogleAnalytics.set).not.toBeCalled();
    wrapper.unmount();
  });

  it('does not track pages if google analytics code is not set', async () => {
    GoogleAnalytics.pageview = jest.fn();
    const envModule = require('../../configs/env');
    envModule.GA_CODE = '';
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={LogoutComponent} />
        </Router>
      </Provider>
    );
    expect(GoogleAnalytics.pageview).not.toBeCalled();
    history.push(PLAN_LIST_URL);
    expect(GoogleAnalytics.pageview).not.toBeCalled();
    wrapper.unmount();
  });
});
