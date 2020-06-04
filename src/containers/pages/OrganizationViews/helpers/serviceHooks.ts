import { toast } from 'react-toastify';
import {
  OPENSRP_ORG_PRACTITIONER_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
} from '../../../../constants';
import { growl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import { fetchOrganizations, Organization } from '../../../../store/ducks/opensrp/organizations';
import { fetchPractitioners, Practitioner } from '../../../../store/ducks/opensrp/practitioners';

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
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

/** loads the practitioners that belong to this organization
 * @param {string} organizationId - the organization id
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof fetchPractitioners} fetchPractitionersCreator - action creator
 */
export const loadOrgPractitioners = async (
  organizationId: string,
  service: typeof OpenSRPService,
  fetchPractitionersCreator: typeof fetchPractitioners
) => {
  const serve = new service(OPENSRP_ORG_PRACTITIONER_ENDPOINT);

  serve
    .read(organizationId)
    .then((response: Practitioner[]) => {
      store.dispatch(fetchPractitionersCreator(response, false, organizationId));
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
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
    .then((response: Organization[]) => store.dispatch(fetchOrganizationsCreator(response, true)))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};
