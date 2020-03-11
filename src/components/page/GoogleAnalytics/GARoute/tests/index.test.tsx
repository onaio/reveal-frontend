import { authenticateUser } from '@onaio/session-reducer';
import GoogleAnalytics from 'react-ga';
import { defaultTrackingOptions, initGoogleAnalytics, TrackingOptions, trackPage } from '..';
import { NEW_IRS_PLAN_URL, PLAN_LIST_URL } from '../../../../../constants';
import store from '../../../../../store';

jest.mock('../../../../../configs/env');

describe('components/GoogleAnalytics/GARoute', () => {
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

  it('GoogleAnalytics.pageview is called with the correct arguments', () => {
    GoogleAnalytics.pageview = jest.fn();
    const trackingOptions: TrackingOptions = { ...defaultTrackingOptions };
    trackPage('/', trackingOptions);
    expect(GoogleAnalytics.pageview).toBeCalledWith('/');
    trackPage(PLAN_LIST_URL, trackingOptions);
    expect(GoogleAnalytics.pageview).toBeCalledWith(PLAN_LIST_URL);
  });

  it('tracks nothing when no GA Code is provided', () => {
    GoogleAnalytics.pageview = jest.fn();
    const options = {
      GA_CODE: '',
    };
    const isGAEnabled: boolean = initGoogleAnalytics(options as TrackingOptions);
    trackPage('/', options);
    trackPage(NEW_IRS_PLAN_URL, options);
    expect(isGAEnabled).toBe(false);
    expect(GoogleAnalytics.pageview).not.toBeCalled();
  });
});
