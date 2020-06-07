import React from 'react';
import { EXPRESS_OAUTH_LOGOUT_URL } from '../../configs/env';
import store from '../../store';
import { logOutUser } from '@onaio/session-reducer';

/** interface to describe props for Logout component
 * @member {string} logoutURL the url of the logout endpoint of the Oauth server.
 */
export interface LogoutProps {
  logoutURL: string;
}
/**
 * Open another window and navigate to the logout URL.
 * @param {string} logoutURL URL string representing the auth server logout URL endpoint.
 * This function takes the approach of opening a new window and navigating to the logout
 * url of the authentication server in order to go around the browser's CORS policy.
 */
export const logoutFromAuthServer = (logoutURL: string) => {
  window.open(logoutURL);
};

/** Component handles opensrp logout and goes to express serve */
const Logout = (props: LogoutProps) => {
  const { logoutURL } = props;
  // store.dispatch(logOutUser());
  // logoutFromAuthServer(logoutURL);
  // window.focus();
  window.location.href = EXPRESS_OAUTH_LOGOUT_URL;
  return <>This is the Logout page</>;
};

export default Logout;
