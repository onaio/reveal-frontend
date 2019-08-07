import { extractActivityForForm } from '../helpers';
import { bccTestPlanActivity, expectedActivity } from './fixtures';

describe('PlanForm/helpers', () => {
  it('check extractActivityForForm returns the correct value', () => {
    expect(extractActivityForForm(bccTestPlanActivity.BCC)).toEqual(expectedActivity);
  });
});
