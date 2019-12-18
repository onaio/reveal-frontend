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

const history = createBrowserHistory();

// uncommenting this line fixes the GoogleAnalytics.initialize TypeError
// but breaks the header part of the snapshot (looks like it's not auth'd)
// jest.mock('../../configs/env');

// manually overriding the vars doesn't seem to work (GA_CODE seems undefined, causing a TypeError)
process.env = Object.assign(process.env, {
  GA_CODE: 'UA-0000000-0',
  GA_ENV: 'test',
});

describe('App', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // manually setting process.env doesn't seem to work here either
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

  it('renders App correctly', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
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
