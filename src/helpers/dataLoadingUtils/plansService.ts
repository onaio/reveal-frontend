import { PromiseFn } from 'react-async';
import { toast } from 'react-toastify';
import { ActionCreator } from 'redux';
import { OPENSRP_PLANS } from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import store from '../../store';
import {
  fetchPlanRecords,
  FetchPlanRecordsAction,
  PlanPayload,
  PlanRecord,
  PlanRecordResponse,
} from '../../store/ducks/plans';
import {
  extractPlanRecordResponseFromPlanPayload,
  growl,
  planRecordResponseToPlanRecord,
} from '../utils';

/** options to pass to asyncGetPlanRecords as first argument
 * These options are passed indirectly through the react-async interface
 */
export interface AsyncGetPlanRecordsOptions {
  service: typeof OpenSRPService;
  fetchPlansCreator: ActionCreator<FetchPlanRecordsAction>;
}

/** default options to asyncGetPlanRecords */
export const defaultAsyncPlansOptions = {
  fetchPlansCreator: fetchPlanRecords,
  service: OpenSRPService,
};

/** make fetch request to OpenSRP plans endpoint
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {ActionCreator<FetchPlanRecordsAction>} fetchPlansCreator - action creator for adding practitioners to store
 */
export const asyncGetPlanRecords: PromiseFn<PlanRecord[]> = async (
  { service, fetchPlansCreator } = defaultAsyncPlansOptions,
  { signal } = new AbortController()
) => {
  const serve = new service(OPENSRP_PLANS, signal);
  return serve
    .list()
    .then((planResults: PlanPayload[]) => {
      const planRecords: PlanRecordResponse[] = planResults
        .map(extractPlanRecordResponseFromPlanPayload)
        .filter((plan: PlanRecordResponse | null) => !!plan) as PlanRecordResponse[];
      store.dispatch(fetchPlansCreator(planRecords));
      // we return planRecords because that's what the component consumes for render.
      return planRecords.map(planRecordResponseToPlanRecord);
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
      return [];
    });
};
