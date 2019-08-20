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
  planFormValues2,
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

  it('generatePlanDefinition can get original planDefinition', () => {
    const plan = plans[2];

    const generatedPlanForm = getPlanFormValues(plan);
    const generatedPlan = generatePlanDefinition(generatedPlanForm, plan);

    expect(plan).toEqual({
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
});
