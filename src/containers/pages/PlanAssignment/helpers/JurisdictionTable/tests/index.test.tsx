import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  raKashikishiHAHC,
  raKsh3,
  raLuapula,
  raNchelenge,
  raZambia,
} from '../../../../../../components/TreeWalker/tests/fixtures';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import {
  organization1,
  organization2,
  organization3,
} from '../../../../../../store/ducks/tests/fixtures';
import { assignments } from '../../JurisdictionAssignmentForm/tests/fixtures';
import { JurisdictionTable } from '../index';

const history = createBrowserHistory();

describe('PlanAssignment/JurisdictionTable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.mockClear();
    fetchMock.resetMocks();
  });

  it('works as expected', async () => {
    // const cancelMock: any = jest.fn();
    const callBack: any = jest.fn();
    const orgs = [organization1, organization2, organization3];
    const props = {
      assignments,
      currentChildren: [raKsh3],
      currentNode: raKashikishiHAHC,
      hierarchy: [raZambia, raLuapula, raNchelenge, raKashikishiHAHC],
      history,
      location: {
        hash: '',
        pathname: `/assign/${plans[0].identifier}/3051`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: { jurisdictionId: raKashikishiHAHC.id, planId: 'plans[0].identifier' },
        path: '/assign/:planId/:jurisdictionId',
        url: `/assign/${plans[0].identifier}/${raKashikishiHAHC.id}`,
      },
      organizations: orgs,
      plan: plans[0],
      submitCallBackFunc: callBack,
    };

    const wrapper = mount(
      <MemoryRouter
        initialEntries={[
          {
            pathname: `/assign/${plans[0].identifier}/${raKashikishiHAHC.id}`,
            search: '',
            state: {},
          },
        ]}
      >
        <JurisdictionTable {...props} />
      </MemoryRouter>
    );

    await flushPromises();
    wrapper.update();

    expect(toJson(wrapper.find('HelmetWrapper'))).toMatchSnapshot('helmet');
    expect(toJson(wrapper.find('.page-title'))).toMatchSnapshot('page-title');
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('Breadcrumbs');
    expect(toJson(wrapper.find('thead'))).toMatchSnapshot('Table headers');
    expect(toJson(wrapper.find('AssignedOrgs span'))).toMatchSnapshot('AssignedOrgs');
    expect(wrapper.find('EditOrgs').props()).toEqual({
      assignTeamsLabel: 'Assign Teams',
      cancelCallBackFunc: expect.any(Function),
      defaultValue: [],
      existingAssignments: [],
      jurisdiction: raKsh3,
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
