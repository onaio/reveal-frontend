import { ConnectedAPICallback, RouteParams } from '@onaio/gatekeeper';
import { getUser } from '@onaio/session-reducer';
import { trimStart } from 'lodash';
import querystring from 'querystring';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import { toast } from 'react-toastify';
import { EXPRESS_OAUTH_GET_STATE_URL } from '../../../configs/env';
import { WELCOME_BACK } from '../../../configs/lang';
import { EXPRESS_LOGIN_URL, HOME_URL, LOGOUT_URL } from '../../../constants';
import { growl } from '../../../helpers/utils';
import store from '../../../store';
import Loading from '../Loading';

/** checks if the value of next in searchParam is blacklisted
 * @param {RouteComponentProps} props - the props should contain the routing state.
 */
export const nextIsValid = (props: RouteComponentProps) => {
  let response = true;
  const indirectionURLs = [LOGOUT_URL];
  /** we should probably sieve some routes from being passed on.
   * For instance we don't need to redirect to logout since we are already in
   * the Unsuccessful Login component, meaning we are already logged out.
   */
  const stringifiedUrls = indirectionURLs.map(url => querystring.stringify({ next: url }));
  for (const url of stringifiedUrls) {
    if (props.location.search.includes(url)) {
      response = false;
      break;
    }
  }
  return response;
};

export const BaseSuccessfulLoginComponent: React.FC<RouteComponentProps> = props => {
  let pathToRedirectTo = HOME_URL;

  if (nextIsValid(props)) {
    const searchString = trimStart(props.location.search, '?');
    const searchParams = querystring.parse(searchString);
    const nextPath = searchParams.next as string | undefined;
    if (nextPath) {
      pathToRedirectTo = nextPath;
    }
    if (nextPath === '/') {
      const user = getUser(store.getState());
      growl(`${WELCOME_BACK}, ${user.username}`, { type: toast.TYPE.INFO });
    }
  }
  return <Redirect to={pathToRedirectTo} />;
};

export const SuccessfulLoginComponent = withRouter(BaseSuccessfulLoginComponent);

const BaseUnsuccessfulLogin: React.FC<RouteComponentProps> = props => {
  let redirectTo = `${EXPRESS_LOGIN_URL}${props.location.search}`;
  if (!nextIsValid(props)) {
    redirectTo = EXPRESS_LOGIN_URL;
  }

  window.location.href = redirectTo;
  return <></>;
};

export const UnSuccessfulLogin = withRouter(BaseUnsuccessfulLogin);

const CustomConnectedAPICallBack: React.FC<RouteComponentProps<RouteParams>> = props => {
  return (
    <ConnectedAPICallback
      LoadingComponent={Loading}
      // tslint:disable-next-line: jsx-no-lambda
      UnSuccessfulLoginComponent={UnSuccessfulLogin}
      SuccessfulLoginComponent={SuccessfulLoginComponent}
      apiURL={EXPRESS_OAUTH_GET_STATE_URL}
      {...props}
    />
  );
};

export default CustomConnectedAPICallBack;
