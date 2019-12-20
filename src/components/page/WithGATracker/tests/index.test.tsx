import ConnectedPrivateRoute from '@onaio/connected-private-route';
import { authenticateUser } from '@onaio/session-reducer';
import { ConnectedRouter } from 'connected-react-router';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import GoogleAnalytics from 'react-ga';
import { Provider } from 'react-redux';
import WithGATracker, { getGAusername, setGAusername } from '..';
import * as lib from '..';
import App from '../../../../App/App';
import { DISABLE_LOGIN_PROTECTION } from '../../../../configs/env';
import { PLAN_LIST_URL } from '../../../../constants';
import Home from '../../../../containers/pages/Home/Home';
import store from '../../../../store';

const history = createBrowserHistory();

describe('components/WithGATracker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(
      authenticateUser(
        true,
        {
          email: 'test@mail',
          gravatar: 'g',
          name: 'name',
          username: 'name',
        },
        {
          oAuth2Data: {
            access_token: 'hunter1',
            expires_in: '3413',
            state: 'opensrp',
            token_type: 'bearer',
          },
          preferredName: 'Superset User',
          roles: ['Provider'],
          userName: 'superset-user',
        }
      )
    );
  });

  it('gets and sets the username dimension', () => {
    expect(getGAusername()).toBe('');
    setGAusername({ username: 'Conor' });
    expect(getGAusername()).toBe('Conor');
  });

  it('renders components correctly when wrapped with HOC', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('GoogleAnalytics.pageview is called with the correct arguments', () => {
    GoogleAnalytics.pageview = jest.fn();
    trackPage('/');
    expect(GoogleAnalytics.pageview).toBeCalledWith('/');
    trackPage(PLAN_LIST_URL);
    expect(GoogleAnalytics.pageview).toBeCalledWith(PLAN_LIST_URL);
  });

  it('tracks pageviews when navigating to different pages', () => {
    GoogleAnalytics.pageview = jest.fn();
    mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    );

    expect(GoogleAnalytics.pageview).toBeCalledWith('/');

    history.push(PLAN_LIST_URL);

    expect(GoogleAnalytics.pageview).toBeCalledWith(PLAN_LIST_URL);

    // this could pass if we wrap the logout route's component with our withGATracker HOC
    // history.push('/logout')
    // expect(GoogleAnalytics.pageview).toBeCalledWith('/logout');
  });
});
