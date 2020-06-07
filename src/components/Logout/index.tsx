import { EXPRESS_OAUTH_LOGOUT_URL } from '../../configs/env';

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
  const logoutWindow = window.open(logoutURL);
  /** I am not sure the optimum value for this, mozilla firefox seems to take some
   * time loading up the logoutWindow and actually making the request.
   */
  const RedirectAfter = 1000;
  if (logoutWindow) {
    logoutWindow.opener.focus();
    setTimeout(() => logoutWindow.close(), RedirectAfter);
  }
  /** Redirect to express logout after the logoutWindow has loaded,
   */
  setTimeout(() => {
    window.location.href = EXPRESS_OAUTH_LOGOUT_URL;
  }, RedirectAfter);
};

/** Component handles opensrp logout and goes to express serve */
const Logout = (props: LogoutProps) => {
  const { logoutURL } = props;
  logoutFromAuthServer(logoutURL);
  return null;
};

export default Logout;
