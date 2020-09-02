import { logOutUser } from '@onaio/session-reducer';
import { customFetch } from '@opensrp/server-service';
import { DOMAIN_NAME, KEYCLOAK_LOGOUT_URL, OPENSRP_LOGOUT_URL } from '../../configs/env';
import { displayError } from '../../helpers/errors';
import { getPayloadOptions, OpenSRPService } from '../../services/opensrp';
import store from '../../store';

export const logoutFromAuthServer = () => {
  const payload = getPayloadOptions(new AbortController().signal, 'GET');
  const filterParams = {
    redirect_uri: DOMAIN_NAME,
  };
  const openSRPLogoutUri = OpenSRPService.getURL(OPENSRP_LOGOUT_URL, {});
  const keycloakLogoutUri = OpenSRPService.getURL(KEYCLOAK_LOGOUT_URL, filterParams);
  customFetch(openSRPLogoutUri, payload)
    .then(() => {
      store.dispatch(logOutUser());
      window.location.href = keycloakLogoutUri;
    })
    .catch(error => {
      displayError(error);
    });
  return null;
};
