import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import UserIdSelect from '..';
import { OpenSRPService } from '../../../../../services/opensrp';
import { response } from './fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('src/*/forms/userIdSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    fetch.mockResponse(JSON.stringify(response));
    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = shallow(<UserIdSelect {...props} />);
    await new Promise(resolve => new Promise(resolve));
    wrapper.update();
  });

  it('renders correctly', async () => {
    fetch.mockResponse(JSON.stringify(response));
    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(<UserIdSelect {...props} />);
    await new Promise(resolve => new Promise(resolve));
    wrapper.update();

    const inputSelect = wrapper.find('input');
    expect(toJson(inputSelect)).toMatchSnapshot('Selector Input');

    // expect(toJson(wrapper)).toMatchSnapshot('Everything');
  });

  it('calls Api correctly', async () => {
    const dummy = {
      results: { length: 100 },
    };
    const breakDummy = {
      results: { length: 62 },
    };
    // simulate iterative calls for next pages to api.
    fetch
      .once(JSON.stringify(dummy))
      .once(dummy)
      .once(dummy)
      .once(breakDummy);

    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(<UserIdSelect {...props} />);
    await new Promise(resolve => new Promise(resolve));
    wrapper.update();

    expect(fetch.mock.calls).toEqual([]);
  });
});
