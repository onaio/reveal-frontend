import { authenticateUser } from '@onaio/session-reducer';
import { ConnectedRouter } from 'connected-react-router';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import GoogleAnalytics from 'react-ga';
import { Provider } from 'react-redux';
import App from '../../../../App/App';
import { PLAN_LIST_URL } from '../../../../constants';
import store from '../../../../store';

const history = createBrowserHistory();

describe('components/WithGATracker without GA_CODE', () => {
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

  it('renders components correctly without HOC wrapper', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    );
    expect(wrapper.find('App').length).toEqual(1); // this doesn't specifically test that the HOC isn't there
    expect(wrapper.find('HOC').length).toEqual(0);
    wrapper.unmount();
  });

  it('does not track when navigating to different pages', () => {
    GoogleAnalytics.pageview = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    );
    history.push(PLAN_LIST_URL);

    expect(process.env.REACT_APP_GA_CODE).toBe(''); // this is still picking up local process.env values
    expect(GoogleAnalytics.pageview).toBeCalledTimes(0); // by the time this runs, GA_CODE is already set from local process

    wrapper.unmount();
  });
});
