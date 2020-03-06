import * as sessionDux from '@onaio/session-reducer';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
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
    expect(wrapper.text()).toMatchInlineSnapshot(`"HomeLogin"`);
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
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
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
    expect(hrefMock).toHaveBeenCalledWith('http://localhost:3000/logout');
  });
});
