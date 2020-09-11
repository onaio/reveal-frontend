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
import { JurisdictionTableView } from '../index';

const history = createBrowserHistory();

describe('PlanAssignment/JurisdictionTableView', () => {
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
        <JurisdictionTableView {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(toJson(wrapper.find('HelmetWrapper'))).toMatchSnapshot('helmet');
    expect(toJson(wrapper.find('.page-title'))).toMatchSnapshot('page-title');
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('Breadcrumbs');
    wrapper.unmount();
  });
});
