import * as sessionDux from '@onaio/session-reducer';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import * as utils from '../../helpers/errors';
import store from '../../store';
import App from '../App';
import { expressAPIResponse } from './fixtures';

jest.mock('../../configs/env');

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
const history = createBrowserHistory();

describe('src/app.logout', () => {
  it('attempts to logout user', async () => {
    fetch.mockResponse(JSON.stringify(expressAPIResponse));
    delete window.location;
    const hrefMock = jest.fn();
    (window.location as any) = {
      set href(url: string) {
        hrefMock(url);
      },
    };

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
    const loggedIn = sessionDux.isAuthenticated(store.getState());
    expect(loggedIn).toBeTruthy();

    // simulate logout
    history.push('/logout');
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(fetch.mock.calls).toEqual([
      ['http://localhost:3000/oauth/state'],
      [
        'https://opensrp/logout',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer hunter2',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ]);

    expect(hrefMock.mock.calls).toEqual([
      ['https://keycloak/logout?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogout'],
    ]);
  });

  it('failed logout', async () => {
    const err = new Error('Could not log out');
    fetch.mockReject(err);

    const errorSpy = jest.spyOn(utils, 'displayError');
    delete window.location;
    const hrefMock = jest.fn();
    (window.location as any) = {
      set href(url: string) {
        hrefMock(url);
      },
    };

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
    const loggedIn = sessionDux.isAuthenticated(store.getState());
    expect(loggedIn).toBeTruthy();

    // simulate logout
    history.push('/logout');
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // expect(fetch.mock.calls).toEqual();

    // keycloack url was not set
    expect(hrefMock).not.toHaveBeenCalled();

    // TODO - determine why this are 3 calls instead of 1
    expect(errorSpy.mock.calls).toEqual([[err], [err], [err]]);

    // current url
    expect(wrapper.find('Router').props().history.location.pathname).toEqual('/');
  });
});
