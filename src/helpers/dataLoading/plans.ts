import { SupersetAdhocFilterOption } from '@onaio/superset-connector';
import { ActionCreator, AnyAction } from 'redux';
import { isPlanTypeEnabled } from '../../components/forms/PlanForm/helpers';
import { OPENSRP_MAX_PLANS_PER_REQUEST } from '../../configs/env';
import { USER_HAS_NO_PLAN_ASSIGNMENTS } from '../../configs/lang';
import { PlanDefinition } from '../../configs/settings';
import {
  OPENSRP_GET_PLANS_COUNT,
  OPENSRP_PLANS,
  OPENSRP_PLANS_BY_USER_FILTER,
  PLAN_INTERVENTION_TYPE,
} from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import store from '../../store';
import { AddPlanDefinitionAction } from '../../store/ducks/opensrp/PlanDefinition';
import { fetchPlansByUser, FetchPlansByUserAction } from '../../store/ducks/opensrp/planIdsByUser';
import {
  FetchPlanRecordsAction,
  InterventionType,
  PlanPayload,
  PlanRecordResponse,
} from '../../store/ducks/plans';
import { displayError } from '../errors';
import { extractPlanRecordResponseFromPlanPayload, PLANS_SERVICE_FILTER_PARAM } from '../utils';

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
  responseActionCreator?: ActionCreator<AnyAction>,
  extractPlans?: boolean
) {
  const serve = new service(`${OPENSRP_PLANS_BY_USER_FILTER}/${userName}`);
  return serve
    .list()
    .then((response: T[] | PlanPayload[] | null) => {
      if (response === null) {
        return Promise.reject(new Error(USER_HAS_NO_PLAN_ASSIGNMENTS));
      }
      store.dispatch(actionCreator(response, userName));
      if (responseActionCreator) {
        if (extractPlans) {
          const extractedPlanRecords = (response as PlanPayload[])
            .map(plan => extractPlanRecordResponseFromPlanPayload(plan))
            .filter(plan => !!plan);
          store.dispatch(responseActionCreator(extractedPlanRecords));
        } else {
          store.dispatch(responseActionCreator(response));
        }
      }
    })
    .catch((err: Error) => {
      displayError(err);
    });
}

/**
 * fetch total number of all plans
 * @param {OpenSRPService} service - openSRPService
 */
export const fetchPlansCount = async (service: typeof OpenSRPService) => {
  const serve = new service(OPENSRP_GET_PLANS_COUNT);
  const response = await serve.list(PLANS_SERVICE_FILTER_PARAM).catch(err => {
    displayError(err);
  });
  return response;
};

/** fetch plans payload from the opensrp api
 * @param {OpenSRPService} service - openSRPService
 * @param {ActionCreator<FetchPlanRecordsAction>} actionCreator - action creator for fetchPlanRecords
 * @param {Dispatch<SetStateAction<boolean>>} - setState function
 */
export const loadOpenSRPPlans = async (
  service: typeof OpenSRPService,
  actionCreator: ActionCreator<FetchPlanRecordsAction>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const plansCount = await fetchPlansCount(service);
  if (typeof plansCount !== 'undefined') {
    const pages = Math.ceil(plansCount.count / OPENSRP_MAX_PLANS_PER_REQUEST);
    const serve = new service(OPENSRP_PLANS);
    const planPromises = [];

    let currentPageNumber = 1;
    while (currentPageNumber <= pages) {
      planPromises.push(
        serve.list({ pageNumber: currentPageNumber, pageSize: OPENSRP_MAX_PLANS_PER_REQUEST })
      );
      currentPageNumber += 1;
    }

    Promise.allSettled(planPromises).then(results => {
      let allPlans: PlanDefinition[] = [];
      // tslint:disable-next-line: no-floating-promises
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const plans: PlanDefinition[] = result.value;
          allPlans = [...allPlans, ...plans];
        } else {
          displayError(new Error(result.reason));
        }
      });
      if (allPlans.length > 0) {
        const extractedPlanRecords = allPlans
          .map(plan => extractPlanRecordResponseFromPlanPayload(plan))
          .filter(plan => !!plan);
        actionCreator(extractedPlanRecords as PlanRecordResponse[]);
      }
      setLoading(false);
    });
  } else {
    setLoading(false);
  }
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

/** Added to superset requests to specify only FI and Dynamic-Fi plans are required. */
export const supersetFIPlansParamFilters = [
  {
    comparator: [
      ...(isPlanTypeEnabled(InterventionType.FI) ? [InterventionType.FI] : []),
      ...(isPlanTypeEnabled(InterventionType.DynamicFI) ? [InterventionType.DynamicFI] : []),
    ],
    operator: 'in',
    subject: PLAN_INTERVENTION_TYPE,
  },
] as SupersetAdhocFilterOption[];
