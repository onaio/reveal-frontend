import { useEffect } from 'react';
import { OPENSRP_PRACTITIONER_ENDPOINT } from '../../../constants';
import { OpenSRPService } from '../../../services/opensrp';
import store from '../../../store';
import { fetchPractitioners, Practitioner } from '../../../store/ducks/opensrp/practitioners';

/** loads all practitioners returned in within a single request from practitioners endpoint
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 */
export const loadPractitioners = async (
  fetchPractitionersCreator: any,
  service: typeof OpenSRPService = OpenSRPService
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT);
  serve
    .list()
    .then((response: Practitioner[]) => store.dispatch(fetchPractitionersCreator(response)))
    .catch((err: Error) => {
      /** TODO - find something to do with error */
    });
};

/** custom hook that initiates call to practitioners endpoint and dispatches the response to store
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 * @param {typeof OpenSRPService} serviceClass -  the openSRP Service
 */
export function usePractitioners(
  fetchPractitionersActionCreator: typeof fetchPractitioners,
  serviceClass: typeof OpenSRPService
) {
  useEffect(() => {
    loadPractitioners(fetchPractitionersActionCreator, serviceClass);
  }, []);
}
