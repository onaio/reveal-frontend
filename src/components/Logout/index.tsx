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
export function logoutFromAuthServer(logoutURL: string) {
  const logoutWindow: Window | null = window.open(logoutURL);
  const timer: NodeJS.Timeout = setInterval(() => {
    if (logoutWindow) {
      logoutWindow.close();
      window.location.href = EXPRESS_OAUTH_LOGOUT_URL;
    }
    clearInterval(timer);
  }, 20);
}

/** Component handles opensrp logout and goes to express serve */
const Logout = (props: LogoutProps) => {
  const { logoutURL } = props;
  logoutFromAuthServer(logoutURL);
  return null;
};

export default Logout;
