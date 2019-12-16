/* eslint-disable react/prop-types */
import { getUser } from '@onaio/session-reducer';
import React, { Component } from 'react';
import GoogleAnalytics from 'react-ga';
import { RouteComponentProps } from 'react-router';
import { GA_CODE, GA_ENV } from '../../../configs/env';
import { RouteParams } from '../../../helpers/utils';
import store from '../../../store';

type Props = RouteComponentProps<RouteParams>;
let username = (getUser(store.getState()) || {}).username || '';

/**
 * helper function to set the Google Analytics dimension for username
 */
export const setGAusername = (): void => {
  const user = getUser(store.getState()) || {};
  username = user.username || '';
  GoogleAnalytics.set({ username });
};

export const getGAusername = (): string => username;

if (GA_CODE.length) {
  GoogleAnalytics.initialize(GA_CODE, {
    testMode: GA_ENV === 'test',
  });
  GoogleAnalytics.set({
    env: GA_ENV,
    username,
  });
}

const WithGATracker = (WrappedComponent: any, options: any = {}) => {
  const trackPage = (page: string) => {
    GoogleAnalytics.set({
      page,
      ...options,
    });
    GoogleAnalytics.pageview(page);
  };

  // eslint-disable-next-line
  const HOC = class extends Component<Props> {
    public componentDidMount() {
      const user = getUser(store.getState()) || {};
      if (getGAusername() !== user.username) {
        setGAusername();
      }

      if (GA_CODE.length) {
        // eslint-disable-next-line
        const page = this.props.location.pathname + this.props.location.search;
        trackPage(page);
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
