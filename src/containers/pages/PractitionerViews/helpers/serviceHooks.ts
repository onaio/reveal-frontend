import { PromiseFn } from 'react-async';
import { toast } from 'react-toastify';
import { ActionCreator } from 'redux';
import { OPENSRP_PRACTITIONER_ENDPOINT } from '../../../../constants';
import { growl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import {
  fetchPractitioners,
  FetchPractitionersAction,
  Practitioner,
} from '../../../../store/ducks/opensrp/practitioners';

/** loads all practitioners returned in within a single request from practitioners endpoint
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 */
export const loadPractitioners = async (
  service: typeof OpenSRPService = OpenSRPService,
  fetchPractitionersCreator: typeof fetchPractitioners
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT);
  serve
    .list()
    .then((response: Practitioner[]) => store.dispatch(fetchPractitionersCreator(response, true)))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

// asyncGetPractitioners is functionally similar to loadPractitioners , the difference in structure
// is to allow for it to be used by react-async hooks. The previous implementation is yet to be
// removed to allow for the transition process to be in bits.

/** options to pass to asyncGetPractitioners as first argument
 * These options are passed indirectly through the react-async interface
 */
export interface AsyncGetPractitionersOptions {
  service: typeof OpenSRPService;
  fetchPractitionersCreator: ActionCreator<FetchPractitionersAction>;
}

/** loads all practitioners returned in within a single request from practitioners endpoint
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 */
export const asyncGetPractitioners: PromiseFn<Practitioner[]> = async (
  { service, fetchPractitionersCreator },
  { signal } = new AbortController()
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT, signal);
  return serve
    .list()
    .then((response: Practitioner[]) => {
      store.dispatch(fetchPractitionersCreator(response, true));
      return response;
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
      return [];
    });
};

/** load a single practitioner given his/her id
 * @param {string} practitionerId - id of practitioner
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 */
export const loadPractitioner = async (
  practitionerId: string,
  service: typeof OpenSRPService = OpenSRPService,
  fetchPractitionersCreator: typeof fetchPractitioners
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT);
  serve
    .read(practitionerId)
    .then((response: Practitioner) => store.dispatch(fetchPractitionersCreator([response])))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};
