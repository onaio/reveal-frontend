import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedAssignPractitioner, { AssignPractitioner } from '..';
import { ASSIGN_PRACTITIONERS_URL } from '../../../../../constants';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import organizationsReducer, {
  fetchOrganizations,
  reducerName as organizationReducerName,
} from '../../../../../store/ducks/opensrp/organizations';
import practitionersReducer, {
  fetchPractitionerRoles,
  getPractitionersByOrgId,
  reducerName as practitionerReducerName,
} from '../../../../../store/ducks/opensrp/practitioners';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

reducerRegistry.register(organizationReducerName, organizationsReducer);
reducerRegistry.register(practitionerReducerName, practitionersReducer);

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/pages/*/AssignPractitioners', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  //   it('render without crashing', () => {
  //     fetch
  //       .once(JSON.stringify(fixtures.allPractitioners))
  //       .once(JSON.stringify(fixtures.org3Practitioners))
  //       .once(JSON.stringify(fixtures.organization3))

  //     const mock: any = jest.fn();
  //     const props = {
  //       fetchOrganizationsCreator: fetchOrganizations,
  //       history,
  //       location: mock,
  //       match: {
  //         isExact: true,
  //         params: { id: fixtures.organization1.identifier },
  //         path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
  //         url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization1.identifier}`,
  //       },
  //       organization: fixtures.organization1,
  //       serviceClass: OpenSRPService,
  //     };

  //     shallow(
  //       <Router history={history}>
  //         <AssignPractitioner {...props} />
  //       </Router>
  //     );
  //   });

  it('Works well with store', async () => {
    // interest here is if we component receives correct props
    fetch
      // .once(JSON.stringify(fixtures.allPractitioners))
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify(fixtures.org3Practitioners));

    const mock: any = jest.fn();
    const props = {
      fetchOrganizationsCreator: fetchOrganizations,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization3.identifier },
        path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
        url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization3.identifier}`,
      },
      organization: fixtures.organization1,
      serviceClass: OpenSRPService,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAssignPractitioner {...props} />
        </Router>
      </Provider>
    );

    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    const theProps = wrapper.find('AssignedPractitioner').props() as any;
    expect(theProps.organization).toEqual(fixtures.organization3);
    expect(theProps.assignedPractitioners).toEqual(fixtures.org3Practitioners);
  });

  // it('Works well with store', async () => {
  //   // interest here is if we have crucial page components
  //   fetch
  //     // .once(JSON.stringify(fixtures.allPractitioners))
  //     .once(JSON.stringify(fixtures.organization3))
  //     .once(JSON.stringify(fixtures.org3Practitioners));

  //   const mock: any = jest.fn();
  //   const props = {
  //     fetchOrganizationsCreator: fetchOrganizations,
  //     history,
  //     location: mock,
  //     match: {
  //       isExact: true,
  //       params: { id: fixtures.organization3.identifier },
  //       path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
  //       url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization3.identifier}`,
  //     },
  //     organization: fixtures.organization1,
  //     serviceClass: OpenSRPService,
  //   };

  //   const wrapper = mount(
  //     <Provider store={store}>

  //     <Router history={history}>
  //       <ConnectedAssignPractitioner {...props} />
  //     </Router>
  //     </Provider>
  //   );

  //   // expect(store.getState()[practitionerReducerName]).toEqual({});
  //   await new Promise(resolve => setImmediate(resolve));
  //   await flushPromises();
  //   wrapper.update();
  //   // expect(wrapper.find('span.assigned-options').length).toEqual(3)

  //   // expect(fetch.mock.calls).toEqual([]);
  //   // expect(store.getState()[practitionerReducerName]).toEqual({});
  //   // expect(getPractitionersByOrgId(store.getState(), fixtures.organization3.identifier)).toEqual([])

  //   expect(toJson(wrapper)).toMatchSnapshot('Everything');
  //   // expect(store.getState()[practitionerReducerName]).toEqual({});
  // });

  // it('Works welll with store', () => {
  //   // interest here is if we have crucial page components
  // });
});

