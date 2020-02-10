import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { SINGLE_ORGANIZATION_URL } from '../../../../../constants';
import store from '../../../../../store';
import * as organizationDucks from '../../../../../store/ducks/opensrp/organizations';
import * as practitionersDucks from '../../../../../store/ducks/opensrp/practitioners';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedSingleOrgView from '../../SingleOrganizationView';
import { selectorState } from './fixtures';

reducerRegistry.register(practitionersDucks.reducerName, practitionersDucks.default);

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/../singleOrganization.selectors', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(practitionersDucks.removePractitionersAction);
    store.dispatch(practitionersDucks.removePractitionerRolesAction);
  });

  it('selectors are called with the correct arguments', async () => {
    // calls selectors correctly
    const organizationByIdMock = jest.spyOn(organizationDucks, 'getOrganizationById');
    const practitionerByOrgIdMock = jest.spyOn(practitionersDucks, 'getPractitionersByOrgId');

    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify(fixtures.org3Practitioners));

    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: `${fixtures.organization3.identifier}` },
        path: `${SINGLE_ORGANIZATION_URL}/:id`,
        url: `${SINGLE_ORGANIZATION_URL}/1`,
      },
    };
    mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleOrgView {...props} />
        </Router>
      </Provider>
    );

    await new Promise<any>(resolve => setImmediate(resolve));

    expect(organizationByIdMock).toHaveBeenCalledTimes(7);
    expect(organizationByIdMock.mock.calls[3][0]).toEqual(selectorState);
    expect(organizationByIdMock.mock.calls[3][1]).toEqual('d23f7350-d406-11e9-bb65-2a2ae2dbcce4');
    expect(practitionerByOrgIdMock.mock.calls[3][0]).toEqual(selectorState);
    expect(practitionerByOrgIdMock.mock.calls[3][1]).toEqual(
      'd23f7350-d406-11e9-bb65-2a2ae2dbcce4'
    );
  });
});
