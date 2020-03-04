import superset from '@onaio/superset-connector';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_MAX_RECORDS,
  SUPERSET_PLANS_SLICE,
  SUPERSET_STRUCTURES_SLICE,
  SUPERSET_TASKS_SLICE,
} from '../../../../../configs/env';
import { AN_ERROR_OCCURED } from '../../../../../configs/lang';
import { JURISDICTION_ID, PLAN_ID } from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { popupHandler } from '../../../../../helpers/handlers';
import supersetFetch from '../../../../../services/superset';
import { fetchGoals, Goal } from '../../../../../store/ducks/goals';
import { fetchJurisdictions, Jurisdiction } from '../../../../../store/ducks/jurisdictions';
import { fetchPlans, Plan } from '../../../../../store/ducks/plans';
import { setStructures, Structure } from '../../../../../store/ducks/structures';
import { fetchTasks, Task } from '../../../../../store/ducks/tasks';

/**
 * Fetch data for the plan
 * @param fetchGoalsActionCreator // fetch goals action creator
 * @param fetchJurisdictionsActionCreator // fetch jurisdication action creator
 * @param fetchPlansActionCreator // fetch plans action creator
 * @param fetchStructuresActionCreator // fetch structures action creator
 * @param fetchTasksActionCreator // fetch tasks action creator
 * @param plan // plan object
 * @param supersetService // fetch superset promise
 */
export const fetchData = async (
  fetchGoalsActionCreator: typeof fetchGoals,
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions,
  fetchPlansActionCreator: typeof fetchPlans,
  fetchStructuresActionCreator: typeof setStructures,
  fetchTasksActionCreator: typeof fetchTasks,
  plan: Plan,
  supersetService: typeof supersetFetch
): Promise<void> => {
  if (plan && plan.plan_id) {
    /** define superset filter params for jurisdictions */
    const jurisdictionsParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
      { comparator: plan.jurisdiction_id, operator: '==', subject: JURISDICTION_ID },
    ]);
    await supersetService(SUPERSET_JURISDICTIONS_SLICE, jurisdictionsParams)
      .then((result: Jurisdiction[]) => {
        if (result) {
          fetchJurisdictionsActionCreator(result);
        } else {
          displayError(new Error(AN_ERROR_OCCURED));
        }
      })
      .catch(error => {
        throw error;
      });
    /** define superset params for filtering by plan_id */
    const supersetParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
      { comparator: plan.plan_id, operator: '==', subject: PLAN_ID },
    ]);
    /** define superset params for goals */
    const goalsParams = superset.getFormData(
      SUPERSET_MAX_RECORDS,
      [{ comparator: plan.plan_id, operator: '==', subject: PLAN_ID }],
      { action_prefix: true }
    );
    /** Implement Ad hoc Queries since jurisdictions have no plan_id */
    await supersetService(SUPERSET_STRUCTURES_SLICE, jurisdictionsParams)
      .then((structuresResults: Structure[]) => {
        if (structuresResults) {
          fetchStructuresActionCreator(structuresResults);
        } else {
          displayError(new Error(AN_ERROR_OCCURED));
        }
      })
      .catch(error => {
        throw error;
      });
    await supersetService(SUPERSET_PLANS_SLICE, jurisdictionsParams)
      .then((result2: Plan[]) => {
        if (result2) {
          fetchPlansActionCreator(result2);
        } else {
          displayError(new Error(AN_ERROR_OCCURED));
        }
      })
      .catch(error => {
        throw error;
      });
    await supersetService(SUPERSET_GOALS_SLICE, goalsParams)
      .then((result3: Goal[]) => {
        if (result3) {
          fetchGoalsActionCreator(result3);
        } else {
          displayError(new Error(AN_ERROR_OCCURED));
        }
      })
      .catch(error => {
        throw error;
      });
    await supersetService(SUPERSET_TASKS_SLICE, supersetParams)
      .then((result4: Task[]) => {
        if (result4) {
          fetchTasksActionCreator(result4);
        } else {
          displayError(new Error(AN_ERROR_OCCURED));
        }
      })
      .catch(error => {
        throw error;
      });
  }
};

/**
 * Build mapbox component event handlers
 * @param method // Event handler
 */
export const buildHandlers = (method: any = popupHandler) => {
  return [
    {
      method,
      name: 'pointClick',
      type: 'click',
    },
  ];
};
