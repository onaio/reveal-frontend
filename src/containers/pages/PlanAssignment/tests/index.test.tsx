import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Loading from '../../../../components/page/Loading';
import { defaultWalkerProps } from '../../../../components/TreeWalker';
import { limitTree, raKashikishiHAHC } from '../../../../components/TreeWalker/tests/fixtures';
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

// register reducers
reducerRegistry.register(assignmentReducerName, assignmentReducer);
reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

const history = createBrowserHistory();

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
      [JSON.stringify(assignments), { status: 200 }],
      [JSON.stringify([organization1, organization2, organization3]), { status: 200 }],
      [JSON.stringify([plans[0]]), { status: 200 }]
    );

    const callBack: any = jest.fn();
    const orgs = [organization1, organization2, organization3];
    const props = {
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

    await flushPromises();
    wrapper.update();
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://reveal-stage.smartregister.org/opensrp/rest/organization/assignedLocationsAndPlans?plan=356b6b84-fc36-4389-a44a-2b038ed2f38d'
    );
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://reveal-stage.smartregister.org/opensrp/rest/organization'
    );
    expect(fetch.mock.calls[2][0]).toEqual(
      'https://reveal-stage.smartregister.org/opensrp/rest/plans/356b6b84-fc36-4389-a44a-2b038ed2f38d'
    );

    // expect(supersetServiceMock.mock.calls).toEqual([
    //   [
    //     1 /** this comes from the envs mock */,
    //     {
    //       adhoc_filters: [
    //         {
    //           clause: 'WHERE',
    //           comparator: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
    //           expressionType: 'SIMPLE',
    //           operator: '==',
    //           subject: 'jurisdiction_id',
    //         },
    //       ],
    //       row_limit: 1,
    //     },
    //   ],
    // ]);

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
});
