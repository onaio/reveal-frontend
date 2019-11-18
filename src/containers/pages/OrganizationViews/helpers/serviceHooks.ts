import {
  OPENSRP_ORG_PRACTITIONER_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import { fetchOrganizations, Organization } from '../../../../store/ducks/opensrp/organizations';
import {
  fetchPractitionerRoles,
  Practitioner,
} from '../../../../store/ducks/opensrp/practitioners';

/** loads the organization data
 * @param {string} organizationId - the organization id
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof fetchOrganizations} fetchOrganizationsCreator - action creator
 */
export const loadOrganization = async (
  organizationId: string,
  service: typeof OpenSRPService,
  fetchOrganizationsCreator: typeof fetchOrganizations
) => {
  const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT);

  serve
    .read(organizationId)
    .then((response: Organization) => {
      store.dispatch(fetchOrganizationsCreator([response]));
    })
    .catch((err: Error) => {
      /** still don't know what we should do with errors */
    });
};

/** loads the practitioners that belong to this organization
 * @param {string} organizationId - the organization id
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof} fetchPractitionerRolesCreator -  action creator
 */
export const loadOrgPractitioners = async (
  organizationId: string,
  service: typeof OpenSRPService,
  fetchPractitionerRolesCreator: typeof fetchPractitionerRoles
) => {
  const serve = new service(OPENSRP_ORG_PRACTITIONER_ENDPOINT);

  serve
    .read(organizationId)
    .then((response: Practitioner[]) =>
      store.dispatch(fetchPractitionerRolesCreator(response, organizationId))
    )
    .catch((err: Error) => {
      /** still don't know what we should do with errors */
    });
};

/** loads the organization data
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof fetchOrganizations} fetchOrganizationsCreator - action creator
 */
export const loadOrganizations = async (
  service: typeof OpenSRPService,
  fetchOrganizationsCreator: typeof fetchOrganizations
) => {
  const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT);
  serve
    .list()
    .then((response: Organization[]) => store.dispatch(fetchOrganizationsCreator(response)))
    .catch((err: Error) => {
      /** TODO - find something to do with error */
    });
};
