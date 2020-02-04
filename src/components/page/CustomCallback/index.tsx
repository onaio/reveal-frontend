import { ConnectedAPICallback, RouteParams } from '@onaio/gatekeeper';
import { trimStart } from 'lodash';
import querystring from 'querystring';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import { OAUTH_GET_STATE_URL } from '../../../configs/env';
import { HOME_URL, LOGIN_URL } from '../../../constants';
import Loading from '../Loading';

export const BaseSuccessfulLoginComponent: React.FC<RouteComponentProps> = props => {
  let pathToRedirectTo = HOME_URL;
  const searchString = trimStart(props.location.search, '?');
  const searchParams = querystring.parse(searchString);
  const nextPath = searchParams.next as string | undefined;
  if (nextPath) {
    pathToRedirectTo = nextPath;
  }
  return <Redirect to={pathToRedirectTo} />;
};

export const SuccessfulLoginComponent = withRouter(BaseSuccessfulLoginComponent);

const CustomConnectedAPICallBack: React.FC<RouteComponentProps<RouteParams>> = props => {
  return (
    <ConnectedAPICallback
      LoadingComponent={Loading}
      // tslint:disable-next-line: jsx-no-lambda
      UnSuccessfulLoginComponent={() => {
        return <Redirect to={LOGIN_URL} />;
      }}
      SuccessfulLoginComponent={SuccessfulLoginComponent}
      apiURL={OAUTH_GET_STATE_URL}
      {...props}
    />
  );
};

export default CustomConnectedAPICallBack;
