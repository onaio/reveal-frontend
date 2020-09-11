import { authenticateUser } from '@onaio/session-reducer';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import { UserSelectFilter } from '..';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import { users } from '../../PractitionerForm/UserIdSelect/tests/fixtures';

jest.mock('../../../../configs/env');

// tslint:disable-next-line:no-var-requires
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

describe('src/components/forms/FilterForm', () => {
  it('renders without crashing', async () => {
    fetch.once(JSON.stringify(users.length)).once(JSON.stringify(users));
    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = shallow(
      <Router history={history}>
        <UserSelectFilter {...props} />
      </Router>
    );
    // tslint:disable-next-line:promise-must-complete
    await new Promise<any>(resolve => new Promise<any>(resolve));
    wrapper.update();
    wrapper.unmount();
  });

  it('renders correctly', async () => {
    fetch.once(JSON.stringify(users.length)).once(JSON.stringify(users));
    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(
      <Router history={history}>
        <UserSelectFilter {...props} />
      </Router>
    );
    // tslint:disable-next-line:promise-must-complete
    await new Promise<any>(resolve => new Promise<any>(resolve));
    wrapper.update();
    const inputSelect = wrapper.find('input');
    expect(toJson(inputSelect)).toMatchSnapshot('Selector Input');
    wrapper.find('.form-group > div').forEach(div => {
      expect(div.props()).toMatchSnapshot('label and input');
    });
  });

  it('calls to fetch', async () => {
    fetch.once(JSON.stringify(users.length)).once(JSON.stringify(users));

    const props = {
      serviceClass: OpenSRPService,
    };
    mount(
      <Router history={history}>
        <UserSelectFilter {...props} />
      </Router>
    );
    // tslint:disable-next-line:promise-must-complete
    await new Promise<any>(resolve => new Promise<any>(resolve));
    await flushPromises();
    const calls = [
      [
        'https://test.smartregister.org/opensrp/rest/user/count',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
      [
        'https://test.smartregister.org/opensrp/rest/user?page_size=51&source=Keycloak&start_index=0',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
      [
        'https://test.smartregister.org/opensrp/rest/user/count',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
      [
        'https://test.smartregister.org/opensrp/rest/user?page_size=51&source=Keycloak&start_index=0',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ];
    expect(fetch.mock.calls).toEqual(calls);
  });

  it('calls onchangeHandler callback correctly with correct arguments', async () => {
    fetch.once(JSON.stringify(users.length)).once(JSON.stringify(users));
    const mock: any = jest.fn();
    const props = {
      onChangeHandler: mock,
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(
      <Router history={history}>
        <UserSelectFilter {...props} />
      </Router>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    (wrapper.find('Select').instance() as any).selectOption({
      label: 'Drake.Ramole',
      value: '0259c0bc-78a2-4284-a7a9-d61d0005djae',
    });
    wrapper.update();

    // what is the onchangeHandler called with
    expect(mock.mock.calls).toEqual([
      [
        {
          label: 'Drake.Ramole',
          value: '0259c0bc-78a2-4284-a7a9-d61d0005djae',
        },
      ],
    ]);
  });

  it('invokes callback correctly when plan-user filter is on by default', async () => {
    const envModule = require('../../../../configs/env');
    envModule.ENABLE_DEFAULT_PLAN_USER_FILTER = true;
    // need to be also logged in.
    store.dispatch(
      authenticateUser(
        true,
        {
          email: 'bob@example.com',
          name: 'Bobbie',
          username: 'RobertBaratheon',
        },
        { api_token: 'hunter2', oAuth2Data: { access_token: 'iLoveOov', state: 'abcde' } }
      )
    );

    fetch.once(JSON.stringify(users.length)).once(JSON.stringify(users));
    const mock: any = jest.fn();
    const props = {
      onChangeHandler: mock,
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(
      <Router history={history}>
        <UserSelectFilter {...props} />
      </Router>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // what is the onchangeHandler called with
    expect(mock.mock.calls).toEqual([
      [
        {
          label: 'RobertBaratheon',
          value: 'RobertBaratheon',
        },
      ],
    ]);
  });
});
