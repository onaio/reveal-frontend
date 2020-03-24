import { OPENSRP_PLANS } from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { extractPlanRecordResponseFromPlanPayload } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import { fetchPlanRecords, PlanPayload } from '../../../../../store/ducks/plans';

type UUID = string;

/** loads a plan and dispatches action to add plan to store
 * @param {OpenSRPService} service - the opensrp service
 * @param {UUID} planId - uuid of the plan to be got in the api call
 * @param {actionCreator} - action creator.
 */
export async function loadPlan(
  service: typeof OpenSRPService,
  planId: UUID,
  actionCreator: typeof fetchPlanRecords
) {
  const OpenSrpPlanService = new service(OPENSRP_PLANS);
  await OpenSrpPlanService.read(planId)
    .then((plan: PlanPayload[]) => {
      const planRecord = extractPlanRecordResponseFromPlanPayload(plan[0]);
      if (planRecord) {
        actionCreator([planRecord]);
      }
    })
    .catch(err => displayError(err));
}
