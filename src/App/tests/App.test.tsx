import { updateExtraData } from '@onaio/session-reducer';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { OPENSRP_LOGOUT_URL } from '../../configs/env';
import store from '../../store';
import App from '../App';
import { expressAPIResponse } from './fixtures';

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

  it('renders App correctly', async () => {
    fetch.mockResponse(JSON.stringify(expressAPIResponse));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();
    expect(fetch.mock.calls).toEqual([['http://localhost:3000/oauth/state']]);

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

  it('logout url is set correctly Oath provider is opensrp', () => {
    window.open = jest.fn();
    store.dispatch(
      updateExtraData({
        oAuth2Data: {
          access_token: 'ec16dd21-b4f3-4ac1-8ede-e7c6f5d68c9e',
          expires_in: '3599',
          state: 'opensrp',
          token_type: 'bearer',
        },
        preferredName: 'Superset User',
        roles: ['Provider'],
        userName: 'superset-user',
      })
    );

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    history.push('/logout');
    expect(window.open).toBeCalledWith(OPENSRP_LOGOUT_URL);
  });

  it('logout url is set correctly when oath provider is not opensrp', () => {
    window.open = jest.fn();
    mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );

    history.push('/logout');
    expect(window.open).not.toBeCalled();
  });
});
