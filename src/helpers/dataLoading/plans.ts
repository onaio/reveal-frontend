import { toast } from 'react-toastify';
import { ActionCreator, AnyAction } from 'redux';
import { OPENSRP_PLANS_BY_USER_FILTER } from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import store from '../../store';
import { fetchPlansByUser, FetchPlansByUserAction } from '../../store/ducks/opensrp/planIdsByUser';
import { growl } from '../utils';

/** find plans that the given user has access to
 * @param {string} userName - openMRSUserName
 * @param {ActionCreator<FetchPlansByUserAction>} actionCreator - action creator for adding practitioners to store
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {ActionCreator<AnyAction>} responseActionCreator - optionalActionCreator to dispatch the planData in response
 */
export async function loadPlansByUserFilter<T>(
  userName: string,
  actionCreator: ActionCreator<FetchPlansByUserAction> = fetchPlansByUser,
  service: typeof OpenSRPService = OpenSRPService,
  responseActionCreator?: ActionCreator<AnyAction>
) {
  const serve = new service(`${OPENSRP_PLANS_BY_USER_FILTER}/${userName}`);
  serve
    .list()
    .then((response: T[]) => {
      store.dispatch(actionCreator(response, userName));
      if (responseActionCreator) {
        store.dispatch(responseActionCreator(response));
      }
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
}
