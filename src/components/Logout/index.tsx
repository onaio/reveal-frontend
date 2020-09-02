import { logOutUser } from '@onaio/session-reducer';
import { customFetch } from '@opensrp/server-service';
import { useHistory } from 'react-router-dom';
import { displayError } from '../../helpers/errors';
import { getPayloadOptions, OpenSRPService } from '../../services/opensrp';
import store from '../../store';

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
export const logoutFromAuthServer = (logoutURL: string, history: any) => {
  // const logoutWindow = window.open(logoutURL);
  // if (logoutWindow) {
  //   logoutWindow.opener.focus();
  //   setTimeout(() => logoutWindow.close(), LOGOUT_REDIRECTION_DELAY);
  // }
  // /** Redirect to express logout after allowing for some time for the logoutWindow to load,
  //  * if it doesn't proceed with redirecting to express logout anyway.
  //  */
  // setTimeout(() => {
  //   window.location.href = EXPRESS_OAUTH_LOGOUT_URL;
  // }, LOGOUT_REDIRECTION_DELAY);

  const service = new OpenSRPService(
    'logout.do',
    'https://reveal-stage.smartregister.org/opensrp/'
  );
  const payload = getPayloadOptions(new AbortController().signal, 'GET');
  const url = OpenSRPService.getURL(service.generalURL, {});
  customFetch(url, payload)
    .then(() => {
      // window.location.href = EXPRESS_OAUTH_LOGOUT_URL;
      store.dispatch(logOutUser());
      history.push('/');
    })
    .catch(error => {
      console.log('===>', error);
      displayError(new Error('I cannot let you go'));
    });
};

/** Component handles opensrp logout and goes to express serve */
const Logout = (props: LogoutProps) => {
  const { logoutURL } = props;
  const history = useHistory();
  logoutFromAuthServer(logoutURL, history);
  return null;
};

export default Logout;
