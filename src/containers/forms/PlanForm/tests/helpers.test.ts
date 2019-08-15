import MockDate from 'mockdate';
import moment from 'moment';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import {
  doesFieldHaveErrors,
  extractActivitiesFromPlanForm,
  extractActivityForForm,
  generatePlanDefinition,
  getFormActivities,
  getNameTitle,
  getPlanFormValues,
  PlanFormFields,
} from '../helpers';
import {
  activities,
  event,
  event2,
  event3,
  expectedActivity,
  expectedActivityEmptyField,
  expectedExtractActivityFromPlanformResult,
  expectedPlanDefinition,
  extractedActivitiesFromForms,
  planActivities,
  planActivityWithEmptyfields,
  planFormValues,
  values,
  values2,
  valuesWithJurisdiction,
} from './fixtures';

describe('containers/forms/PlanForm/helpers', () => {
  // it('check extractActivityForForm returns the correct value for BCC', () => {
  //   expect(extractActivityForForm(planActivities.BCC)).toEqual(expectedActivity.BCC);
  //   expect(extractActivityForForm(planActivityWithEmptyfields.BCC)).toEqual(
  //     expectedActivityEmptyField.BCC
  //   );
  // });

  // it('check extractActivityForForm returns the correct value for IRS', () => {
  //   expect(extractActivityForForm(planActivities.bednetDistribution)).toEqual(
  //     expectedActivity.bednetDistribution
  //   );
  //   expect(extractActivityForForm(planActivityWithEmptyfields.bednetDistribution)).toEqual(
  //     expectedActivityEmptyField.bednetDistribution
  //   );
  // });

  // it('check extractActivityForForm returns the correct value for bloodScreening', () => {
  //   expect(extractActivityForForm(planActivities.bloodScreening)).toEqual(
  //     expectedActivity.bloodScreening
  //   );
  //   expect(extractActivityForForm(planActivityWithEmptyfields.bloodScreening)).toEqual(
  //     expectedActivityEmptyField.bloodScreening
  //   );
  // });

  // it('check extractActivityForForm returns the correct value for caseConfirmation', () => {
  //   expect(extractActivityForForm(planActivities.caseConfirmation)).toEqual(
  //     expectedActivity.caseConfirmation
  //   );
  //   expect(extractActivityForForm(planActivityWithEmptyfields.caseConfirmation)).toEqual(
  //     expectedActivityEmptyField.caseConfirmation
  //   );
  // });

  // it('check extractActivityForForm returns the correct value for larvalDipping', () => {
  //   expect(extractActivityForForm(planActivities.larvalDipping)).toEqual(
  //     expectedActivity.larvalDipping
  //   );
  //   expect(extractActivityForForm(planActivityWithEmptyfields.larvalDipping)).toEqual(
  //     expectedActivityEmptyField.larvalDipping
  //   );
  // });

  // it('check extractActivityForForm returns the correct value for familyRegistration', () => {
  //   expect(extractActivityForForm(planActivities.familyRegistration)).toEqual(
  //     expectedActivity.familyRegistration
  //   );
  // });

  // it('check extractActivityForForm returns the correct value for mosquitoCollection', () => {
  //   expect(extractActivityForForm(planActivities.mosquitoCollection)).toEqual(
  //     expectedActivity.mosquitoCollection
  //   );
  //   expect(extractActivityForForm(planActivityWithEmptyfields.mosquitoCollection)).toEqual(
  //     expectedActivityEmptyField.mosquitoCollection
  //   );
  // });

  // it('check getFormActivities returns the correct value', () => {
  //   expect(JSON.stringify(getFormActivities(planActivities))).toEqual(
  //     JSON.stringify(extractedActivitiesFromForms)
  //   );
  // });

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
    MockDate.reset();
  });

  it('getPlanFormValues can get original planForm', () => {
    const planForm = planFormValues as PlanFormFields;

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

  it('getPlanFormValues returns the correct value', () => {
    expect(getPlanFormValues(plans[0])).toEqual({
      activities: [
        {
          actionCode: 'Case Confirmation',
          actionDescription: 'Confirm the index case',
          actionIdentifier: 'c711ae51-6432-4b68-84c3-d2b5b1fd1948',
          actionReason: 'Investigation',
          actionTitle: 'Case Confirmation',
          goalDescription: 'Confirm the index case',
          goalDue: moment('2019-05-21T00:00:00.000Z').toDate(),
          goalPriority: 'medium-priority',
          goalValue: 1,
          timingPeriodEnd: moment('2019-05-24T00:00:00.000Z').toDate(),
          timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
        },
        {
          actionCode: 'RACD Register Family',
          actionDescription:
            'Register all families & famiy members in all residential structures enumerated (100%) within the operational area',
          actionIdentifier: '402b8c13-6774-4515-929f-48e71a61a379',
          actionReason: 'Investigation',
          actionTitle: 'Family Registration',
          goalDescription:
            'Register all families and family members in all residential structures enumerated or added (100%) within operational area',
          goalDue: moment('2019-08-30T00:00:00.000Z').toDate(),
          goalPriority: 'medium-priority',
          goalValue: 100,
          timingPeriodEnd: moment('2019-08-30T00:00:00.000Z').toDate(),
          timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
        },
        {
          actionCode: 'Bednet Distribution',
          actionDescription:
            'Visit 100% of residential structures in the operational area and provide nets',
          actionIdentifier: '1bd830ea-50e3-44dc-b855-9d5e9339e2be',
          actionReason: 'Routine',
          actionTitle: 'Bednet Distribution',
          goalDescription:
            'Visit 100% of residential structures in the operational area and provide nets',
          goalDue: moment('2019-08-30T00:00:00.000Z').toDate(),
          goalPriority: 'medium-priority',
          goalValue: 100,
          timingPeriodEnd: moment('2019-08-30T00:00:00.000Z').toDate(),
          timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
        },
        {
          actionCode: 'Blood Screening',
          actionDescription:
            'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
          actionIdentifier: '2303a70e-4e3f-4fb9-a430-f0476010bfb5',
          actionReason: 'Investigation',
          actionTitle: 'RACD Blood screening',
          goalDescription:
            'Visit all residential structures (100%) within a 1 km radius of a confirmed index case and test each registered person',
          goalDue: moment('2019-05-28T00:00:00.000Z').toDate(),
          goalPriority: 'medium-priority',
          goalValue: 100,
          timingPeriodEnd: moment('2019-05-28T00:00:00.000Z').toDate(),
          timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
        },
        {
          actionCode: 'Larval Dipping',
          actionDescription:
            'Perform a minimum of three larval dipping activities in the operational area',
          actionIdentifier: '2482dfd7-8284-43c6-bea1-a03dcda71ff4',
          actionReason: 'Investigation',
          actionTitle: 'Larval Dipping',
          goalDescription:
            'Perform a minimum of three larval dipping activities in the operational area',
          goalDue: moment('2019-05-28T00:00:00.000Z').toDate(),
          goalPriority: 'medium-priority',
          goalValue: 3,
          timingPeriodEnd: moment('2019-05-28T00:00:00.000Z').toDate(),
          timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
        },
        {
          actionCode: 'Mosquito Collection',
          actionDescription:
            'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
          actionIdentifier: '423f6665-5367-40be-855e-7c5e6941a0c3',
          actionReason: 'Investigation',
          actionTitle: 'Mosquito Collection',
          goalDescription:
            'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
          goalDue: moment('2019-05-28T00:00:00.000Z').toDate(),
          goalPriority: 'medium-priority',
          goalValue: 3,
          timingPeriodEnd: moment('2019-05-28T00:00:00.000Z').toDate(),
          timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
        },
        {
          actionCode: 'BCC',
          actionDescription: 'Conduct BCC activity',
          actionIdentifier: 'c8fc89a9-cdd2-4746-8272-650883ae380e',
          actionReason: 'Investigation',
          actionTitle: 'Behaviour Change Communication',
          goalDescription: 'Complete at least 1 BCC activity for the operational area',
          goalDue: moment('2019-06-21T00:00:00.000Z').toDate(),
          goalPriority: 'medium-priority',
          goalValue: 1,
          timingPeriodEnd: moment('2019-06-21T00:00:00.000Z').toDate(),
          timingPeriodStart: moment('2019-05-21T00:00:00.000Z').toDate(),
        },
      ],
      caseNum: '',
      date: moment('2019-05-19T00:00:00.000Z').toDate(),
      end: moment('2019-08-30T00:00:00.000Z').toDate(),
      fiReason: 'Case-triggered',
      fiStatus: 'A2',
      identifier: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
      interventionType: 'FI',
      jurisdictions: [{ id: '3952', name: '3952' }],
      name: 'A2-Lusaka_Akros_Focus_2',
      opensrpEventId: undefined,
      start: moment('2019-05-20T00:00:00.000Z').toDate(),
      status: 'active',
      title: 'A2-Lusaka Akros Test Focus 2',
      version: '1',
    });

    const plan = getPlanFormValues(plans[2]);
    // caseNum and opensrpEventId are gotten right
    expect(plan.caseNum).toEqual('1');
    expect(plan.opensrpEventId).toEqual('1');
    // multiple jurisdictions are gotten right
    expect(getPlanFormValues(plans[1]).jurisdictions).toEqual([
      { id: '35968df5-f335-44ae-8ae5-25804caa2d86', name: '35968df5-f335-44ae-8ae5-25804caa2d86' },
      { id: '3952', name: '3952' },
      { id: 'ac7ba751-35e8-4b46-9e53-3cbaad193697', name: 'ac7ba751-35e8-4b46-9e53-3cbaad193697' },
    ]);
  });
});
