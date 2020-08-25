import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import {
  raKashikishiHAHCNode,
  raKsh3Node,
  raLuapulaNode,
  raNchelengeNode,
  raZambiaNode,
} from '../../../../../../components/TreeWalker/tests/fixtures';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import {
  organization1,
  organization2,
  organization3,
} from '../../../../../../store/ducks/tests/fixtures';
import { assignments } from '../../JurisdictionAssignmentForm/tests/fixtures';
import { JurisdictionTableListView } from '../index';

const history = createBrowserHistory();

describe('PlanAssignment/JurisdictionTableListView', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('works as expected', async () => {
    if (!(raKsh3Node && raKashikishiHAHCNode && raNchelengeNode && raLuapulaNode && raZambiaNode)) {
      fail();
    }

    const callBack: any = jest.fn();
    const orgs = [organization1, organization2, organization3];
    const props = {
      assignments,
      currentChildren: [raKsh3Node],
      currentNode: raKashikishiHAHCNode,
      hierarchy: [raZambiaNode, raLuapulaNode, raNchelengeNode, raKashikishiHAHCNode],
      history,
      location: {
        hash: '',
        pathname: `/assign/${plans[0].identifier}/${raKashikishiHAHCNode.model.id}`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { jurisdictionId: raKashikishiHAHCNode.model.id, planId: plans[0].identifier },
        path: '/assign/:planId/:jurisdictionId',
        url: `/assign/${plans[0].identifier}/${raKashikishiHAHCNode.model.id}`,
      },
      organizations: orgs,
      plan: plans[0],
      submitCallBackFunc: callBack,
    };

    const wrapper = mount(
      <MemoryRouter
        initialEntries={[
          {
            pathname: `/assign/${plans[0].identifier}/${raKashikishiHAHCNode.id}`,
            search: '',
            state: {},
          },
        ]}
      >
        <JurisdictionTableListView {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(toJson(wrapper.find('thead'))).toMatchSnapshot('Table headers');
    expect(wrapper.find('EditOrgs').props()).toEqual({
      assignTeamsLabel: 'Assign Teams',
      cancelCallBackFunc: expect.any(Function),
      defaultValue: [],
      existingAssignments: [],
      jurisdiction: raKsh3Node,
      labels: {
        assignmentSuccess: 'Team(s) assignment updated successfully',
        close: 'Close',
        fieldError: 'Did not save successfully',
        loadFormError: 'Could not load the form.',
        save: 'Save',
        saving: 'Saving',
      },
      options: orgs.map(e => ({ label: e.name, value: e.identifier })),
      plan: plans[0],
      submitCallBackFunc: callBack,
      successNotifierBackFunc: expect.any(Function),
    });
    expect(toJson(wrapper.find('JurisdictionCell span'))).toMatchSnapshot('JurisdictionCell');
    wrapper.unmount();
  });
});
