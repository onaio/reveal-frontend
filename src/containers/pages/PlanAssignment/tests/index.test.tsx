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
  limitTree,
  raKashikishiHAHC,
  raKsh2,
  raKsh3,
  raLuapula,
  raNchelenge,
  raZambia,
} from '../../../../components/TreeWalker/tests/fixtures';
import { OpenSRPService } from '../../../../services/opensrp';
import assignmentReducer, {
  fetchAssignments,
  reducerName as assignmentReducerName,
} from '../../../../store/ducks/opensrp/assignments';
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
import { PlanAssignment } from '../index';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env');

// register reducers
reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

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
    pathname: `/assign/${plans[0].identifier}/${raKashikishiHAHC.id}`,
    search: '',
    state: {},
  },
  match: {
    isExact: true,
    params: { jurisdictionId: raKashikishiHAHC.id, planId: plans[0].identifier },
    path: '/assign/:planId/:jurisdictionId',
    url: `/assign/${plans[0].identifier}/${raKashikishiHAHC.id}`,
  },
  organizations: orgs,
  plan: plans[0],
  submitCallBackFunc: callBack,
};

describe('PlanAssignment', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.mockClear();
    fetchMock.resetMocks();
  });

  it('works as expected', async () => {
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => limitTree);

    fetch.mockResponses(
      /** These calls are made by PlanAssignment */
      [JSON.stringify(assignments), { status: 200 }],
      [JSON.stringify([organization1, organization2, organization3]), { status: 200 }],
      [JSON.stringify([plans[0]]), { status: 200 }],
      /** These next calls represent TreeWalker building the location hierarchy */
      [JSON.stringify(raKashikishiHAHC), { status: 200 }],
      [JSON.stringify([raKsh2, raKsh3]), { status: 200 }],
      [JSON.stringify(raNchelenge), { status: 200 }],
      [JSON.stringify(raLuapula), { status: 200 }],
      [JSON.stringify(raZambia), { status: 200 }]
    );

    const props = {
      ...baseProps,
      supersetService: supersetServiceMock,
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
        <PlanAssignment {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization/assignedLocationsAndPlans?plan=356b6b84-fc36-4389-a44a-2b038ed2f38d'
    );
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization'
    );
    expect(fetch.mock.calls[2][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/plans/356b6b84-fc36-4389-a44a-2b038ed2f38d'
    );

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        5,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '356b6b84-fc36-4389-a44a-2b038ed2f38d',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 15000,
        },
      ],
    ]);

    expect(wrapper.find('TreeWalker').props()).toEqual({
      LoadingIndicator: Loading,
      OpenSRPServiceClass: OpenSRPService,
      addPlanActionCreator: addPlanDefinition,
      assignments,
      currentChildren: [],
      currentNode: null,
      fetchAssignmentsActionCreator: fetchAssignments,
      fetchOrganizationsActionCreator: fetchOrganizations,
      getAncestorsFunc: expect.any(Function),
      getChildrenFunc: expect.any(Function),
      hierarchy: [],
      history: expect.any(Object),
      jurisdictionId: '8d44d54e-8b4c-465c-9e93-364a25739a6d',
      labels: {
        loadAncestorsError: 'Could not load parents',
      },
      limits: limitTree,
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
      readAPIEndpoint: 'location',
      serviceClass: expect.any(Function),
      submitCallBackFunc: expect.any(Function),
      supersetService: supersetServiceMock,
    });
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
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => undefined);

    fetch.mockResponses(
      [JSON.stringify(assignments), { status: 200 }],
      [JSON.stringify([organization1, organization2, organization3]), { status: 200 }],
      [JSON.stringify([plans[0]]), { status: 200 }]
    );

    const props = {
      ...baseProps,
      supersetService: supersetServiceMock,
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
});
