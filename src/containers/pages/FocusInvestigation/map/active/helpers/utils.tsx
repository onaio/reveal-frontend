import superset, { SupersetFormData } from '@onaio/superset-connector';
import * as React from 'react';
import { ActionCreator } from 'redux';
import {
  SUPERSET_GOALS_SLICE,
  SUPERSET_JURISDICTIONS_SLICE,
  SUPERSET_MAX_RECORDS,
  SUPERSET_PLANS_SLICE,
  SUPERSET_STRUCTURES_SLICE,
  SUPERSET_TASKS_SLICE,
} from '../../../../../../configs/env';
import { AN_ERROR_OCCURRED } from '../../../../../../configs/lang';
import { CASE_CLASSIFICATION_LABEL, END_DATE, START_DATE } from '../../../../../../configs/lang';
import { JURISDICTION_ID, PLAN_ID, CASE_CONFIRMATION_CODE, ACTION_CODE } from '../../../../../../constants';
import { ROUTINE } from '../../../../../../constants';
import { displayError } from '../../../../../../helpers/errors';
import { PopHandler, popupHandler } from '../../../../../../helpers/handlers';
import supersetFetch from '../../../../../../services/superset';
import { fetchGoals, FetchGoalsAction } from '../../../../../../store/ducks/goals';
import { fetchJurisdictions, Jurisdiction } from '../../../../../../store/ducks/jurisdictions';
import { fetchPlans, FetchPlansAction, Plan } from '../../../../../../store/ducks/plans';
import { setStructures, SetStructuresAction } from '../../../../../../store/ducks/structures';
import { fetchTasks, FetchTasksAction } from '../../../../../../store/ducks/tasks';
import props from '../../../../../../components/DatePickerWrapper/tests/fixtures';


/** abstracts code that actually makes the superset Call since it is quite similar */
export async function supersetCall<TAction>(
  supersetSlice: string,
  actionCreator: ActionCreator<TAction>,
  supersetService: typeof supersetFetch = supersetFetch,
  supersetOptions: SupersetFormData | null = null
) {
  const asyncOperation = supersetOptions
    ? supersetService(supersetSlice, supersetOptions)
    : supersetService(supersetSlice);
  return asyncOperation
    .then((result: Jurisdiction[]) => {
      if (result) {
        actionCreator(result);
      } else {
        throw new Error(AN_ERROR_OCCURRED);
      }
    })
    .catch(error => {
      throw error;
    });
}

/**
 * Fetch data for the plan
 * @param fetchGoalsActionCreator Fetch goals action creator
 * @param fetchJurisdictionsActionCreator Fetch jurisdiction action creator
 * @param fetchPlansActionCreator Fetch plans action creator
 * @param fetchStructuresActionCreator Fetch structures action creator
 * @param fetchTasksActionCreator Fetch tasks action creator
 * @param plan Plan object
 * @param supersetService Fetch superset promise
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

    /** filter caseConfirmation tasks by action code and jurisdiction_id */
    const tasksParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
      { comparator: plan.jurisdiction_id, operator: '==', subject: JURISDICTION_ID },
      { comparator: CASE_CONFIRMATION_CODE, operator: '==', subject: ACTION_CODE },
    ]);

    supersetCall(
      SUPERSET_JURISDICTIONS_SLICE,
      fetchJurisdictionsActionCreator,
      supersetService,
      jurisdictionsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<SetStructuresAction>(
      SUPERSET_STRUCTURES_SLICE,
      fetchStructuresActionCreator,
      supersetService,
      jurisdictionsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchPlansAction>(
      SUPERSET_PLANS_SLICE,
      fetchPlansActionCreator,
      supersetService,
      jurisdictionsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchGoalsAction>(
      SUPERSET_GOALS_SLICE,
      fetchGoalsActionCreator,
      supersetService,
      goalsParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchTasksAction>(
      SUPERSET_TASKS_SLICE,
      fetchTasksActionCreator,
      supersetService,
      supersetParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));

    supersetCall<FetchTasksAction>(
      SUPERSET_TASKS_SLICE,
      fetchTasksActionCreator,
      supersetService,
      tasksParams
    ).catch(() => displayError(new Error(AN_ERROR_OCCURRED)));
  }
};

/**
 * Build mapbox component event handlers
 * @param method  Event handler
 */
export const buildHandlers = (planId: string, method: any = popupHandler) => {
  let customMethod = (e: any) => popupHandler(e, planId);
  return [
    {
      method: customMethod,
      name: 'pointClick',
      type: 'click',
    },
  ];
};

/**
 * Build detail view for the map
 * @param plan
 * @returns {React.ReactElement[]} Detail View elements
 */
export const getDetailViewPlanInvestigationContainer = (plan: Plan): React.ReactElement[] => {
  const detailViewPlanInvestigationContainer: React.ReactElement[] = [];
  /** Array that holds keys of a plan object
   * Will be used to check plan_effective_period_end or plan_effective_period_start to build the detailview
   */
  const planKeysArray: string[] = Object.keys(plan);

  /** alias enables assigning keys dynamically used to populate the detailview  */
  const alias = {
    plan_effective_period_end: END_DATE,
    plan_effective_period_start: START_DATE,
  };

  if (plan.plan_fi_reason === ROUTINE) {
    planKeysArray.forEach((column: string) => {
      if (column === 'plan_effective_period_end' || column === 'plan_effective_period_start') {
        detailViewPlanInvestigationContainer.push(
          <span key={column} className="detailview">
            <b>{alias[column]}:</b> &nbsp;
            {plan && plan[column]}
          </span>
        );
      }
    });
  } else {
    detailViewPlanInvestigationContainer.push(
      <span key={plan && plan.plan_id}>
        <b>{CASE_CLASSIFICATION_LABEL}:</b>&nbsp;
        {plan && plan.plan_intervention_type ? plan.plan_intervention_type : null}
      </span>
    );
  }

  return detailViewPlanInvestigationContainer;
};
