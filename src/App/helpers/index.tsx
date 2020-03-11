import WithGATracker from '../../components/page/GoogleAnalytics/WithGATracker';
import { GA_ROUTE_COMPONENT } from '../../constants';

/**
 * Return component to be tracked by google analytics
 *
 * @param ComponentToTrack React component to be tracked
 * @param trackingMethod Tracking approach
 */
export const trackedComponent = (
  ComponentToTrack: React.ComponentClass | React.FunctionComponent | React.ComponentClass<any, any>,
  trackingMethod: string = GA_ROUTE_COMPONENT
) => (trackingMethod === GA_ROUTE_COMPONENT ? ComponentToTrack : WithGATracker(ComponentToTrack));
