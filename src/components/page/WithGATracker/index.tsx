/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import GoogleAnalytics from 'react-ga';
import { RouteComponentProps } from 'react-router';
import { GA_CODE, GA_ENV } from '../../../configs/env';
import { RouteParams } from '../../../helpers/utils';

type Props = RouteComponentProps<RouteParams>;

if (GA_CODE.length) {
  GoogleAnalytics.initialize(GA_CODE);
  GoogleAnalytics.set({
    env: GA_ENV,
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
