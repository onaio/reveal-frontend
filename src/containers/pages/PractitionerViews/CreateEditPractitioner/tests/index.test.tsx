import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedCreateEditPractitionerView, { CreateEditPractitionerView } from '..';
import { EDIT_PRACTITIONER, NEW_PRACTITIONER } from '../../../../../configs/lang';
import { EDIT_PRACTITIONER_URL, OPENSRP_PRACTITIONER_ENDPOINT } from '../../../../../constants';
import store from '../../../../../store';
import * as practitionerDucks from '../../../../../store/ducks/opensrp/practitioners';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

reducerRegistry.register(practitionerDucks.reducerName, practitionerDucks.default);

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/containers/pages/CreateEditPractitioner', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(practitionerDucks.removePractitionerRolesAction);
    store.dispatch(practitionerDucks.removePractitionersAction);
  });

  it('renders CreateEditPractitionerView without crashing', () => {
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

  it('renders CreateEditPractitionerView correctly', () => {
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
    expect(helmet.title).toEqual(EDIT_PRACTITIONER);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    const form = wrapper.find('PractitionerForm');
    expect(form.length).toEqual(1);

    wrapper.unmount();
  });

  it('Calls the correct endpoints', async () => {
    const mockRead: any = jest.fn().mockImplementation(async () => fixtures.practitioner1);
    const serviceMock = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
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

    expect(serviceMock).toHaveBeenCalled();
    expect(serviceMock).toHaveBeenCalledWith(OPENSRP_PRACTITIONER_ENDPOINT);
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

    const connectedProps = wrapper.find('CreateEditPractitionerView').props();
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
    gatekeeper: { result: {}, success: null, working: false },
    practitioner: {
      practitionerRoles: {},
      practitionersById: {
        '437cc699-cfa7-414c-ba27-1668b6b517e6': {
          active: true,
          identifier: '437cc699-cfa7-414c-ba27-1668b6b517e6',
          name: 'Test User Lusaka',
          userId: 'cad04f1e-9b05-4eac-92ce-4b38aa478644',
          username: 'lusaka',
        },
        'd7c9c000-e9b3-427a-890e-49c301aa48e6': {
          active: true,
          identifier: 'd7c9c000-e9b3-427a-890e-49c301aa48e6',
          name: 'Biophics Tester',
          userId: '8df27310-c7ef-4bb2-b77f-3b9f4bd23713',
          username: 'tak',
        },
        p5id: {
          active: true,
          identifier: 'p5id',
          name: 'tlv2_name',
          userId: '8af3b7ce-e3fa-420f-8de6-e7c36e08f0bc',
          username: 'tlv2',
        },
        undefined: [],
      },
    },
    router: {
      action: 'POP',
      location: { hash: '', pathname: '/', search: '', state: undefined, query: {} },
    },
    session: {
      authenticated: false,
      extraData: {},
      user: { email: '', gravatar: '', name: '', username: '' },
    },
  };

  expect(practitionerByIdMock.mock.calls[0]).toEqual([state, fixtures.practitioner1.identifier]);
});

describe('src/containers/practitionerViews/createEditview.createView', () => {
  it('renders page correctly on create Practitioner view', () => {
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
    expect(helmet.title).toEqual(NEW_PRACTITIONER);

    // breadcrumb
    const breadcrumbWrapper = wrapper.find('Breadcrumb');
    expect(breadcrumbWrapper.length).toEqual(1);

    // and the form?
    const form = wrapper.find('PractitionerForm');
    expect(form.length).toEqual(1);

    wrapper.unmount();
  });
});
