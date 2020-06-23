import MockDate from 'mockdate';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { getPayload } from '../helpers';
import { openSRPJurisdiction } from './fixtures';

describe('PlanAssignment/helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.set('12/30/2019', 0);
  });

  it('check extractActivityForForm returns the correct value for BCC', () => {
    const plan = plans[0];
    const selectedOrgs = ['1', '2', '3'];

    const payload = getPayload(selectedOrgs, plan, openSRPJurisdiction);
    expect(payload).toEqual([
      {
        fromDate: '2019-12-30T00:00:00+00:00',
        jurisdiction: '3091',
        organization: '1',
        plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
        toDate: '2019-08-30T00:00:00+00:00',
      },
      {
        fromDate: '2019-12-30T00:00:00+00:00',
        jurisdiction: '3091',
        organization: '2',
        plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
        toDate: '2019-08-30T00:00:00+00:00',
      },
      {
        fromDate: '2019-12-30T00:00:00+00:00',
        jurisdiction: '3091',
        organization: '3',
        plan: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
        toDate: '2019-08-30T00:00:00+00:00',
      },
    ]);
  });
});
