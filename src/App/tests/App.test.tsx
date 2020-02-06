import { updateExtraData } from '@onaio/session-reducer';
import { mount } from 'enzyme';
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
});
