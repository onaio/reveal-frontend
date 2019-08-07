import { doesFieldHaveErrors, extractActivityForForm, getFormActivities } from '../helpers';
import {
  bccTestPlanActivity,
  bccTestPlanActivityWithEmptyfields,
  expectedActivity,
  expectedActivity2,
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
});
