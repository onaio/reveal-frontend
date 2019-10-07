import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { AssignPractitioner } from '..';
import { ASSIGN_PRACTITIONERS_URL } from '../../../../../constants';
import { OpenSRPService } from '../../../../../services/opensrp';
import { fetchOrganizations } from '../../../../../store/ducks/opensrp/organizations';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/pages/*/AssignPractitioners', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('render without crashing', () => {
    fetch
      .once(fixtures.organization3)
      .once(fixtures.org3Practitioners)
      .once(fixtures.allPractitioners);

    const mock: any = jest.fn();
    const props = {
      fetchOrganizationsCreator: fetchOrganizations,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization1.identifier },
        path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
        url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization1.identifier}`,
      },
      organization: fixtures.organization1,
      serviceClass: OpenSRPService,
    };

    shallow(
      <Router history={history}>
        <AssignPractitioner {...props} />
      </Router>
    );
  });
});
