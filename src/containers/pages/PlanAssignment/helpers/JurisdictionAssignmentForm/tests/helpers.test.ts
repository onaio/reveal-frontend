import MockDate from 'mockdate';
import { raZambiaNode } from '../../../../../../components/TreeWalker/tests/fixtures';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { getPayload } from '../helpers';
import { assignment4, assignment5, assignments } from './fixtures';

describe('PlanAssignment/helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.set('12/30/2019', 0);
  });

  it('works for new assignments', () => {
    if (!raZambiaNode) {
      fail();
    }

    const plan = plans[0];
    const selectedOrgs = ['1', '2', '3'];

    const payload = getPayload(selectedOrgs, plan, raZambiaNode);
    expect(payload).toEqual(assignments);
  });

  it('works for removing assignments', () => {
    if (!raZambiaNode) {
      fail();
    }

    const plan = plans[0];
    const initialOrgs = ['1', '2', '3'];
    const selectedOrgs = ['1'];

    const payload = getPayload(selectedOrgs, plan, raZambiaNode, initialOrgs);
    expect(payload).toEqual([
      assignments[0],
      {
        ...assignments[1],
        toDate: '2019-12-30T00:00:00+00:00',
      },
      {
        ...assignments[2],
        toDate: '2019-12-30T00:00:00+00:00',
      },
    ]);
  });

  it('works for removing and adding at the same time assignments', () => {
    if (!raZambiaNode) {
      fail();
    }

    const plan = plans[0];
    const initialOrgs = ['1', '2', '3'];
    const selectedOrgs = ['1', '4', '5'];

    const payload = getPayload(selectedOrgs, plan, raZambiaNode, initialOrgs);
    expect(payload).toEqual([
      assignments[0],
      assignment4,
      assignment5,
      {
        ...assignments[1],
        toDate: '2019-12-30T00:00:00+00:00',
      },
      {
        ...assignments[2],
        toDate: '2019-12-30T00:00:00+00:00',
      },
    ]);
  });

  it('does not allow duplicates', () => {
    if (!raZambiaNode) {
      fail();
    }

    const plan = plans[0];
    const initialOrgs = ['2', '3'];
    const selectedOrgs = ['1', '1', '1'];

    const payload = getPayload(selectedOrgs, plan, raZambiaNode, initialOrgs);
    expect(payload).toEqual([
      assignments[0],
      {
        ...assignments[1],
        toDate: '2019-12-30T00:00:00+00:00',
      },
      {
        ...assignments[2],
        toDate: '2019-12-30T00:00:00+00:00',
      },
    ]);
  });
});
