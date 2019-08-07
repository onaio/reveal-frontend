import { extractActivityForForm } from '../helpers';
import {
  bccTestPlanActivity,
  bccTestPlanActivityWithEmptyfields,
  expectedActivity,
  expectedActivity2,
} from './fixtures';

describe('PlanForm/helpers', () => {
  it('check extractActivityForForm returns the correct value', () => {
    expect(extractActivityForForm(bccTestPlanActivity.BCC)).toEqual(expectedActivity);
    expect(extractActivityForForm(bccTestPlanActivityWithEmptyfields.BCC)).toEqual(
      expectedActivity2
    );
  });
});
