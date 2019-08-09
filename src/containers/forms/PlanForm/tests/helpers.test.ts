import MockDate from 'mockdate';
import {
  doesFieldHaveErrors,
  extractActivitiesFromPlanForm,
  extractActivityForForm,
  getFormActivities,
} from '../helpers';
import {
  activities,
  bccTestPlanActivity,
  bccTestPlanActivityWithEmptyfields,
  expectedActivity,
  expectedActivity2,
  expectedExtractActivityFromPlanformResult,
  extractedActivitiesFromForms,
  planActivities,
} from './fixtures';

describe('PlanForm/helpers', () => {
  it('check extractActivityForForm returns the correct value', () => {
    expect(extractActivityForForm(bccTestPlanActivity.BCC)).toEqual(expectedActivity);
    expect(extractActivityForForm(bccTestPlanActivityWithEmptyfields.BCC)).toEqual(
      expectedActivity2
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
});
