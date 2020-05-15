import * as sessionDux from '@onaio/session-reducer';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
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

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it('tracks pages correctly', () => {
    GoogleAnalytics.pageview = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
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
          <App />
        </Router>
      </Provider>
    );
    // before resolving get oauth state request, the user is logged out
    expect(wrapper.text()).toMatchInlineSnapshot(`"HomeLoginreveal-frontend: 0.4.2-rc7"`);
    await new Promise<unknown>(resolve => setImmediate(resolve));
    wrapper.update();
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

  it('attempts to logout user', async () => {
    fetch.mockResponse(JSON.stringify(expressAPIResponse));
    delete window.location;
    const hrefMock = jest.fn();
    (window.location as any) = {
      set href(url: string) {
        hrefMock(url);
      },
    };
    const logoutUserMock = jest.spyOn(sessionDux, 'logOutUser');
    const mockLogout = jest.fn(() => null);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App logoutComponent={mockLogout} />
        </Router>
      </Provider>
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    wrapper.update();

    // At this point we have an authenticated user
    let loggedIn = sessionDux.isAuthenticated(store.getState());
    expect(loggedIn).toBeTruthy();

    // simulate logout
    history.push('/logout');
    wrapper.update();

    // we should be on the login page; caveat, in production
    // it is by the express server's redirect action that we find ourselves here
    expect(wrapper.text()).toMatchSnapshot('should be login page');
    const isTheLoginPage = wrapper.text().includes('Login');
    expect(isTheLoginPage).toBeTruthy();

    // the logout user action creator was invoked
    expect(logoutUserMock).toHaveBeenCalledTimes(1);

    // at this point the session reducer has no authenticated details
    loggedIn = sessionDux.isAuthenticated(store.getState());
    expect(loggedIn).toBeFalsy();

    // unfortunately we don't have a definitive way to test that the user session was invalidated;
    // since the functionality that does this is in the express server and is thus out of the
    // react-app's scope.
    // ensure we are calling the logout component which handles opensrp logout and redirects to backend
    expect(mockLogout).toBeCalled();
  });
  it('tracks dimensions correctly', async () => {
    fetch.mockResponse(JSON.stringify(expressAPIResponse));
    GoogleAnalytics.set = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
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
          <App />
        </Router>
      </Provider>
    );
    await new Promise<unknown>(resolve => setImmediate(resolve));
    expect(GoogleAnalytics.set).not.toBeCalled();
    wrapper.unmount();
  });

  it('does not track pages if google analytics code is not set', () => {
    GoogleAnalytics.pageview = jest.fn();
    const envModule = require('../../configs/env');
    envModule.GA_CODE = '';
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );
    expect(GoogleAnalytics.pageview).not.toBeCalled();
    history.push(PLAN_LIST_URL);
    expect(GoogleAnalytics.pageview).not.toBeCalled();
    wrapper.unmount();
  });
});
