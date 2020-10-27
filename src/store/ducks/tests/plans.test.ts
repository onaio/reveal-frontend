import reducerRegistry from '@onaio/redux-reducer-registry';
import { cloneDeep, keyBy, keys, pickBy, values } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import { DISPLAYED_PLAN_TYPES } from '../../../configs/env';
import { FIReasons } from '../../../configs/settings';
import { PLAN_RECORD_BY_ID, SORT_BY_EFFECTIVE_PERIOD_START_FIELD } from '../../../constants';
import store from '../../index';
import reducer, {
  fetchPlanRecords,
  fetchPlans,
  getPlanById,
  getPlanRecordById,
  getPlanRecordsById,
  getPlanRecordsIdArray,
  getPlansArray,
  getPlansArrayByInterventionType,
  getPlansArrayByJurisdictionIds,
  getPlansArrayByParentJurisdictionId,
  getPlansArrayByReason,
  getPlansArrayByStatus,
  getPlansArrayByTitle,
  getPlansById,
  InterventionType,
  makePlansArraySelector,
  Plan,
  PlanRecord,
  PlanRecordResponse,
  plansArrayBaseSelector,
  PlanStatus,
  reducerName,
  removePlansAction,
} from '../plans';
import * as fixtures from './fixtures';

jest.mock('../../../configs/env');
reducerRegistry.register(reducerName, reducer);

// reselect selector
const plansArraySelector = makePlansArraySelector();

describe('reducers/plans', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
    store.dispatch(removePlansAction);
  });

  it('should have initial state', () => {
    expect(getPlansById(store.getState(), InterventionType.FI, ['active', 'draft'], null)).toEqual(
      {}
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [], null)).toEqual([]);
    expect(getPlanById(store.getState(), 'someId')).toEqual(null);
    expect(getPlanRecordsById(store.getState())).toEqual({});
    expect(getPlanRecordsIdArray(store.getState())).toEqual([]);
    expect(plansArrayBaseSelector()(store.getState())).toEqual([]);
    expect(getPlanRecordById(store.getState(), 'somId')).toEqual(null);
    expect(getPlansArray(store.getState())).toEqual([]);
    expect(plansArraySelector(store.getState(), {})).toEqual([]);
  });

  it('should fetch Plans', () => {
    store.dispatch(fetchPlans([...fixtures.plans, fixtures.plan22, fixtures.plan104]));

    const allPlans = keyBy(
      [...fixtures.plans, fixtures.plan22, fixtures.plan104],
      (plan: Plan) => plan.id
    );
    const fiPlans = pickBy(allPlans, (e: Plan) => e.plan_intervention_type === InterventionType.FI);
    const irsPlans = pickBy(
      allPlans,
      (e: Plan) => e.plan_intervention_type === InterventionType.IRS
    );
    const dynamicFiPlans = pickBy(
      allPlans,
      (e: Plan) => e.plan_intervention_type === InterventionType.DynamicFI
    );
    const routinePlans = values(cloneDeep(store.getState().plans.plansById)).filter(
      (plan: Plan) =>
        plan.plan_intervention_type === InterventionType.FI && plan.plan_fi_reason === FIReasons[0]
    );

    const reactivePlans = values(cloneDeep(store.getState().plans.plansById)).filter(
      (plan: Plan) =>
        plan.plan_intervention_type === InterventionType.FI && plan.plan_fi_reason === FIReasons[1]
    );
    const reactiveDraftPlans = values(cloneDeep(store.getState().plans.plansById)).filter(
      (plan: Plan) =>
        plan.plan_intervention_type === InterventionType.FI &&
        plan.plan_fi_reason === FIReasons[1] &&
        plan.plan_status === 'draft'
    );
    expect(getPlansById(store.getState(), InterventionType.FI, [], null)).toEqual(fiPlans);
    expect(getPlansById(store.getState(), InterventionType.IRS, [], null)).toEqual(irsPlans);

    expect(plansArrayBaseSelector()(store.getState())).toEqual(values(allPlans));

    expect(getPlansArray(store.getState(), InterventionType.FI, [], null)).toEqual(values(fiPlans));
    expect(getPlansArray(store.getState(), InterventionType.IRS, [], null)).toEqual(
      values(irsPlans)
    );

    expect(getPlansArray(store.getState(), InterventionType.FI, [], FIReasons[1])).toEqual(
      values(reactivePlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [], FIReasons[0])).toEqual(
      values(routinePlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [PlanStatus.DRAFT], null)).toEqual(
      values(reactiveDraftPlans)
    );

    // getPlansArray gets does not filter plans by location when no location is passed
    // you can pass only the state and getPlansArray will return all fiPlans in the store
    expect(getPlansArray(store.getState(), InterventionType.FI, [], null)).toEqual(values(fiPlans));
    expect(getPlansArray(store.getState(), InterventionType.IRS, [], null)).toEqual(
      values(irsPlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [], FIReasons[1])).toEqual(
      values(reactivePlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [], FIReasons[0])).toEqual(
      values(routinePlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [PlanStatus.DRAFT], null)).toEqual(
      values(reactiveDraftPlans)
    );

    expect(getPlanById(store.getState(), 'ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f')).toEqual(
      allPlans['ed2b4b7c-3388-53d9-b9f6-6a19d1ffde1f']
    );

    // RESELECT TESTS
    const fiFilter = {
      interventionType: InterventionType.FI,
    };
    const severalInterventions = {
      interventionType: [InterventionType.FI, InterventionType.DynamicFI],
    };
    const jurisdictionFilter = {
      jurisdictionIds: ['450fc15b-5bd2-468a-927a-49cb10d3bcac'],
    };
    const statusFilter = {
      statusList: [PlanStatus.DRAFT],
    };
    const reasonFilter = {
      reason: FIReasons[1],
    };
    const parentJurisdictionFilter = {
      parentJurisdictionId: '2977',
    };
    const titleFilter = {
      title: 'John',
    };
    const titleUpperFilter = {
      title: 'JOHN',
    };

    expect(getPlansArrayByInterventionType()(store.getState(), {})).toEqual(values(allPlans));
    expect(getPlansArrayByInterventionType()(store.getState(), fiFilter)).toEqual(values(fiPlans));
    expect(getPlansArrayByInterventionType()(store.getState(), severalInterventions)).toEqual(
      values({ ...fiPlans, ...dynamicFiPlans })
    );
    expect(getPlansArrayByJurisdictionIds()(store.getState(), jurisdictionFilter)).toEqual(
      values(allPlans).filter(e => e.jurisdiction_id === '450fc15b-5bd2-468a-927a-49cb10d3bcac')
    );
    expect(getPlansArrayByStatus()(store.getState(), statusFilter)).toEqual(
      values(allPlans).filter(e => e.plan_status === PlanStatus.DRAFT)
    );
    expect(getPlansArrayByReason()(store.getState(), reasonFilter)).toEqual(
      values(allPlans).filter(e => e.plan_fi_reason === FIReasons[1])
    );
    expect(
      getPlansArrayByParentJurisdictionId()(store.getState(), parentJurisdictionFilter)
    ).toEqual(values(allPlans).filter(e => e.jurisdiction_path.includes('2977')));
    expect(getPlansArrayByTitle()(store.getState(), titleFilter)).toEqual([fixtures.plan22]);
    expect(getPlansArrayByTitle()(store.getState(), titleUpperFilter)).toEqual([fixtures.plan22]);
    expect(
      plansArraySelector(store.getState(), {
        ...fiFilter,
        ...jurisdictionFilter,
      })
    ).toEqual(
      values(fiPlans).filter(e => e.jurisdiction_id === '450fc15b-5bd2-468a-927a-49cb10d3bcac')
    );

    expect(
      plansArraySelector(store.getState(), {
        planIds: ['10f9e9fa-ce34-4b27-a961-72fab5206ab6'],
      })
    ).toEqual([fixtures.plan1, fixtures.plan22]);
    expect(
      plansArraySelector(store.getState(), {
        interventionType: DISPLAYED_PLAN_TYPES as InterventionType[],
        planIds: null,
      }).length
    ).toEqual(5);

    expect(
      plansArraySelector(store.getState(), {
        interventionType: InterventionType.FI,
        reason: FIReasons[1],
      })
    ).toEqual(values(reactivePlans));

    expect(
      plansArraySelector(store.getState(), {
        interventionType: InterventionType.FI,
        reason: FIReasons[0],
      })
    ).toEqual(values(routinePlans));

    expect(
      plansArraySelector(store.getState(), {
        interventionType: InterventionType.FI,
        reason: FIReasons[1],
        statusList: [PlanStatus.DRAFT],
      })
    ).toEqual(values(reactiveDraftPlans));

    expect(
      plansArraySelector(store.getState(), {
        interventionType: InterventionType.FI,
        jurisdictionIds: ['450fc15b-5bd2-468a-927a-49cb10d3bcac'],
        parentJurisdictionId: '2939',
        reason: FIReasons[0],
        statusList: [PlanStatus.ACTIVE],
      })
    ).toEqual(
      values(fiPlans).filter(
        e =>
          e.plan_fi_reason === FIReasons[0] &&
          e.jurisdiction_path.includes('2939') &&
          e.plan_status === PlanStatus.ACTIVE &&
          e.jurisdiction_id === '450fc15b-5bd2-468a-927a-49cb10d3bcac'
      )
    );
  });

  it('filters correctly when jurisdiction_parent_id is provided', () => {
    store.dispatch(fetchPlans(fixtures.plans as any));
    const allPlans = keyBy(fixtures.plans, (plan: Plan) => plan.id);
    // filter irs plans based on location
    const filteredIRSPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.IRS && e.jurisdiction_path.includes('2977')
    );
    // filter fi plans based on a location
    const filteredFIPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.FI && e.jurisdiction_path.includes('2944')
    );
    // filter routine fi plans based on a location
    const filteredRoutineFIPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.FI &&
        e.plan_fi_reason === FIReasons[0] &&
        e.jurisdiction_path.includes('2939')
    );
    // filter Case Triggered irs plans based on a location
    const filteredCaseTriggeredIRSPlans = pickBy(
      allPlans,
      (e: Plan) =>
        e.plan_intervention_type === InterventionType.IRS &&
        e.plan_fi_reason === FIReasons[1] &&
        e.jurisdiction_path.includes('2989')
    );
    // getPlansArray gets filters plans by location when no location is passed
    expect(getPlansArray(store.getState(), InterventionType.IRS, [], null, [], '2977')).toEqual(
      values(filteredIRSPlans)
    );
    expect(getPlansArray(store.getState(), InterventionType.FI, [], null, [], '2944')).toEqual(
      values(filteredFIPlans)
    );
    expect(
      getPlansArray(store.getState(), InterventionType.IRS, [], FIReasons[1], [], '2989')
    ).toEqual(values(filteredCaseTriggeredIRSPlans));
    expect(
      getPlansArray(store.getState(), InterventionType.FI, [], FIReasons[0], [], '2939')
    ).toEqual(values(filteredRoutineFIPlans));
  });

  it('should fetch PlanRecords', () => {
    store.dispatch(fetchPlanRecords(fixtures.planRecordResponses as PlanRecordResponse[]));
    const { planRecordsById: allPlanRecords } = fixtures;
    const planRecordsArraySelector = makePlansArraySelector(PLAN_RECORD_BY_ID);

    const fiPlanRecords = pickBy(
      allPlanRecords,
      (e: PlanRecord) => e.plan_intervention_type === InterventionType.FI
    );
    const irsPlanRecords = pickBy(
      allPlanRecords,
      (e: PlanRecord) => e.plan_intervention_type === InterventionType.IRS
    );
    expect(getPlanRecordsById(store.getState(), InterventionType.FI)).toEqual(fiPlanRecords);
    expect(getPlanRecordsById(store.getState(), InterventionType.IRS)).toEqual(irsPlanRecords);

    const fiRecordPlanIds = keys(fiPlanRecords);
    const irsRecordPlansIds = keys(irsPlanRecords);
    expect(getPlanRecordsIdArray(store.getState(), InterventionType.FI)).toEqual(fiRecordPlanIds);
    expect(getPlanRecordsIdArray(store.getState(), InterventionType.IRS)).toEqual(
      irsRecordPlansIds
    );

    const fiPlanRecordsArray = values(fiPlanRecords);
    const irsPlanRecordsArray = values(irsPlanRecords);

    expect(
      planRecordsArraySelector(store.getState(), { interventionType: InterventionType.FI })
    ).toEqual(fiPlanRecordsArray);
    expect(
      planRecordsArraySelector(store.getState(), { interventionType: InterventionType.IRS })
    ).toEqual(irsPlanRecordsArray);

    const planRecordsArray = [...planRecordsArraySelector(store.getState(), {})].sort(
      (a: PlanRecord, b: PlanRecord) => Date.parse(b.plan_date) - Date.parse(a.plan_date)
    );
    expect(planRecordsArray).toEqual(fixtures.sortedPlanRecordArray);

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
    let numberOfPlansInStore = getPlansArray(store.getState(), null, []).length;
    expect(numberOfPlansInStore).toEqual(0);

    store.dispatch(fetchPlans([fixtures.plan3] as any));
    numberOfPlansInStore = getPlansArray(store.getState(), null, []).length;
    expect(numberOfPlansInStore).toEqual(1);

    store.dispatch(removePlansAction);
    numberOfPlansInStore = getPlansArray(store.getState(), null, []).length;
    expect(numberOfPlansInStore).toEqual(0);
  });

  it('Concatenates new plans to existing plans after fetching', () => {
    store.dispatch(removePlansAction);
    let numberOfPlansInStore = getPlansArray(store.getState(), null, []).length;
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

  it('getPlansArray works when plan.jurisdiction_path is null', () => {
    store.dispatch(removePlansAction);
    store.dispatch(fetchPlans([fixtures.plan7] as any));
    expect([]).toEqual(
      getPlansArray(
        store.getState(),
        InterventionType.IRS,
        [PlanStatus.ACTIVE],
        'Case Triggered',
        [],
        'some-jurisdiction-id'
      )
    );

    expect([getPlanById(store.getState(), 'plan-id-7')]).toEqual(
      getPlansArray(
        store.getState(),
        InterventionType.IRS,
        [PlanStatus.ACTIVE],
        'Case Triggered',
        [],
        null
      )
    );
  });
  it('should sort planrecords', () => {
    store.dispatch(fetchPlanRecords(fixtures.planRecordResponses as PlanRecordResponse[]));

    const planRecordsArraySelector = makePlansArraySelector(
      PLAN_RECORD_BY_ID,
      SORT_BY_EFFECTIVE_PERIOD_START_FIELD
    );

    const planRecordsArray = [...planRecordsArraySelector(store.getState(), {})];
    expect(planRecordsArray).toEqual(fixtures.sortedPlanRecordArray);
  });
});
