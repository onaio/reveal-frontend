/* eslint-disable react/prop-types */
import { getUser, User } from '@onaio/session-reducer';
import React, { Component } from 'react';
import GoogleAnalytics from 'react-ga';
import { RouteComponentProps } from 'react-router';
import * as env from '../../../configs/env';
import { ConnectedFlexComponent, FlexComponent } from '../../../configs/types';
import { GA_ENV_TEST } from '../../../constants';
import { RouteParams } from '../../../helpers/utils';
import store from '../../../store';

type Props = RouteComponentProps<RouteParams>;
let username = (getUser(store.getState()) || {}).username || '';

/**
 * Interface defining the options param passed into tracking methods
 */
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
 * helper function to set the Google Analytics dimension for username
 * @param {User} user user object returned from session store
 */
export const setGAusername = (user: User): void => {
  username = user.username || '';
  GoogleAnalytics.set({ username });
};

/**
 * helper function to get the current value for the username GA dimension
 * @returns {string} the username or ''
 */
export const getGAusername = (): string => username;

/**
 * helper function to execute the page view Google Analytics tracking
 * @param {string} page the url string of the page view being tracked
 * @param {Dictionary} options tracking options for the page view
 */
export const trackPage = (
  page: string,
  options: TrackingOptions = defaultTrackingOptions
): void => {
  const { GA_CODE } = options;
  if (GA_CODE && GA_CODE.length) {
    GoogleAnalytics.set({
      page,
      ...options,
    });
    GoogleAnalytics.pageview(page);
  }
};

/**
 * helper function to initialize GoogleAnalytics
 * @param {TrackingOptions} options tracking options for the page view
 * @returns {TrackingOptions}
 */
export const initGoogleAnalytics = (
  options: TrackingOptions = defaultTrackingOptions
): TrackingOptions => {
  const { GA_CODE, GA_ENV } = options;
  if (GA_CODE && GA_CODE.length) {
    GoogleAnalytics.initialize(GA_CODE, {
      testMode: GA_ENV === GA_ENV_TEST,
    });
    GoogleAnalytics.set({
      env: GA_ENV || GA_ENV_TEST,
      username,
    });
  }
  return { ...options };
};

/**
 * Higher Order Component (HOC) which handles Google Analytics page view tracking
 * @param {FlexComponent | ConnectedFlexComponent} WrappedComponent the component to be wrapped by the HOC component
 * @param {TrackingOptions} options tracking options for the page view
 * @returns HOC rendering the WrappedComponent
 */
const WithGATracker = (
  WrappedComponent: FlexComponent | ConnectedFlexComponent,
  options: TrackingOptions = defaultTrackingOptions
) => {
  const { GA_CODE } = options;
  if (!GA_CODE || !GA_CODE.length) {
    return WrappedComponent;
  }

  const WithGATrackerHOC = class extends Component<Props> {
    public componentDidMount() {
      // update the username dimension
      const user: User = getUser(store.getState()) || {};
      if (user.username && getGAusername() !== user.username) {
        setGAusername(user);
      }

      // track the page view
      if (GA_CODE.length) {
        const page = `${this.props.location.pathname}${this.props.location.search}`;
        trackPage(page, options);
      }
    }

    public componentDidUpdate(prevProps: Props) {
      if (GA_CODE.length) {
        const { location } = this.props;
        const currentPage = prevProps.location.pathname + location.search;
        const nextPage = location.pathname + location.search;

        // track the page view here only if component didn't un/remount and the URL has updated
        if (currentPage !== nextPage) {
          trackPage(nextPage, options);
        }
      }
    }

    public render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return WithGATrackerHOC;
};

export default WithGATracker;
