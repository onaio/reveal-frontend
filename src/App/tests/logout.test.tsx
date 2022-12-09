import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import * as serverLogout from '@opensrp/server-logout';
import { mount } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { jwtAccessToken } from '../../services/opensrp/tests/fixtures/session';
import store from '../../store';
import App from '../App';

jest.mock('../../configs/env');

const realLocation = window.location;

const history = createBrowserHistory();

describe('src/app.logout', () => {
  beforeAll(() => {
    const { authenticated, user, extraData } = getOpenSRPUserInfo({
      oAuth2Data: {
        access_token: jwtAccessToken,
        state: 'opensrp',
        token_expires_at: '2017-07-13T20:30:59.000Z',
        token_type: 'bearer',
      },
    });

    store.dispatch(authenticateUser(authenticated, user, extraData));
  });

  beforeEach(() => {
    window.location = realLocation;
    // Reset history
    history.push('/');
  });

  it('correctly logs out user', async () => {
    const mock = jest.spyOn(serverLogout, 'logout');
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: `/logout` }]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(mock).toHaveBeenCalled();
  });
});
