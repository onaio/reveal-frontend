import { getExtraData } from '@onaio/session-reducer';
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
import store from '../../store';
import Ripple from '../page/Loading';

/** HOC function that calls function that logs out the user from both opensrp
 * and keycloak.
 *
 * @returns {Function} returns Ripple component
 */
export const CustomLogout: React.FC = (): JSX.Element => {
  const history = useHistory();

  const { oAuth2Data } = getExtraData(store.getState());
  // eslint-disable-next-line camelcase
  const idTokenHint = oAuth2Data?.id_token;
  const payload = getPayloadOptions(new AbortController().signal, 'GET');
  const redirectUri = BACKEND_ACTIVE ? EXPRESS_OAUTH_LOGOUT_URL : DOMAIN_NAME;
  logout(payload, KEYCLOAK_LOGOUT_URL, redirectUri, OPENSRP_LOGOUT_URL, idTokenHint).catch(
    (error: Error) => {
      displayError(error);
      history.push(HOME_URL);
    }
  );
  return <Ripple />;
};
