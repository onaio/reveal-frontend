import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedAssignPractitioner, { AssignPractitioner } from '..';
import { ASSIGN, PRACTITIONERS } from '../../../../../configs/lang';
import { ASSIGN_PRACTITIONERS_URL, FI_URL } from '../../../../../constants';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import organizationsReducer, {
  fetchOrganizations,
  reducerName as organizationReducerName,
  removeOrganizationsAction,
} from '../../../../../store/ducks/opensrp/organizations';
import practitionersReducer, {
  reducerName as practitionerReducerName,
} from '../../../../../store/ducks/opensrp/practitioners';
import { removePractitionersAction } from '../../../../../store/ducks/opensrp/practitioners';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

reducerRegistry.register(organizationReducerName, organizationsReducer);
reducerRegistry.register(practitionerReducerName, practitionersReducer);

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

describe('src/pages/*/AssignPractitioners', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(removePractitionersAction);
    store.dispatch(removeOrganizationsAction);
  });

  it('render without crashing', () => {
    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify(fixtures.org3Practitioners))
      .once(JSON.stringify(fixtures.allPractitioners));

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
      organization: fixtures.organization3,
      serviceClass: OpenSRPService,
    };

    shallow(
      <Router history={history}>
        <AssignPractitioner {...props} />
      </Router>
    );
  });

  it('Works well with store', async () => {
    // interest here is if we component receives correct props
    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify(fixtures.org3Practitioners))
      .once(JSON.stringify(fixtures.allPractitioners));

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
      serviceClass: OpenSRPService,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAssignPractitioner {...props} />
        </Router>
      </Provider>
    );

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    const theProps = wrapper.find('AssignPractitioner').props() as any;
    expect(theProps.organization).toEqual(fixtures.organization3);
    expect(theProps.assignedPractitioners).toEqual(fixtures.org3Practitioners);
  });

  it('Renders correctly', async () => {
    // interest here is if we have crucial page components
    fetch
      .once(JSON.stringify({}))
      .once(JSON.stringify([]))
      .once(JSON.stringify([]));

    const mock: any = jest.fn();
    const props = {
      assignedPractitioners: fixtures.org3Practitioners,
      fetchOrganizationsCreator: fetchOrganizations,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization3.identifier },
        path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
        url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization3.identifier}`,
      },
      organization: fixtures.organization3,
      serviceClass: OpenSRPService,
    };

    const wrapper = mount(
      <Router history={history}>
        <AssignPractitioner {...props} />
      </Router>
    );

    wrapper.update();

    // page Title
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(`${ASSIGN} ${PRACTITIONERS}`);

    // assigned-options spans
    expect(wrapper.find('span.assigned-options').length).toEqual(3);

    // BreadCrumb
    expect(wrapper.find('Breadcrumb').length).toEqual(1);
    expect(toJson(wrapper.find('Breadcrumb'))).toMatchSnapshot('BreadCrumb');

    // the async select component
    expect(wrapper.find('Select input').length).toEqual(1);
    expect(toJson(wrapper.find('Select input'))).toMatchSnapshot('async select');

    // Select values
    expect(wrapper.find('Select').prop('value')).toMatchSnapshot('Select Values');

    // add button
    expect(toJson(wrapper.find('#add-button'))).toMatchSnapshot('add Practitioners button');

    // discard button
    expect(toJson(wrapper.find('#discard-button'))).toMatchSnapshot('add Practitioners button');
  });

  it('The async select works correctly', async () => {
    // check that you can select one, for nominal case,
    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify([]))
      .once(JSON.stringify(fixtures.allPractitioners));

    const mock: any = jest.fn();
    const props = {
      assignedPractitioners: [],
      fetchOrganizationsCreator: fetchOrganizations,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization3.identifier },
        path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
        url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization3.identifier}`,
      },
      organization: fixtures.organization3,
      serviceClass: OpenSRPService,
    };

    const wrapper = mount(
      <Router history={history}>
        <AssignPractitioner {...props} />
      </Router>
    );

    await flushPromises();
    wrapper.update();

    const select = wrapper.find('Select');
    // simulate single value change
    const entry = fixtures.practitioner2;
    (select.instance() as any).selectOption({
      label: `${entry.username} - ${entry.name}`,
      value: entry.identifier,
    });
    wrapper.update();

    expect(wrapper.find('Select').props().value).toEqual([
      {
        label: 'tak - Biophics Tester',
        value: 'd7c9c000-e9b3-427a-890e-49c301aa48e6',
      },
    ]);

    // simulate backspace
    wrapper.find('Select').simulate('keyDown', { key: 'Backspace', keyCode: 8 });
    wrapper.update();

    expect(wrapper.find('Select').props().value).toEqual([]);
  });

  it('Should not navigate when there are unsaved changes', async () => {
    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify([]))
      .once(JSON.stringify(fixtures.allPractitioners));

    const mock: any = jest.fn();
    const props = {
      assignedPractitioners: [],
      fetchOrganizationsCreator: fetchOrganizations,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization3.identifier },
        path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
        url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization3.identifier}`,
      },
      organization: fixtures.organization3,
      serviceClass: OpenSRPService,
    };

    const wrapper = mount(
      <Router history={history}>
        <AssignPractitioner {...props} />
      </Router>
    );
    await flushPromises();
    wrapper.update();

    expect((wrapper.find('Prompt') as any).props().when).toBeFalsy();

    const select = wrapper.find('Select');
    // simulate single value change function
    const entry = fixtures.practitioner2;
    (select.instance() as any).selectOption({
      label: `${entry.username} - ${entry.name}`,
      value: entry.identifier,
    });
    wrapper.update();

    history.push(FI_URL);
    wrapper.update();
    const message = `Unsaved Changes: please Save or Discard changes made [${fixtures.organization3.name}]`;
    expect((wrapper.find('Prompt') as any).props().message()).toEqual(message);
    expect((wrapper.find('Prompt') as any).props().when).toBeTruthy();
  });

  it('discard changes works correctly', async () => {
    fetch
      .once(JSON.stringify(fixtures.organization3))
      .once(JSON.stringify([]))
      .once(JSON.stringify(fixtures.allPractitioners));

    const mock: any = jest.fn();
    const props = {
      assignedPractitioners: [],
      fetchOrganizationsCreator: fetchOrganizations,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.organization3.identifier },
        path: `${ASSIGN_PRACTITIONERS_URL}/:id`,
        url: `${ASSIGN_PRACTITIONERS_URL}/${fixtures.organization3.identifier}`,
      },
      organization: fixtures.organization3,
      serviceClass: OpenSRPService,
    };

    const wrapper = mount(
      <Router history={history}>
        <AssignPractitioner {...props} />
      </Router>
    );

    expect(wrapper.text().includes('tak - Biophics')).toBeFalsy();

    await flushPromises();
    wrapper.update();

    const select = wrapper.find('Select');
    // simulate single value change
    const entry = fixtures.practitioner2;
    (select.instance() as any).selectOption({
      label: `${entry.username} - ${entry.name}`,
      value: entry.identifier,
    });
    wrapper.update();

    expect(wrapper.text().includes('tak - Biophics')).toBeTruthy();
    wrapper.update();

    wrapper.find('button#discard-button').simulate('click');
    wrapper.update();
    // confirm the option is no longer rendered
    expect(wrapper.text().includes('tak - Biophics')).toBeFalsy();

    // check that on clicking discard changes it redirects to team view
    wrapper.find('button#discard-button').simulate('click');
    wrapper.update();
    expect(history.location.pathname).toEqual('/teams/view/d23f7350-d406-11e9-bb65-2a2ae2dbcce4');
  });
});
