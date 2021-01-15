import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import Loading from '../../../../components/page/Loading';
import { defaultWalkerProps } from '../../../../components/TreeWalker';
import {
  locationsHierarchy,
  locationTree,
  raKashikishiHAHCNode,
} from '../../../../components/TreeWalker/tests/fixtures';
import { OpenSRPService } from '../../../../services/opensrp';
import assignmentReducer, {
  fetchAssignments,
  reducerName as assignmentReducerName,
} from '../../../../store/ducks/opensrp/assignments';
import hierarchyReducer, {
  fetchTree,
  reducerName as hierarchyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
import organizationsReducer, {
  fetchOrganizations,
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/opensrp/organizations';
import planDefinitionReducer, {
  addPlanDefinition,
  reducerName as planDefinitionReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import {
  organization1,
  organization2,
  organization3,
} from '../../../../store/ducks/tests/fixtures';
import { assignments } from '../helpers/JurisdictionAssignmentForm/tests/fixtures';
import { isMapDisabled, PlanAssignment } from '../index';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env', () => ({
  ASSIGNED_TEAMS_REQUEST_PAGE_SIZE: 1000,
  ASSIGNMENT_PAGE_SHOW_MAP: false,
  MAP_DISABLED_PLAN_TYPES: ['FI'],
  OPENSRP_API_BASE_URL: 'https://test.smartregister.org/opensrp/rest/',
}));

jest.mock('../../AssigmentMapWrapper', () => {
  const mockComponent = (_: any) => <div id="mockComponent">Assignment Map wrapper</div>;
  return {
    ConnectedAssignmentMapWrapper: mockComponent,
  };
});

// register reducers
reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);
reducerRegistry.register(hierarchyReducerName, hierarchyReducer);

const history = createBrowserHistory();
const callBack: any = jest.fn();
const orgs = [organization1, organization2, organization3];
const baseProps = {
  ...defaultWalkerProps,
  addPlanActionCreator: addPlanDefinition,
  assignments,
  fetchAssignmentsActionCreator: fetchAssignments,
  fetchOrganizationsActionCreator: fetchOrganizations,
  history,
  location: {
    hash: '',
    pathname: `/assign/${plans[0].identifier}/${raKashikishiHAHCNode &&
      raKashikishiHAHCNode.model.id}`,
    search: '',
    state: {},
  },
  match: {
    isExact: true,
    params: {
      jurisdictionId: raKashikishiHAHCNode ? raKashikishiHAHCNode.model.id : 'nope',
      planId: plans[0].identifier,
    },
    path: '/assign/:planId/:jurisdictionId',
    url: `/assign/${plans[0].identifier}/${raKashikishiHAHCNode && raKashikishiHAHCNode.model.id}`,
  },
  organizations: orgs,
  plan: plans[0],
  submitCallBackFunc: callBack,
  tree: locationTree,
};

describe('PlanAssignment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.mockClear();
    fetchMock.resetMocks();
  });

  it('works as expected', async () => {
    fetch.mockResponses(
      /** Get plan hierarchy */
      [JSON.stringify(locationsHierarchy), { status: 200 }],
      /** These calls are made by PlanAssignment */
      [JSON.stringify(assignments), { status: 200 }],
      [JSON.stringify([organization1, organization2, organization3]), { status: 200 }],
      [JSON.stringify([plans[0]]), { status: 200 }]
    );

    const props = {
      ...baseProps,
    };

    const wrapper = mount(
      <MemoryRouter
        initialEntries={[
          {
            pathname: `/assign/${plans[0].identifier}/${raKashikishiHAHCNode &&
              raKashikishiHAHCNode.model.id}`,
            search: '',
            state: {},
          },
        ]}
      >
        <PlanAssignment {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/location/hierarchy/plan/356b6b84-fc36-4389-a44a-2b038ed2f38d?return_structure_count=false'
    );
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization/assignedLocationsAndPlans?pageNumber=1&pageSize=1000&plan=356b6b84-fc36-4389-a44a-2b038ed2f38d'
    );
    expect(fetch.mock.calls[2][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization'
    );
    expect(fetch.mock.calls[3][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/plans/356b6b84-fc36-4389-a44a-2b038ed2f38d'
    );

    const wrapperProps = {
      LoadingIndicator: Loading,
      OpenSRPServiceClass: OpenSRPService,
      addPlanActionCreator: addPlanDefinition,
      apiEndPoints: {
        findByJurisdictionIds: 'location/findByJurisdictionIds',
        findByProperties: 'location/findByProperties',
        location: 'location',
      },
      assignments,
      currentChildren: [],
      currentNode: null,
      fetchAssignmentsActionCreator: fetchAssignments,
      fetchOrganizationsActionCreator: fetchOrganizations,
      fetchTreeActionCreator: fetchTree,
      getAncestorsFunc: expect.any(Function),
      getChildrenFunc: expect.any(Function),
      hideBottomBreadCrumb: false,
      hierarchy: [],
      history: expect.any(Object),
      jurisdictionId: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
      labels: {
        loadAncestorsError: 'Could not load parents',
        loadChildrenError: 'Could not load children',
      },
      loadChildren: expect.any(Function),
      location: expect.any(Object),
      match: expect.any(Object),
      organizations: orgs,
      params: {
        is_jurisdiction: true,
        return_geometry: false,
      },
      plan: plans[0],
      propertyFilters: {
        status: 'Active',
      },
      serviceClass: expect.any(Function),
      submitCallBackFunc: expect.any(Function),
      tree: locationTree,
      useJurisdictionNodeType: false,
    };

    // test jurisdiction table view props
    expect(
      wrapper
        .find('TreeWalker')
        .at(0)
        .props()
    ).toEqual(wrapperProps);

    // test jurisdiction table list view props
    expect(
      wrapper
        .find('TreeWalker')
        .at(1)
        .props()
    ).toEqual(wrapperProps);

    expect(wrapper.find('#mockComponent').length).toEqual(0);

    wrapper.unmount();
  });

  it('requires plan id to work', async () => {
    const props = {
      ...baseProps,
      location: {
        hash: '',
        pathname: `/assign`,
        search: '',
        state: {},
      },
      match: {
        isExact: true,
        params: {},
        path: '/assign',
        url: `/assign`,
      },
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanAssignment {...(props as any)} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(toJson(wrapper.find('PlanAssignment').children())).toMatchSnapshot('no plan id');
  });

  it('shows an error message if no plan jurisdiction hierarchy', async () => {
    fetch.mockResponses(
      [JSON.stringify({}), { status: 400 }],
      [JSON.stringify(assignments), { status: 200 }],
      [JSON.stringify([organization1, organization2, organization3]), { status: 200 }],
      [JSON.stringify([plans[0]]), { status: 200 }]
    );

    const props = {
      ...baseProps,
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanAssignment {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(toJson(wrapper.find('.global-error-container'))).toMatchSnapshot(
      'no plan jurisdiction hierarchy'
    );
  });

  it('shows an error message if no organizations', async () => {
    fetch.mockResponses(
      [JSON.stringify(locationsHierarchy), { status: 200 }],
      [JSON.stringify(assignments), { status: 200 }],
      [JSON.stringify([]), { status: 400 }],
      [JSON.stringify([plans[0]]), { status: 200 }]
    );

    const props = {
      ...baseProps,
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanAssignment {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(toJson(wrapper.find('.global-error-container'))).toMatchSnapshot('no orgs');
  });

  it('shows an error message if no plan', async () => {
    fetch.mockResponses(
      [JSON.stringify(locationsHierarchy), { status: 200 }],
      [JSON.stringify(assignments), { status: 200 }],
      [JSON.stringify([]), { status: 200 }],
      [JSON.stringify([]), { status: 400 }]
    );

    const props = {
      ...baseProps,
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanAssignment {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(toJson(wrapper.find('.global-error-container'))).toMatchSnapshot('no orgs');
  });

  it('map disabled returns true', () => {
    const disabled = isMapDisabled(baseProps.plan);
    expect(disabled).toEqual(true);
  });

  it('is map disabled helper when team assignment map env is disabled', () => {
    const mockPlan = { ...plans[1] }; // plan-type is whitelisted to show map
    const disabled = isMapDisabled(mockPlan);
    expect(disabled).toEqual(true);
  });
});
