import { cleanup } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import ClientUpload, { defaultProps } from '..';
import { csvCreate } from './fixtures';
// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

describe('components/ClientUpload', () => {
  afterEach(cleanup);
  it('renders without crashing', () => {
    shallow(<ClientUpload />);
  });

  it('renders props correctly', async () => {
    const csv = csvCreate();
    const props = {
      ...defaultProps,
    };
    const wrapper = mount(
      <Router history={history}>
        <ClientUpload {...props} />
      </Router>
    );
    expect(wrapper.children().props()).toMatchSnapshot('ClientUpload Select Props ownProps');

    expect(wrapper.find('input[id="file"]').length).toBeTruthy();
    expect(wrapper.find('Button').text()).toEqual('Submit');
    wrapper.find('Button').simulate('submit');
    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();
    // should have errors on files field
    expect(wrapper.find('.jurisdictions-error').text()).toEqual('Required');
    // simulate file upload
    wrapper
      .find('input[name="file"]')
      .simulate('change', { target: { name: 'file', files: [csv] } });
    wrapper.find('Button').simulate('submit');
    await act(async () => {
      await new Promise<any>(resolve => setImmediate(resolve));
      await flushPromises();
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    // post data posted
    expect(fetch.mock.calls[0]).toEqual([
      'https://test.smartregister.org/opensrp/rest/upload/?event_name=Child Registration',
      {
        body: expect.any(Object),
        headers: {
          Authorization: 'Bearer null',
        },
        method: 'POST',
      },
    ]);
    // client lists pulled
    expect(fetch.mock.calls[1]).toEqual([
      'https://test.smartregister.org/opensrp/rest/upload/history',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer null',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ]);
  });
});
