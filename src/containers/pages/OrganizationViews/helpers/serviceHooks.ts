import { toast } from 'react-toastify';
import {
  OPENSRP_ORG_PRACTITIONER_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
} from '../../../../constants';
import { growl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import { fetchOrganizations, Organization } from '../../../../store/ducks/opensrp/organizations';
import {
  fetchPractitionerRoles,
  fetchPractitioners,
  Practitioner,
} from '../../../../store/ducks/opensrp/practitioners';

/** loads the organization data
 * @param {string} organizationId - the organization id
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof fetchOrganizations} fetchOrganizationsCreator - action creator
 * @param {AbortSignal} signal - used to communicate with/abort a DOM request.
 */
export const loadOrganization = async (
  organizationId: string,
  service: typeof OpenSRPService,
  fetchOrganizationsCreator: typeof fetchOrganizations,
  signal: AbortSignal
) => {
  const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT, signal);

  serve
    .read(organizationId)
    .then((response: Organization) => {
      store.dispatch(fetchOrganizationsCreator([response]));
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

/** loads the practitioners that belong to this organization
 * @param {string} organizationId - the organization id
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof fetchPractitionerRoles} fetchPractitionerRolesCreator -  action creator
 * @param {typeof fetchPractitioners} fetchPractitionersCreator - action creator
 * @param {AbortSignal} signal - used to communicate with/abort a DOM request.
 */
export const loadOrgPractitioners = async (
  organizationId: string,
  service: typeof OpenSRPService,
  fetchPractitionerRolesCreator: typeof fetchPractitionerRoles,
  fetchPractitionersCreator: typeof fetchPractitioners,
  signal: AbortSignal
) => {
  const serve = new service(OPENSRP_ORG_PRACTITIONER_ENDPOINT);

  serve
    .read(organizationId)
    .then((response: Practitioner[]) => {
      store.dispatch(fetchPractitionerRolesCreator(response, organizationId));
      store.dispatch(fetchPractitionersCreator(response));
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

/** loads the organization data
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof fetchOrganizations} fetchOrganizationsCreator - action creator,
 * @param {AbortSignal} signal - used to communicate with/abort a DOM request.
 */
export const loadOrganizations = async (
  service: typeof OpenSRPService,
  fetchOrganizationsCreator: typeof fetchOrganizations,
  signal: AbortSignal
) => {
  const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT);
  serve
    .list()
    .then((response: Organization[]) => store.dispatch(fetchOrganizationsCreator(response, true)))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};
