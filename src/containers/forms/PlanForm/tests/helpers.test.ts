import { extractActivityForForm, getFormActivities } from '../helpers';
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
});
