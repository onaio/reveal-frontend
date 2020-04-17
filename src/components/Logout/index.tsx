import { EXPRESS_OAUTH_LOGOUT_URL } from '../../configs/env';
/** interface to describe props for Logout component
 * @member {string} logoutURL the url of the logout endpoint of the Oauth server.
 */
export interface LogoutProps {
  logoutURL: string;
}

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

/** Logout component */
const Logout = (props: LogoutProps) => {
  const { logoutURL } = props;
  logoutFromAuthServer(logoutURL);
  return null;
};

export default Logout;
