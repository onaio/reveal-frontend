import MockDate from 'mockdate';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import {
  doesFieldHaveErrors,
  extractActivitiesFromPlanForm,
  extractActivityForForm,
  generatePlanDefinition,
  getFormActivities,
  getNameTitle,
  getPlanFormValues,
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
  values,
  values2,
  valuesWithJurisdiction,
} from './fixtures';

describe('containers/forms/PlanForm/helpers', () => {
  it('check extractActivityForForm returns the correct value for BCC', () => {
    expect(extractActivityForForm(planActivities.BCC)).toEqual(expectedActivity.BCC);
    expect(extractActivityForForm(planActivityWithEmptyfields.BCC)).toEqual(
      expectedActivityEmptyField.BCC
    );
  });

  it('check extractActivityForForm returns the correct value for IRS', () => {
    expect(extractActivityForForm(planActivities.bednetDistribution)).toEqual(
      expectedActivity.bednetDistribution
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.bednetDistribution)).toEqual(
      expectedActivityEmptyField.bednetDistribution
    );
  });

  it('check extractActivityForForm returns the correct value for bloodScreening', () => {
    expect(extractActivityForForm(planActivities.bloodScreening)).toEqual(
      expectedActivity.bloodScreening
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.bloodScreening)).toEqual(
      expectedActivityEmptyField.bloodScreening
    );
  });

  it('check extractActivityForForm returns the correct value for caseConfirmation', () => {
    expect(extractActivityForForm(planActivities.caseConfirmation)).toEqual(
      expectedActivity.caseConfirmation
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.caseConfirmation)).toEqual(
      expectedActivityEmptyField.caseConfirmation
    );
  });

  it('check extractActivityForForm returns the correct value for larvalDipping', () => {
    expect(extractActivityForForm(planActivities.larvalDipping)).toEqual(
      expectedActivity.larvalDipping
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.larvalDipping)).toEqual(
      expectedActivityEmptyField.larvalDipping
    );
  });

  it('check extractActivityForForm returns the correct value for familyRegistration', () => {
    expect(extractActivityForForm(planActivities.familyRegistration)).toEqual(
      expectedActivity.familyRegistration
    );
  });

  it('check extractActivityForForm returns the correct value for mosquitoCollection', () => {
    expect(extractActivityForForm(planActivities.mosquitoCollection)).toEqual(
      expectedActivity.mosquitoCollection
    );
    expect(extractActivityForForm(planActivityWithEmptyfields.mosquitoCollection)).toEqual(
      expectedActivityEmptyField.mosquitoCollection
    );
  });

  it('check getFormActivities returns the correct value', () => {
    expect(JSON.stringify(getFormActivities(planActivities))).toEqual(
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
          goalDue: '2019-05-20T21:00:00.000Z',
          goalPriority: 'medium-priority',
          goalValue: 1,
          timingPeriodEnd: '2019-05-23T21:00:00.000Z',
          timingPeriodStart: '2019-05-20T21:00:00.000Z',
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
          goalDue: '2019-08-29T21:00:00.000Z',
          goalPriority: 'medium-priority',
          goalValue: 100,
          timingPeriodEnd: '2019-08-29T21:00:00.000Z',
          timingPeriodStart: '2019-05-20T21:00:00.000Z',
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
          goalDue: '2019-08-29T21:00:00.000Z',
          goalPriority: 'medium-priority',
          goalValue: 100,
          timingPeriodEnd: '2019-08-29T21:00:00.000Z',
          timingPeriodStart: '2019-05-20T21:00:00.000Z',
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
          goalDue: '2019-05-27T21:00:00.000Z',
          goalPriority: 'medium-priority',
          goalValue: 100,
          timingPeriodEnd: '2019-05-27T21:00:00.000Z',
          timingPeriodStart: '2019-05-20T21:00:00.000Z',
        },
        {
          actionCode: 'Larval Dipping',
          actionDescription:
            'Perform a minimum of three larval dipping activities in the operational area',
          actionIden$ifier: '2482dfd7-8284-43c6-bea1-a03dcda71ff4',
          actionReason: 'Investigation',
          actionTitle: 'Larval Dipping',
          goalDescription:
            'Perform a minimum of three larval dipp$ng activities in the operational area',
          goalDue: '2019-05-27T21:00:00.000Z',
          goalPriority: 'medium-priority',
          goalValue: 3,
          timingPeriodEnd: '2019-05-27T21:00:00.000Z',
          timingPeriodStart: '2019-05-20T21:00:00.000Z',
        },
        {
          actionCode: 'Mosquito Collection',
          actionDescription:
            'Set a minimum of three mosquito collection traps and complete th$ mosquito collection process',
          actionIdentifier: '423f6665-5367-40be-855e-7c5e6941a0c3',
          actionReason: 'Investigation',
          actionTitle: 'Mosquito Collection',
          goalDescr$ption:
            'Set a minimum of three mosquito collection traps and complete the mosquito collection process',
          goalDue: '2019-05-27T21:00:00.000Z',
          goalPriority: 'medium-priori$y',
          goalValue: 3,
          timingPeriodEnd: '2019-05-27T21:00:00.000Z',
          timingPeriodStart: '2019-05-20T21:00:00.000Z',
        },
        {
          actionCode: 'BCC',
          actionDescription: 'Conduct BCC act$vity',
          actionIdentifier: 'c8fc89a9-cdd2-4746-8272-650883ae380e',
          actionReason: 'Investigation',
          actionTitle: 'Behaviour Change Communication',
          goalDescription: 'Com$lete at least 1 BCC activity for the operational area',
          goalDue: '2019-06-20T21:00:00.000Z',
          goalPriority: 'medium-priority',
          goalValue: 1,
          timingPeriodEnd: '2019-06-2$T21:00:00.000Z',
          timingPeriodStart: '2019-05-20T21:00:00.000Z',
        },
      ],
      caseNum: '',
      date: '2019-05-18T21:00:00.000Z',
      end: '2019-08-29T21:00:00.000Z',
      fiReason: 'Case-trigger$d',
      fiStatus: 'A2',
      identifier: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
      interventionType: 'FI',
      jurisdictions: [{ id: '3952', name: '3952' }],
      name: 'A2-Lusaka_$kros_Focus_2',
      opensrpEventId: undefined,
      start: '2019-05-19T21:00:00.000Z',
      status: 'active',
      title: 'A2-Lusaka Akros Test Focus 2',
      version: '1',
    });
  });
});
