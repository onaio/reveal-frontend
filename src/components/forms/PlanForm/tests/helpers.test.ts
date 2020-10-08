import { cloneDeep } from 'lodash';
import MockDate from 'mockdate';
import {
  PlanActionCodes,
  planActivities as planActivitiesFromConfig,
  PlanDefinition,
} from '../../../../configs/settings';
import { IGNORE, TRUE } from '../../../../constants';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { InterventionType } from '../../../../store/ducks/plans';
import {
  doesFieldHaveErrors,
  extractActivitiesFromPlanForm,
  extractActivityForForm,
  generatePlanDefinition,
  getConditionFromFormField,
  getFormActivities,
  getGoalUnitFromActionCode,
  getNameTitle,
  getPlanFormValues,
  getTaskGenerationValue,
  isFIOrDynamicFI,
  onSubmitSuccess,
} from '../helpers';
import { GoalUnit, PlanActionCodesType, PlanActivities, PlanFormFields } from '../types';
import {
  activities,
  DynamicFIPlan,
  event,
  event2,
  event3,
  expectedActivity,
  expectedActivityEmptyField,
  expectedExtractActivityFromPlanformResult,
  expectedPlanDefinition,
  extractedActivitiesFromForms,
  fiReasonTestPlan,
  planActivities,
  planActivityWithEmptyfields,
  planActivityWithoutTargets,
  planFormValues,
  planFormValues2,
  planFormValues3,
  values,
  values2,
  valuesWithJurisdiction,
} from './fixtures';

jest.mock('../../../../configs/env');

describe('containers/forms/PlanForm/helpers', () => {
  it('extractActivityForForm works for all activities', () => {
    for (const [key, activityObj] of Object.entries(planActivitiesFromConfig)) {
      expect(extractActivityForForm(activityObj)).toEqual((expectedActivity as any)[key]);
    }
    for (const [key, activityObj] of Object.entries(planActivityWithEmptyfields)) {
      expect(extractActivityForForm(activityObj)).toEqual((expectedActivityEmptyField as any)[key]);
    }
    for (const [key, obj] of Object.entries(planActivityWithoutTargets)) {
      expect(extractActivityForForm(obj)).toEqual((expectedActivity as any)[key]);
    }
  });

  it('check getFormActivities returns the correct value', () => {
    expect(JSON.stringify(getFormActivities(planActivities as PlanActivities))).toEqual(
      JSON.stringify(extractedActivitiesFromForms)
    );
  });

  it('check doesFieldHaveErrors returns the correct value', () => {
    let errors = [
      {
        id: 'Required',
      },
    ];
    let field = 'id';
    let index = 0;
    expect(doesFieldHaveErrors(field, index, errors)).toBe(true);
    field = '';
    index = NaN;
    errors = [];
    expect(doesFieldHaveErrors(field, index, errors)).toBe(false);
  });

  it('check extractActivitiesFromPlanForm returns the correct value', () => {
    const envModule = require('../../../../configs/env');
    envModule.PLAN_UUID_NAMESPACE = '85f7dbbf-07d0-4c92-aa2d-d50d141dde00';
    envModule.ACTION_UUID_NAMESPACE = '35968df5-f335-44ae-8ae5-25804caa2d86';
    MockDate.set('1/30/2000', 0);
    expect(extractActivitiesFromPlanForm(activities)).toEqual(
      expectedExtractActivityFromPlanformResult
    );
    MockDate.reset();
  });

  it('check getNameTitle returns the correct value when Focus Investigation(FI) is selected', () => {
    expect(getNameTitle(event, values)).toEqual(['A1--2019-08-09', 'A1  2019-08-09']);
    expect(getNameTitle(event, valuesWithJurisdiction)).toEqual([
      'A1-TLv2_01-2019-08-09',
      'A1 TLv2_01 2019-08-09',
    ]);
  });

  it('check getNameTitle returns the correct value when IRS is selected', () => {
    expect(getNameTitle(event2, values)).toEqual(['IRS-2019-08-09', 'IRS 2019-08-09']);
    expect(getNameTitle(event2, valuesWithJurisdiction)).toEqual([
      'IRS-2019-08-09',
      'IRS 2019-08-09',
    ]);
  });

  it('check getNameTitle returns the correct value when nothing is selected', () => {
    expect(getNameTitle(event3, values)).toEqual(['IRS-2019-08-09', 'IRS 2019-08-09']);
    expect(getNameTitle(event3, valuesWithJurisdiction)).toEqual([
      'IRS-2019-08-09',
      'IRS 2019-08-09',
    ]);
  });

  it('check generatePlanDefinition returns the correct value', () => {
    MockDate.set('1/30/2000', 0);
    expect(generatePlanDefinition(values2)).toEqual(expectedPlanDefinition);

    // add taskGenerationStatus and increment version
    const planCopy = {
      ...plans[5],
      useContext: plans[5].useContext.concat({
        code: 'taskGenerationStatus',
        valueCodableConcept: 'Disabled',
      }),
      version: 2,
    };
    // remove serverVersion
    const { serverVersion, ...expectedDynamicPlan } = planCopy;
    expectedDynamicPlan.action[0].type = 'create';
    expect(generatePlanDefinition(planFormValues3 as PlanFormFields)).toEqual(expectedDynamicPlan);
    MockDate.reset();
  });

  it('generatePlanDefinition should use value of TASK_GENERATION_STATUS defined on create if value not ignore', () => {
    MockDate.set('1/30/2000', 0);
    const envModule = require('../../../../configs/env');
    envModule.PLAN_UUID_NAMESPACE = '85f7dbbf-07d0-4c92-aa2d-d50d141dde00';
    envModule.ACTION_UUID_NAMESPACE = '35968df5-f335-44ae-8ae5-25804caa2d86';
    envModule.TASK_GENERATION_STATUS = TRUE;
    const planCopy = {
      ...plans[5],
      version: 2,
    };
    // remove serverVersion
    const { serverVersion, ...expectedDynamicPlan } = planCopy;
    expectedDynamicPlan.action[0].type = 'create';
    expectedDynamicPlan.useContext = expectedDynamicPlan.useContext.concat({
      code: 'taskGenerationStatus',
      valueCodableConcept: TRUE,
    });
    expect(generatePlanDefinition(planFormValues3 as PlanFormFields, null, false)).toEqual(
      expectedDynamicPlan
    );
  });

  it('generatePlanDefinition should ignore taskGenerationStatus if specified when creating plan and keep value on edit', () => {
    MockDate.set('1/30/2000', 0);
    const envModule = require('../../../../configs/env');
    envModule.PLAN_UUID_NAMESPACE = '85f7dbbf-07d0-4c92-aa2d-d50d141dde00';
    envModule.ACTION_UUID_NAMESPACE = '35968df5-f335-44ae-8ae5-25804caa2d86';
    envModule.TASK_GENERATION_STATUS = IGNORE;
    const planCopy = {
      ...plans[5],
      version: 2,
    };
    // remove serverVersion
    const { serverVersion, ...expectedDynamicPlan } = planCopy;
    const expectedDynamicPlanCopy = { ...expectedDynamicPlan };

    // on create
    expectedDynamicPlan.action[0].type = 'create';
    expect(generatePlanDefinition(planFormValues3 as PlanFormFields)).toEqual(expectedDynamicPlan);

    // on edit when taskGenerationStatus is present
    expectedDynamicPlan.useContext = expectedDynamicPlan.useContext.concat({
      code: 'taskGenerationStatus',
      valueCodableConcept: planFormValues3.taskGenerationStatus,
    });
    expect(generatePlanDefinition(planFormValues3 as PlanFormFields, null, true)).toEqual(
      expectedDynamicPlan
    );

    // on edit when taskGenerationStatus is not present
    const { taskGenerationStatus, ...planFormValues3Copy } = planFormValues3;
    expect(generatePlanDefinition(planFormValues3Copy as PlanFormFields, null, true)).toEqual(
      expectedDynamicPlanCopy
    );
  });

  it('getPlanFormValues can get original planForm', () => {
    const planForm = planFormValues as PlanFormFields;
    planForm.activities[0].actionDefinitionUri = '';

    const generatedPlan = generatePlanDefinition(planForm);
    const generatedPlanForm = getPlanFormValues(generatedPlan);

    expect(planForm).toEqual({
      ...generatedPlanForm,
      jurisdictions: [
        {
          id: '3952',
          name: 'Akros_2', // getPlanFormValues does not have access to the name
        },
      ],
      version: '1', // the version is updated so we change it back
    });
  });

  it('generatePlanDefinition can get original planDefinition', () => {
    const plan = plans[2];

    const generatedPlanForm = getPlanFormValues(plan);
    const generatedPlan = generatePlanDefinition(generatedPlanForm, plan);

    expect({ ...plan, experimental: false }).toEqual({
      ...generatedPlan,
      serverVersion: 1563494230144,
      version: '1',
    });
  });

  it('getPlanFormValues returns the correct value', () => {
    expect(getPlanFormValues(plans[0])).toEqual(planFormValues2);

    const plan = getPlanFormValues(plans[2]);
    // caseNum and opensrpEventId and taskGenerationStatus are gotten right
    expect(plan.caseNum).toEqual('1');
    expect(plan.opensrpEventId).toEqual('1');
    expect(plan.taskGenerationStatus).toEqual('True');
    // multiple jurisdictions are gotten right
    expect(getPlanFormValues(plans[1]).jurisdictions).toEqual([
      { id: '35968df5-f335-44ae-8ae5-25804caa2d86', name: '35968df5-f335-44ae-8ae5-25804caa2d86' },
      { id: '3952', name: '3952' },
      { id: 'ac7ba751-35e8-4b46-9e53-3cbaad193697', name: 'ac7ba751-35e8-4b46-9e53-3cbaad193697' },
    ]);
  });

  it('getGoalUnitFromActionCode works', () => {
    const expectedUnits: GoalUnit[] = [
      GoalUnit.ACTIVITY, // BCC
      GoalUnit.PERCENT, // IRS
      GoalUnit.PERCENT, // Bednet
      GoalUnit.PERSON, // Blood screening
      GoalUnit.CASE, // Case confirmation
      GoalUnit.PERCENT, // Register family
      GoalUnit.ACTIVITY, // Larval dipping
      GoalUnit.ACTIVITY, // Mosquito collection
      GoalUnit.UNKNOWN, // MDA Adherence  ==> TODO: figure out how to pass isDyanmic to getPlanActivityFromActionCode
      GoalUnit.PERCENT, // MDA Dispense
      GoalUnit.PERCENT, // MDA Adverse events
    ];
    for (let index = 0; index < PlanActionCodes.length; index++) {
      expect(getGoalUnitFromActionCode(PlanActionCodes[index])).toEqual(expectedUnits[index]);
    }
    expect(getGoalUnitFromActionCode('mosh' as PlanActionCodesType)).toEqual(GoalUnit.UNKNOWN);
  });

  it('onSubmitSuccess works if', () => {
    const setSubmittingMock = jest.fn();
    const addPlanMock = jest.fn();
    const setAreWeDoneHereMock = jest.fn();
    const payload = {
      ...generatePlanDefinition(getPlanFormValues(plans[1])),
      version: '2',
    };

    onSubmitSuccess(setSubmittingMock, setAreWeDoneHereMock, payload, addPlanMock);
    expect(addPlanMock).toHaveBeenLastCalledWith(payload);
    expect(setAreWeDoneHereMock).toHaveBeenLastCalledWith(true);
    expect(setSubmittingMock).toHaveBeenLastCalledWith(false);
  });

  it('onSubmitSuccess works correctly if addPlan is undefined', () => {
    const setSubmittingMock = jest.fn();
    const setAreWeDoneHereMock = jest.fn();
    const payload = {
      ...generatePlanDefinition(getPlanFormValues(plans[1])),
      version: '2',
    };

    onSubmitSuccess(setSubmittingMock, setAreWeDoneHereMock, payload);
    expect(setAreWeDoneHereMock).toHaveBeenLastCalledWith(true);
    expect(setSubmittingMock).toHaveBeenLastCalledWith(false);
  });

  it('getConditionFromFormField works correctly', () => {
    const { dynamicFamilyRegistration } = planActivities;
    const formPlan = extractActivityForForm(dynamicFamilyRegistration);
    expect(getConditionFromFormField(formPlan, dynamicFamilyRegistration)).toEqual(
      dynamicFamilyRegistration.action.condition
    );
  });

  it('isFIOrDynamicFI works correctly', () => {
    expect(isFIOrDynamicFI(InterventionType.FI)).toBeTruthy();
    expect(isFIOrDynamicFI(InterventionType.DynamicFI)).toBeTruthy();
    expect(isFIOrDynamicFI(InterventionType.IRS)).toBeFalsy();
  });

  it('getPlanFormValues missing fi reason', () => {
    // what is the eventual form initial values
    const res = getPlanFormValues(fiReasonTestPlan as PlanDefinition);
    expect(res.fiReason).toBeUndefined();
  });

  it('able to generate the correct task generationStatus value', () => {
    // when configured env is undefined
    let configuredEnv;
    let sampleDynamicPlan = cloneDeep((DynamicFIPlan as unknown) as PlanDefinition);
    let res = getTaskGenerationValue(configuredEnv, sampleDynamicPlan);
    expect(res).toEqual(undefined);

    // here everything is in the nominal case
    configuredEnv = 'internal';
    sampleDynamicPlan = cloneDeep((DynamicFIPlan as unknown) as PlanDefinition);
    res = getTaskGenerationValue(configuredEnv, sampleDynamicPlan);
    expect(res).toEqual('internal');

    // here the env is invalid
    configuredEnv = 'invalid';
    sampleDynamicPlan = cloneDeep((DynamicFIPlan as unknown) as PlanDefinition);
    res = getTaskGenerationValue(configuredEnv, sampleDynamicPlan);
    expect(res).toEqual(undefined);

    // here the plan is not dynamic
    configuredEnv = 'internal';
    sampleDynamicPlan = cloneDeep((fiReasonTestPlan as unknown) as PlanDefinition);
    res = getTaskGenerationValue(configuredEnv, sampleDynamicPlan);
    expect(res).toEqual(undefined);
  });

  it('getPlanFormValues gets the correct value for task generationStatus', () => {
    let sampleDynamicPlan = cloneDeep((DynamicFIPlan as unknown) as PlanDefinition);
    let res = getPlanFormValues(sampleDynamicPlan);
    expect(res.taskGenerationStatus).toEqual('True');

    sampleDynamicPlan = cloneDeep((DynamicFIPlan as unknown) as PlanDefinition);
    sampleDynamicPlan.useContext = [
      { code: 'interventionType', valueCodableConcept: 'Dynamic-FI' },
      { code: 'taskGenerationStatus', valueCodableConcept: 'internal' },
    ];
    res = getPlanFormValues(sampleDynamicPlan);
    expect(res.taskGenerationStatus).toEqual('internal');

    sampleDynamicPlan = cloneDeep((fiReasonTestPlan as unknown) as PlanDefinition);
    res = getPlanFormValues(sampleDynamicPlan);
    expect(res.taskGenerationStatus).toEqual('False');
  });
});
