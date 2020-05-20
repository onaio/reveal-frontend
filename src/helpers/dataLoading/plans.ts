import { toast } from 'react-toastify';
import { ActionCreator, AnyAction } from 'redux';
import { OPENSRP_PLANS_BY_USER_FILTER } from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import store from '../../store';
import { growl } from '../utils';

/** find plans that the given OpenMRS userName has access to
 * @param {string} userName - openMRSUserName
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 */
export async function loadPlansByUserFilter<T>(
  userName: string,
  plansActionCreator: ActionCreator<AnyAction>,
  service: typeof OpenSRPService = OpenSRPService
) {
  const serve = new service(`${OPENSRP_PLANS_BY_USER_FILTER}/${userName}`);
  serve
    .list()
    .then((response: T[]) => store.dispatch(plansActionCreator(response, userName)))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
}
