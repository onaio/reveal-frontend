import { customFetch } from '@opensrp/server-service';
import {
  BACKEND_ACTIVE,
  DOMAIN_NAME,
  EXPRESS_OAUTH_LOGOUT_URL,
  KEYCLOAK_LOGOUT_URL,
  OPENSRP_LOGOUT_URL,
} from '../../configs/env';
import { displayError } from '../../helpers/errors';
import { getPayloadOptions, OpenSRPService } from '../../services/opensrp';

export const logoutFromAuthServer = () => {
  const payload = getPayloadOptions(new AbortController().signal, 'GET');
  const redirectUri = BACKEND_ACTIVE ? EXPRESS_OAUTH_LOGOUT_URL : DOMAIN_NAME;
  const filterParams = {
    redirect_uri: redirectUri,
  };
  const openSRPLogoutUri = OpenSRPService.getURL(OPENSRP_LOGOUT_URL, {});
  const keycloakLogoutUri = OpenSRPService.getURL(KEYCLOAK_LOGOUT_URL, filterParams);
  customFetch(openSRPLogoutUri, payload)
    .then(() => {
      window.location.href = keycloakLogoutUri;
    })
    .catch(error => {
      displayError(error);
    });
  return null;
};
