import { getUser } from '@onaio/session-reducer';
import React from 'react';
import GoogleAnalytics from 'react-ga';
import { RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';
import * as env from '../../../../configs/env';
import { GA_ENV_TEST } from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import store from '../../../../store';

type Props = RouteComponentProps<RouteParams>;
const username = (getUser(store.getState()) || {}).username || '';

export interface TrackingOptions {
  GA_CODE: string;
  GA_ENV?: string;
}

/**
 * Default tracking options using global envs
 */
export const defaultTrackingOptions: TrackingOptions = {
  GA_CODE: env.GA_CODE || '',
  GA_ENV: env.GA_ENV || GA_ENV_TEST,
};

/**
 * helper function to execute the page view Google Analytics tracking
 * @param {string} page the url string of the page view being tracked
 * @param {FlexObject} options tracking options for the page view
 */
export const trackPage = (
  page: string,
  options: TrackingOptions = defaultTrackingOptions
): void => {
  const { GA_CODE } = options;
  const isGAEnabled = !!(GA_CODE && GA_CODE.length);

  if (isGAEnabled) {
    GoogleAnalytics.set({
      page,
      ...options,
    });
    GoogleAnalytics.pageview(page);
  }
};

/** Interface for GARoute */
export interface GARouteProps extends Props {
  options: TrackingOptions;
}

/** Google analytics tracking with route component */
const GARoute = (props: GARouteProps) => {
  React.useEffect(() => {
    const page = props.location.pathname + props.location.search;
    trackPage(page, props.options);
  }, [props.location.pathname, props.location.search]);

  return null;
};

export const RouteTracker = () => <Route component={GARoute} />;

/**
 * helper function to initialize GoogleAnalytics
 * @param {TrackingOptions} options tracking options for the page view
 * @returns {boolean}
 */
export const initGoogleAnalytics = (options: TrackingOptions = defaultTrackingOptions): boolean => {
  const { GA_CODE, GA_ENV } = options;
  const isGAEnabled = !!(GA_CODE && GA_CODE.length);

  if (isGAEnabled) {
    GoogleAnalytics.initialize(GA_CODE, {
      testMode: GA_ENV === GA_ENV_TEST,
    });
    GoogleAnalytics.set({
      env: GA_ENV || GA_ENV_TEST,
      username,
    });
  }
  return isGAEnabled;
};

export default { GARoute, initGoogleAnalytics, RouteTracker };
