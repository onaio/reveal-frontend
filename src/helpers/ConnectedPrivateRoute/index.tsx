import { isAuthenticated } from '@onaio/session-reducer';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { Store } from 'redux';
import { LOGIN_URL } from '../../constants';

/** interface for PrivateRoute props */
interface PrivateRouteProps extends RouteProps {
  authenticated: boolean;
  redirectPath: string;
}

/** declare default props for PrivateRoute */
const defaultPrivateRouteProps: Partial<PrivateRouteProps> = {
  authenticated: false,
  redirectPath: LOGIN_URL,
};

/** The PrivateRoute component
 * This component is a simple wrapper around Route and takes all its props in
 * addition to:
 *  1. {bool} authenticated
 *  2. {string} redirectPath
 *
 * If authenticated === true then render the component supplied
 * Otherwise redirect to the redirectPath
 */
const PrivateRoute = (props: PrivateRouteProps) => {
  const { component: Component, authenticated, redirectPath, ...rest } = props;
  return (
    /* tslint:disable jsx-no-lambda */
    <Route
      {...rest}
      render={routeProps =>
        authenticated === true && Component ? (
          <Component {...routeProps} />
        ) : (
          <Redirect to={redirectPath} />
        )
      }
    />
    /* tslint:enable jsx-no-lambda */
  );
};

PrivateRoute.defaultProps = defaultPrivateRouteProps;

export { PrivateRoute }; // export the un-connected component

/** Connect the component to the store */

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: Partial<PrivateRouteProps>) => {
  const result = {
    authenticated: isAuthenticated(state),
  };
  Object.assign(result, ownProps);

  return result;
};

/** create connected component */

/** The ConnectedPrivateRoute component
 * This component is a simple wrapper around Route and takes all its props in
 * addition to:
 *  1. {bool} authenticated - this comes from the Redux store
 *  2. {string} redirectPath
 *
 * If authenticated === true then render the component supplied
 * Otherwise redirect to the redirectPath
 */
const ConnectedPrivateRoute = connect(
  mapStateToProps,
  null
)(PrivateRoute);

export default ConnectedPrivateRoute;
