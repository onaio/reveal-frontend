import { authenticateUser } from '@onaio/session-reducer';
import { ConnectedRouter } from 'connected-react-router';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import GoogleAnalytics from 'react-ga';
import { Provider } from 'react-redux';
import { getGAusername, initGoogleAnalytics, setGAusername, TrackingOptions, trackPage } from '..';
import App from '../../../../App/App';
import { NEW_IRS_PLAN_URL, PLAN_LIST_URL } from '../../../../constants';
import { FlexObject } from '../../../../helpers/utils';
import store from '../../../../store';

jest.mock('../../../../configs/env');

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
    expect(wrapper.find('App').length).toEqual(1);
    expect(wrapper.find('WithGATrackerHOC').length).toEqual(1);
    wrapper.unmount();
  });

  it('GoogleAnalytics.pageview is called with the correct arguments', () => {
    GoogleAnalytics.pageview = jest.fn();
    const trackingOptions: TrackingOptions = { GA_CODE: '12345', GA_ENV: 'test' };
    trackPage('/', trackingOptions);
    expect(GoogleAnalytics.pageview).toBeCalledWith('/');
    trackPage(PLAN_LIST_URL, trackingOptions);
    expect(GoogleAnalytics.pageview).toBeCalledWith(PLAN_LIST_URL);
  });

  it('tracks pageviews when navigating to different pages', () => {
    GoogleAnalytics.pageview = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    );
    expect(GoogleAnalytics.pageview).toBeCalledWith('/');
    history.push(PLAN_LIST_URL);
    expect(GoogleAnalytics.pageview).toBeCalledWith(PLAN_LIST_URL);
    wrapper.unmount();
  });

  it('tracks nothing when no GA Code is provided', () => {
    GoogleAnalytics.pageview = jest.fn();
    const gaOptions: TrackingOptions = initGoogleAnalytics({ GA_CODE: '' }) as TrackingOptions;
    trackPage('/', gaOptions);
    trackPage(NEW_IRS_PLAN_URL, gaOptions);
    expect(GoogleAnalytics.pageview).not.toBeCalled();
  });
});
