import { logout } from '@opensrp/server-logout';
import React from 'react';
import { useHistory } from 'react-router';
import {
  BACKEND_ACTIVE,
  DOMAIN_NAME,
  EXPRESS_OAUTH_LOGOUT_URL,
  KEYCLOAK_LOGOUT_URL,
  OPENSRP_LOGOUT_URL,
} from '../../configs/env';
import { HOME_URL } from '../../constants';
import { displayError } from '../../helpers/errors';
import { getPayloadOptions } from '../../services/opensrp';
import Ripple from '../page/Loading';

/** HOC function that calls function that logs out the user from both opensrp
 * and keycloak
 */
export const CustomLogout = () => {
  const history = useHistory();
  const payload = getPayloadOptions(new AbortController().signal, 'GET');
  const redirectUri = BACKEND_ACTIVE ? EXPRESS_OAUTH_LOGOUT_URL : DOMAIN_NAME;
  logout(payload, OPENSRP_LOGOUT_URL, KEYCLOAK_LOGOUT_URL, redirectUri).catch(error => {
    displayError(error);
    history.push(HOME_URL);
  });
  return <Ripple />;
};
