import MockDate from 'mockdate';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { getPayload } from '../helpers';
import { assignment4, assignment5, assignments, openSRPJurisdiction } from './fixtures';

describe('PlanAssignment/helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.set('12/30/2019', 0);
  });

  it('works for new assignments', () => {
    const plan = plans[0];
    const selectedOrgs = ['1', '2', '3'];

    const payload = getPayload(selectedOrgs, plan, openSRPJurisdiction);
    expect(payload).toEqual(assignments);
  });

  it('works for removing assignments', () => {
    const plan = plans[0];
    const initialOrgs = ['1', '2', '3'];
    const selectedOrgs = ['1'];

    const payload = getPayload(selectedOrgs, plan, openSRPJurisdiction, initialOrgs);
    expect(payload).toEqual([
      assignments[0],
      {
        ...assignments[1],
        toDate: '2019-12-29T00:00:00+00:00',
      },
      {
        ...assignments[2],
        toDate: '2019-12-29T00:00:00+00:00',
      },
    ]);
  });

  it('works for removing and adding at the same time assignments', () => {
    const plan = plans[0];
    const initialOrgs = ['1', '2', '3'];
    const selectedOrgs = ['1', '4', '5'];

    const payload = getPayload(selectedOrgs, plan, openSRPJurisdiction, initialOrgs);
    expect(payload).toEqual([
      assignments[0],
      assignment4,
      assignment5,
      {
        ...assignments[1],
        toDate: '2019-12-29T00:00:00+00:00',
      },
      {
        ...assignments[2],
        toDate: '2019-12-29T00:00:00+00:00',
      },
    ]);
  });

  it('does not allow duplicates', () => {
    const plan = plans[0];
    const initialOrgs = ['2', '3'];
    const selectedOrgs = ['1', '1', '1'];

    const payload = getPayload(selectedOrgs, plan, openSRPJurisdiction, initialOrgs);
    expect(payload).toEqual([
      assignments[0],
      {
        ...assignments[1],
        toDate: '2019-12-29T00:00:00+00:00',
      },
      {
        ...assignments[2],
        toDate: '2019-12-29T00:00:00+00:00',
      },
    ]);
  });
});
