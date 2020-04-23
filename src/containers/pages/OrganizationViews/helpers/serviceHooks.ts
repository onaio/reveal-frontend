import { PromiseFn } from 'react-async';
import { toast } from 'react-toastify';
import { ActionCreator } from 'redux';
import {
  OPENSRP_ORG_PRACTITIONER_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
} from '../../../../constants';
import { growl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import {
  fetchOrganizations,
  FetchOrganizationsAction,
  Organization,
} from '../../../../store/ducks/opensrp/organizations';
import {
  fetchPractitionerRoles,
  fetchPractitioners,
  Practitioner,
} from '../../../../store/ducks/opensrp/practitioners';
import { defaultAsyncPractitionersOptions } from '../../PractitionerViews/helpers/serviceHooks';

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
 * @param {typeof fetchPractitionerRoles} fetchPractitionerRolesCreator -  action creator
 * @param {typeof fetchPractitioners} fetchPractitionersCreator - action creator
 */
export const loadOrgPractitioners = async (
  organizationId: string,
  service: typeof OpenSRPService,
  fetchPractitionerRolesCreator: typeof fetchPractitionerRoles,
  fetchPractitionersCreator: typeof fetchPractitioners
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

// asyncGetOrganizations is functionally similar to loadOrganizations , the difference in structure
// is to allow for it to be used by react-async hooks. The previous implementation is yet to be
// removed so that the transition process can be in bits.

/** options to pass to asyncGetPractitioners as first argument
 * These options are passed indirectly through the react-async interface
 */
export interface AsyncGetOrganizationsOptions {
  service: typeof OpenSRPService;
  fetchOrganizationsCreator: ActionCreator<FetchOrganizationsAction>;
}

/** default arguments for asyncGetOrganizations first argument */
export const defaultGetOrgsOptions = {
  fetchOrganizationsCreator: fetchOrganizations,
  service: OpenSRPService,
};

/** makes a single get request to OpenSRP organizations endpoint
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 */
export const asyncGetOrganizations: PromiseFn<Organization[]> = async (
  { service, fetchOrganizationsCreator } = defaultAsyncPractitionersOptions,
  { signal } = new AbortController()
) => {
  const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT, signal);
  return serve
    .list()
    .then((response: Organization[]) => {
      store.dispatch(fetchOrganizationsCreator(response, true));
      return response;
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
      return [];
    });
};
