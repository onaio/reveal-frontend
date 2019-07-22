import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy, keys, pickBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import { REACTIVE, ROUTINE } from '../../../constants';
import store from '../../index';
import reducer, {
  fetchPlanRecords,
  fetchPlans,
  getPlanById,
  getPlanRecordById,
  getPlanRecordsArray,
  getPlanRecordsById,
  getPlanRecordsIdArray,
  getPlansArray,
  getPlansById,
  getPlansByReason,
  getPlansIdArray,
  InterventionType,
  Plan,
  PlanRecord,
  reducerName,
} from '../plans';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/plans', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getPlansById(store.getState())).toEqual({});
    expect(getPlansIdArray(store.getState())).toEqual([]);
    expect(getPlansArray(store.getState())).toEqual([]);
    expect(getPlansByReason(store.getState(), ROUTINE)).toEqual([]);
    expect(getPlanById(store.getState(), 'someId')).toEqual(null);
    expect(getPlanRecordsById(store.getState())).toEqual({});
    expect(getPlanRecordsIdArray(store.getState())).toEqual([]);
    expect(getPlanRecordsArray(store.getState())).toEqual([]);
    expect(getPlanRecordById(store.getState(), 'somId')).toEqual(null);
  });

  it('should fetch Plans', () => {
    store.dispatch(fetchPlans(fixtures.plans));
    const allPlans = keyBy(fixtures.plans, (plan: Plan) => plan.id);
    const fiPlans = pickBy(allPlans, (e: Plan) => e.plan_intervention_type === InterventionType.FI);
    const irsPlans = pickBy(
      allPlans,
      (e: Plan) => e.plan_intervention_type === InterventionType.IRS
    );
    const routinePlans = values(cloneDeep(store.getState().plans.plansById)).filter(
      (plan: Plan) => plan.plan_fi_reason === ROUTINE
    );

    const reactivePlans = values(cloneDeep(store.getState().plans.plansById)).filter(
      (plan: Plan) => plan.plan_fi_reason === REACTIVE
    );
    expect(getPlansById(store.getState())).toEqual(fiPlans);
    expect(getPlansById(store.getState(), InterventionType.IRS)).toEqual(irsPlans);

    expect(getPlansIdArray(store.getState())).toEqual(['ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f']);
    expect(getPlansIdArray(store.getState(), InterventionType.IRS)).toEqual(['plan-id-2']);

    expect(getPlansArray(store.getState())).toEqual(values(fiPlans));
    expect(getPlansArray(store.getState(), InterventionType.IRS)).toEqual(values(irsPlans));

    expect(getPlansByReason(store.getState(), ROUTINE)).toEqual(values(routinePlans));
    expect(getPlansByReason(store.getState(), REACTIVE)).toEqual(values(reactivePlans));

    expect(getPlanById(store.getState(), 'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f')).toEqual(
      allPlans['ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f']
    );
  });

  it('should fetch PlanRecords', () => {
    store.dispatch(fetchPlanRecords(fixtures.planRecordResponses));
    const { planRecordsById: allPlanRecords } = fixtures;

    const fiPlanRecords = pickBy(
      allPlanRecords,
      (e: PlanRecord) => e.plan_intervention_type === InterventionType.FI
    );
    const irsPlanRecords = pickBy(
      allPlanRecords,
      (e: PlanRecord) => e.plan_intervention_type === InterventionType.IRS
    );
    expect(getPlanRecordsById(store.getState())).toEqual(fiPlanRecords);
    expect(getPlanRecordsById(store.getState(), InterventionType.IRS)).toEqual(irsPlanRecords);

    const fiRecordPlanIds = keys(fiPlanRecords);
    const irsRecordPlansIds = keys(irsPlanRecords);
    expect(getPlanRecordsIdArray(store.getState())).toEqual(fiRecordPlanIds);
    expect(getPlanRecordsIdArray(store.getState(), InterventionType.IRS)).toEqual(
      irsRecordPlansIds
    );

    const fiPlanRecordsArray = values(fiPlanRecords);
    const irsPlanRecordsArray = values(irsPlanRecords);
    expect(getPlanRecordsArray(store.getState())).toEqual(fiPlanRecordsArray);
    expect(getPlanRecordsArray(store.getState(), InterventionType.IRS)).toEqual(
      irsPlanRecordsArray
    );

    const planId = '6c7904b2-c556-4004-a9b9-114617832954';
    const planRecord = allPlanRecords[planId];
    expect(getPlanRecordById(store.getState(), planId)).toEqual(planRecord);
  });

  it('should save plans correctly', () => {
    store.dispatch(fetchPlans([fixtures.plan3] as any));
    const plan3FromStore = getPlanById(store.getState(), '1502e539');
    expect(plan3FromStore).not.toBeNull();
    if (plan3FromStore) {
      expect(plan3FromStore.jurisdiction_path).toEqual([
        '9c3c2db4-bddd-44c5-870a-a0eef539e4da',
        '1d16510a-4ae1-453d-9c55-60d966818f47',
        '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
        'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
      ]);
      expect(plan3FromStore.jurisdiction_name_path).toEqual([
        'Lop Buri',
        'District Tha Luang',
        'Canton Tha Luang',
        'Tha Luang Village 1',
      ]);
      expect(plan3FromStore).toEqual(fixtures.plan3);
    }
  });
});
