import { authenticateUser } from '@onaio/session-reducer';
import { ConnectedRouter } from 'connected-react-router';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import GoogleAnalytics from 'react-ga';
import { Provider } from 'react-redux';
import App from '../../../../App/App';
import { GA_CODE } from '../../../../configs/env';
import { PLAN_LIST_URL } from '../../../../constants';
import store from '../../../../store';

const history = createBrowserHistory();
let localGaCode = '';

describe('components/WithGATracker without GA_CODE', () => {
  beforeAll(() => {
    localGaCode = process.env.REACT_APP_GA_CODE || '';
    process.env.REACT_APP_GA_CODE = '';
  });
  afterAll(() => {
    process.env.REACT_APP_GA_CODE = localGaCode;
    localGaCode = '';
  });

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
    expect(wrapper.find('App').length).toEqual(1);
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

    // even though this env variable is set up correctly for the test,
    // env.ts is picking up the local process.env.REACT_APP_GA_CODE,
    // so by the time WithGACode imports GA_CODE it's already set from local process.env
    expect(process.env.REACT_APP_GA_CODE).toBe('');
    expect(GA_CODE).toBe('');
    expect(GoogleAnalytics.pageview).toBeCalledTimes(0);

    wrapper.unmount();
  });
});
