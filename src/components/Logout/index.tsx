import { EXPRESS_OAUTH_LOGOUT_URL } from '../../configs/env';

/** interface to describe props for Logout component
 * @member {string} logoutURL the url of the logout endpoint of the Oauth server.
 */
export interface LogoutProps {
  logoutURL: string | null;
}

/** default props for Logout component */
export const defaultLogoutProps: LogoutProps = {
  logoutURL: null,
};

export function logoutFromAuthServer(logoutURL: string) {
  const logoutWindow: Window | null = window.open(logoutURL);
  const timer: NodeJS.Timeout = setInterval(() => {
    if (logoutWindow) {
      logoutWindow.close();
    }
    clearInterval(timer);
  }, 20);
}

/** Logout component */
const Logout = (props: LogoutProps) => {
  if (props.logoutURL) {
    logoutFromAuthServer(props.logoutURL);
  }
  window.location.href = EXPRESS_OAUTH_LOGOUT_URL;
  return null;
};

Logout.defaultProps = defaultLogoutProps;

export default Logout;
