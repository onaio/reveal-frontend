import { ActionCreator, AnyAction } from 'redux';
import { USER_HAS_NO_PLAN_ASSIGNMENTS } from '../../configs/lang';
import { OPENSRP_PLANS, OPENSRP_PLANS_BY_USER_FILTER } from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import store from '../../store';
import { AddPlanDefinitionAction } from '../../store/ducks/opensrp/PlanDefinition';
import { fetchPlansByUser, FetchPlansByUserAction } from '../../store/ducks/opensrp/planIdsByUser';
import { FetchPlanRecordsAction, PlanPayload, PlanRecordResponse } from '../../store/ducks/plans';
import { displayError } from '../errors';
import { extractPlanRecordResponseFromPlanPayload } from '../utils';

/** find plans that the given user has access to
 * @param {string} userName - username
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
    .then((response: T[] | null) => {
      if (response === null) {
        return Promise.reject(new Error(USER_HAS_NO_PLAN_ASSIGNMENTS));
      }
      store.dispatch(actionCreator(response, userName));
      if (responseActionCreator) {
        store.dispatch(responseActionCreator(response));
      }
    })
    .catch((err: Error) => {
      displayError(err);
    });
}

/** fetch plans payload from the opensrp api
 * @param {OpenSRPService} service - openSRPService
 * @param {ActionCreator<FetchPlanRecordsAction>} actionCreator - action creator for fetchPlanRecords
 * @param {Dispatch<SetStateAction<boolean>>} - setState function
 */
export const loadOpenSRPPlans = (
  service: typeof OpenSRPService,
  actionCreator: ActionCreator<FetchPlanRecordsAction>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const OpenSrpPlanService = new service(OPENSRP_PLANS);
  OpenSrpPlanService.list()
    .then((plans: PlanPayload[]) => {
      const extractedPlanRecords = plans
        .map(plan => extractPlanRecordResponseFromPlanPayload(plan))
        .filter(plan => !!plan);
      actionCreator(extractedPlanRecords as PlanRecordResponse[]);
      setLoading(false);
    })
    .catch(err => {
      setLoading(false);
      displayError(err);
    });
};

/** fetch single plan payload from the opensrp api
 * @param {string} planId - the plan's id
 * @param {OpenSRPService} service - openSRPService
 * @param {ActionCreator<AddPlanDefinitionAction>} actionCreator - action creator for addPlanDefinition
 */
export async function loadOpenSRPPlan(
  planId: string,
  service: typeof OpenSRPService,
  actionCreator: ActionCreator<AddPlanDefinitionAction>
) {
  const server = new service(OPENSRP_PLANS);
  return server
    .read(planId)
    .then(planFromAPI => {
      const currentPlan = Array.isArray(planFromAPI) ? planFromAPI[0] : planFromAPI;
      actionCreator(currentPlan);
    })
    .catch(err => {
      displayError(err);
    });
}
