import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedCreateEditPractitionerView, { CreateEditPractitionerView } from '..';
import {
  EDIT,
  EDIT_PRACTITIONER_URL,
  NEW,
  OPENSRP_PRACTITIONER_ENDPOINT,
  PRACTITIONER,
} from '../../../../../constants';
import store from '../../../../../store';
import * as practitionerDucks from '../../../../../store/ducks/opensrp/practitioners';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

reducerRegistry.register(practitionerDucks.reducerName, practitionerDucks.default);

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/containers/pages/CreateEditOrganization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders EditTeamView without crashing', () => {
    fetch.once(JSON.stringify([]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.practitioner1.identifier },
        path: `${EDIT_PRACTITIONER_URL}/:id`,
        url: `${EDIT_PRACTITIONER_URL}/${fixtures.practitioner1.identifier}`,
      },
      practitioner: fixtures.practitioner1,
    };
    shallow(
      <Router history={history}>
        <CreateEditPractitionerView {...props} />
      </Router>
    );
  });

  it('renders EditTeamsView correctly', () => {
    fetch.once(JSON.stringify([]));
    store.dispatch(practitionerDucks.fetchPractitioners([fixtures.practitioner1]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.practitioner1.identifier },
        path: `${EDIT_PRACTITIONER_URL}/:id`,
        url: `${EDIT_PRACTITIONER_URL}/${fixtures.practitioner1.identifier}`,
      },
      practitioner: fixtures.practitioner1,
    };
    const wrapper = mount(
      <Router history={history}>
        <CreateEditPractitionerView {...props} />
      </Router>
    );
    // look for crucial components or pages that should be displayed

    // expect a form
    expect(wrapper.find('form').length).toEqual(1);

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(`${EDIT} ${PRACTITIONER}`);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    const form = wrapper.find('OrganizationForm');
    expect(form.length).toEqual(1);

    wrapper.unmount();
  });

  it('Calls the correct endpoints', async () => {
    const mockList: any = jest.fn(async () => []);
    const serviceMock = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    // loads a single practitioner,
    store.dispatch(practitionerDucks.fetchPractitioners([fixtures.practitioner1]));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.practitioner1.identifier },
        path: `${EDIT_PRACTITIONER_URL}/:id`,
        url: `${EDIT_PRACTITIONER_URL}/${fixtures.practitioner1.identifier}`,
      },
      practitioner: fixtures.practitioner1,
      serviceClass: serviceMock,
    };
    mount(
      <Router history={history}>
        <CreateEditPractitionerView {...props} />
      </Router>
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(serviceMock).toHaveBeenCalled();
    expect(serviceMock).toHaveBeenCalledWith(
      `${OPENSRP_PRACTITIONER_ENDPOINT}/${fixtures.practitioner1.identifier}`
    );
  });

  it('works correctly with the store', async () => {
    // check after connection if props are as they should be
    fetch.once(JSON.stringify([]));
    store.dispatch(practitionerDucks.fetchPractitioners(fixtures.practitioners));
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.practitioner1.identifier },
        path: `${EDIT_PRACTITIONER_URL}/:id`,
        url: `${EDIT_PRACTITIONER_URL}/${fixtures.practitioner1.identifier}`,
      },
      practitioner: fixtures.practitioner1, // intentionally different
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedCreateEditPractitionerView {...props} />
        </Router>
      </Provider>
    );

    const connectedProps = wrapper.find('CreateEditOrgView').props();
    expect((connectedProps as any).practitioner).toEqual(fixtures.practitioner1);
  });
});

it('calls selectors with the correct arguments', async () => {
  const practitionerByIdMock = jest.spyOn(practitionerDucks, 'getPractitionerById');
  fetch.once(JSON.stringify([]));
  store.dispatch(practitionerDucks.fetchPractitioners(fixtures.practitioners));
  const mock: any = jest.fn();
  const props = {
    history,
    location: mock,
    match: {
      isExact: true,
      params: { id: fixtures.practitioner1.identifier },
      path: `${EDIT_PRACTITIONER_URL}/:id`,
      url: `${EDIT_PRACTITIONER_URL}/${fixtures.practitioner1.identifier}`,
    },
    practitioner: fixtures.practitioner1,
  };
  mount(
    <Provider store={store}>
      <Router history={history}>
        <ConnectedCreateEditPractitionerView {...props} />
      </Router>
    </Provider>
  );

  const state = {
    gatekeeper: { result: {}, success: null },
    practitioners: {
      practitionersById: {
        '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4': {
          active: true,
          id: 3,
          identifier: '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4',
          name: 'Demo Team',
        },
        'fcc19470-d599-11e9-bb65-2a2ae2dbcce4': {
          active: true,
          id: 1,
          identifier: 'fcc19470-d599-11e9-bb65-2a2ae2dbcce4',
          name: 'The Luang',
          type: {
            coding: [
              {
                code: 'team',
                display: 'Team',
                system: 'http://terminology.hl7.org/CodeSystem/practitioner-type',
              },
            ],
          },
        },
      },
    },
    router: {
      action: 'POP',
      location: { hash: '', pathname: '/', search: '', state: undefined },
    },
    session: {
      authenticated: false,
      extraData: {},
      user: { email: '', gravatar: '', name: '', username: '' },
    },
  };

  await new Promise(resolve => setImmediate(resolve));

  expect(practitionerByIdMock.mock.calls[0]).toEqual([
    state,
    'fcc19470-d599-11e9-bb65-2a2ae2dbcce4',
  ]);
});

describe('src/containers/practitionerViews/createEditview.createView', () => {
  it('renders page correctly on create Organization view', () => {
    // see it renders form when practitioner is null
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {},
        path: `${EDIT_PRACTITIONER_URL}`,
        url: `${EDIT_PRACTITIONER_URL}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedCreateEditPractitionerView {...props} />
        </Router>
      </Provider>
    );
    // look for crucial components or pages that should be displayed

    // expect a form
    expect(wrapper.find('form').length).toEqual(1);

    // page title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(`${NEW} ${PRACTITIONER}`);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    // const form = wrapper.find('');
    // expect(form.length).toEqual(1);

    wrapper.unmount();
  });
});
