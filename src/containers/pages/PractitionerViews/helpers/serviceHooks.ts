import { toast } from 'react-toastify';
import { OPENSRP_PRACTITIONER_ENDPOINT } from '../../../../constants';
import { growl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import { fetchPractitioners, Practitioner } from '../../../../store/ducks/opensrp/practitioners';

/** loads all practitioners returned in within a single request from practitioners endpoint
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 * @param {AbortSignal} signal - used to communicate with/abort a DOM request.
 */
export const loadPractitioners = async (
  service: typeof OpenSRPService = OpenSRPService,
  fetchPractitionersCreator: typeof fetchPractitioners,
  signal: AbortSignal
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT, signal);
  serve
    .list()
    .then((response: Practitioner[]) => store.dispatch(fetchPractitionersCreator(response, true)))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

/** load a single practitioner given his/her id
 * @param {string} practitionerId - id of practitioner
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 * @param {AbortSignal} signal - used to communicate with/abort a DOM request.
 */
export const loadPractitioner = async (
  practitionerId: string,
  service: typeof OpenSRPService = OpenSRPService,
  fetchPractitionersCreator: typeof fetchPractitioners,
  signal: AbortSignal
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT, signal);
  serve
    .read(practitionerId)
    .then((response: Practitioner) => store.dispatch(fetchPractitionersCreator([response])))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};
