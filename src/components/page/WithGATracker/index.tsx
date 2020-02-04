/* eslint-disable react/prop-types */
import { getUser } from '@onaio/session-reducer';
import React, { Component } from 'react';
import GoogleAnalytics from 'react-ga';
import { RouteComponentProps } from 'react-router';
import { GA_CODE, GA_ENV } from '../../../configs/env';
import { FlexObject, RouteParams } from '../../../helpers/utils';
import store from '../../../store';

type Props = RouteComponentProps<RouteParams>;
let username = (getUser(store.getState()) || {}).username || '';

/**
 * helper function to get the Google Analytics tracking code
 * @param options tracking options for the page view
 */
export const getGaCode = (options: FlexObject = {}) => (options && options.GA_CODE) || GA_CODE;

/**
 * helper function to set the Google Analytics dimension for username
 * @param {FlexObject} user user object returned from session store
 */
export const setGAusername = (user: FlexObject): void => {
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
 * @param {FlexObject} options tracking options for the page view
 */
export const trackPage = (page: string, options: FlexObject = {}): void => {
  GoogleAnalytics.set({
    page,
    ...options,
  });
  GoogleAnalytics.pageview(page);
};

/**
 * helper function to initialize GoogleAnalytics
 * @param {FlexObject} options tracking options for the page view
 */
export const initGoogleAnalytics = (options: FlexObject = {}) => {
  const gaCode = getGaCode(options);
  if (gaCode && gaCode.length) {
    GoogleAnalytics.initialize(GA_CODE, {
      testMode: GA_ENV === 'test',
    });
    GoogleAnalytics.set({
      env: GA_ENV,
      username,
    });
  }
};

/**
 * Higher Order Component (HOC) which handles Google Analytics page view tracking
 * @param {any} WrappedComponent the component to be wrapped by the HOC component
 * @param {FlexObject} options tracking options for the page view
 * @returns HOC rendering the WrappedComponent
 */
const WithGATracker = (WrappedComponent: any, options: FlexObject = {}) => {
  const gaCode = getGaCode(options);
  if (!gaCode || !gaCode.length) {
    return WrappedComponent;
  }

  const WithGATrackerHOC = class extends Component<Props> {
    public componentDidMount() {
      // update the username dimension
      const user = (getUser(store.getState()) || {}) as FlexObject;
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
          trackPage(nextPage);
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
