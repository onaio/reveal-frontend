/* eslint-disable react/prop-types */
import { getUser } from '@onaio/session-reducer';
import React, { Component } from 'react';
import GoogleAnalytics from 'react-ga';
import { RouteComponentProps } from 'react-router';
import { GA_CODE, GA_ENV } from '../../../configs/env';
import { FlexObject, RouteParams } from '../../../helpers/utils';
import store from '../../../store';

type Props = RouteComponentProps<RouteParams>;
const username = (getUser(store.getState()) || {}).username || '';

/**
 * helper function to set the Google Analytics dimension for username
 */
export const setGAusername = (user: FlexObject): void => {
  GoogleAnalytics.set({ username: user.username || '' });
};

export const getGAusername = (): string => username;

const trackPage = (page: string, options: FlexObject = {}) => {
  GoogleAnalytics.set({
    page,
    ...options,
  });
  GoogleAnalytics.pageview(page);
};

if (GA_CODE.length) {
  GoogleAnalytics.initialize(GA_CODE, {
    testMode: GA_ENV === 'test',
  });
  GoogleAnalytics.set({
    env: GA_ENV,
    username,
  });
}

const WithGATracker = (WrappedComponent: any, options: FlexObject = {}) => {
  const HOC = class extends Component<Props> {
    public componentDidMount() {
      const user = (getUser(store.getState()) || {}) as FlexObject;
      if (user.username && getGAusername() !== user.username) {
        setGAusername(user);
      }

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

        if (currentPage !== nextPage) {
          trackPage(nextPage);
        }
      }
    }

    public render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC;
};

export default WithGATracker;
