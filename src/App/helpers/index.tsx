import { ComponentClass, FunctionComponent } from 'react';
import WithGATracker from '../../components/page/GoogleAnalytics/WithGATracker';
import { GA_ROUTE_COMPONENT } from '../../constants';

/**
 * Return component to be tracked by google analytics
 *
 * @param {ComponentClass | FunctionComponent} ComponentToTrack React component to be tracked
 * @param {string} trackingMethod Tracking approach
 */
export const trackedComponent = (
  ComponentToTrack: ComponentClass | FunctionComponent | ComponentClass<any, any>,
  trackingMethod: string = GA_ROUTE_COMPONENT
) => (trackingMethod === GA_ROUTE_COMPONENT ? ComponentToTrack : WithGATracker(ComponentToTrack));
