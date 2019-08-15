import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy, keys, pickBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import { CASE_TRIGGERED_PLAN, REACTIVE, ROUTINE } from '../../../constants';
import store from '../../index';
import reducer, {
  fetchPlanRecords,
  fetchPlans,
  getFilteredPlansArray,
  getPlanById,
  getPlanRecordById,
  getPlanRecordsArray,
  getPlanRecordsById,
  getPlanRecordsIdArray,
  getPlansArray,
  getPlansById,
  getPlansIdArray,
  InterventionType,
  Plan,
  PlanRecord,
  PlanStatus,
  reducerName,
  removePlansAction,
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
    expect(getPlansById(store.getState(), InterventionType.FI, ['active', 'draft'], null)).toEqual(
      {}
    );
    expect(getPlansIdArray(store.getState(), InterventionType.FI, [], null)).toEqual([]);
    expect(getPlansArray(store.getState(), InterventionType.FI, [], null)).toEqual([]);
    expect(getPlanById(store.getState(), 'someId')).toEqual(null);
    expect(getPlanRecordsById(store.getState())).toEqual({});
    expect(getPlanRecordsIdArray(store.getState())).toEqual([]);
    expect(getPlanRecordsArray(store.getState())).toEqual([]);
    expect(getPlanRecordById(store.getState(), 'somId')).toEqual(null);
    expect(getFilteredPlansArray(store.getState(), InterventionType.FI, [], null)).toEqual([]);
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
      (plan: Plan) =>
        plan.plan_intervention_type === InterventionType.FI && plan.plan_fi_reason === ROUTINE
    );

    const filteredByJurisdictionPlans = values(
      cloneDeep(routinePlans).filter(
        (plan: Plan) => plan.jurisdiction_id === '450fc15b-5bd2-468a-927a-49cb10d3bcac'
      )
    );

    const reactivePlans = values(cloneDeep(store.getState().plans.plansById)).filter(
      (plan: Plan) => plan.plan_fi_reason === REACTIVE
    );
    const reactiveDraftPlans = values(cloneDeep(store.getState().plans.plansById)).filter(
      (plan: Plan) => plan.plan_fi_reason === REACTIVE && plan.plan_status === 'draft'
    );
    expect(getPlansById(store.getState(), InterventionType.FI, [], null)).toEqual(fiPlans);
    expect(getPlansById(store.getState(), InterventionType.IRS, [], null)).toEqual(irsPlans);

    expect(getPlansIdArray(store.getState())).toEqual(['ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f']);
    expect(getPlansIdArray(store.getState(), InterventionType.IRS)).toEqual(['plan-id-2']);

    expect(getPlansArray(store.getState(), InterventionType.FI, [], null)).toEqual(values(fiPlans));
    expect(getPlansArray(store.getState(), InterventionType.IRS, [], null)).toEqual(
      values(irsPlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [], REACTIVE)).toEqual(
      values(reactivePlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [], ROUTINE)).toEqual(
      values(routinePlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [PlanStatus.DRAFT], null)).toEqual(
      values(reactiveDraftPlans)
    );

    // getFilteredPlansArray gets does not filter plans by location when no location is passed
    // you can pass only the state and getFilteredPlansArray will return all fiPlans in the store
    expect(getFilteredPlansArray(store.getState())).toEqual(values(fiPlans));
    expect(getFilteredPlansArray(store.getState(), InterventionType.FI, [], null)).toEqual(
      values(fiPlans)
    );
    expect(getFilteredPlansArray(store.getState(), InterventionType.IRS, [], null)).toEqual(
      values(irsPlans)
    );
    expect(getFilteredPlansArray(store.getState(), InterventionType.FI, [], REACTIVE)).toEqual(
      values(reactivePlans)
    );
    expect(getFilteredPlansArray(store.getState(), InterventionType.FI, [], ROUTINE)).toEqual(
      values(routinePlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [PlanStatus.DRAFT], null)).toEqual(
      values(reactiveDraftPlans)
    );

    // filter irs plans based on location
    const filteredIRSPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.IRS &&
        e.jurisdiction_name_path[0] === 'Canton Tha Luang'
    );
    // filter fi plans based on a location
    const filteredFIPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.FI &&
        e.jurisdiction_name_path[0] === 'Chadiza'
    );
    // filter routine fi plans based on a location
    const filteredRoutineFIPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.FI &&
        e.plan_fi_reason === ROUTINE &&
        e.jurisdiction_name_path[0] === 'Chadiza'
    );
    // filter case-triggered irs plans based on a location
    const filteredCaseTriggeredIRSPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.IRS &&
        e.plan_fi_reason === CASE_TRIGGERED_PLAN &&
        e.jurisdiction_name_path[0] === 'Canton Tha Luang'
    );
    // getFilteredPlansArray gets filters plans by location when no location is passed
    expect(
      getFilteredPlansArray(store.getState(), InterventionType.IRS, [], null, 'Canton Tha Luang', 1)
    ).toEqual(values(filteredIRSPlans));
    expect(
      getFilteredPlansArray(store.getState(), InterventionType.FI, [], null, 'Chadiza', 1)
    ).toEqual(values(filteredFIPlans));
    expect(
      getFilteredPlansArray(
        store.getState(),
        InterventionType.IRS,
        [],
        CASE_TRIGGERED_PLAN,
        'Canton Tha Luang',
        1
      )
    ).toEqual(values(filteredCaseTriggeredIRSPlans));
    expect(
      getFilteredPlansArray(store.getState(), InterventionType.FI, [], ROUTINE, 'Chadiza', 1)
    ).toEqual(values(filteredRoutineFIPlans));

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
  it('resets plansById records', () => {
    store.dispatch(removePlansAction);
    let numberOfPlansInStore = getPlansArray(store.getState(), undefined, []).length;
    expect(numberOfPlansInStore).toEqual(0);

    store.dispatch(fetchPlans([fixtures.plan3] as any));
    numberOfPlansInStore = getPlansArray(store.getState(), undefined, []).length;
    expect(numberOfPlansInStore).toEqual(1);

    store.dispatch(removePlansAction);
    numberOfPlansInStore = getPlansArray(store.getState(), undefined, []).length;
    expect(numberOfPlansInStore).toEqual(0);
  });

  it('Concatenates new plans to existing plans after fetching', () => {
    store.dispatch(removePlansAction);
    let numberOfPlansInStore = getPlansArray(store.getState(), undefined, []).length;
    expect(numberOfPlansInStore).toEqual(0);
    store.dispatch(fetchPlans([fixtures.plan3] as any));
    let plan3FromStore = getPlanById(store.getState(), '1502e539');
    expect(plan3FromStore).not.toBeNull();
    store.dispatch(fetchPlans([fixtures.plan99] as any));
    plan3FromStore = getPlanById(store.getState(), '1502e539');
    const plan99FromStore = getPlanById(store.getState(), '236ca3fb-1b74-5028-a0c8-ab954bb28044');
    expect(plan3FromStore).not.toBeNull();
    expect(plan99FromStore).not.toBeNull();
    numberOfPlansInStore = getPlansArray(store.getState(), undefined, []).length;
    expect(numberOfPlansInStore).toEqual(2);
  });
});
