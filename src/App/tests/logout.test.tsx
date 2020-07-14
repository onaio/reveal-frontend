import * as sessionDux from '@onaio/session-reducer';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
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
    const loggedIn = sessionDux.isAuthenticated(store.getState());
    expect(loggedIn).toBeTruthy();

    // simulate logout
    history.push('/logout');
    wrapper.update();

    // unfortunately we don't have a definitive way to test that the user session was invalidated;
    // since the functionality that does this is in the express server and is thus out of the
    // react-app's scope.
    // ensure we are calling the logout component which handles opensrp logout and redirects to backend
    // PS: only after redirecting to the express server and back is the user unauthenticated.
    expect(mockLogout).toBeCalled();
  });
});
