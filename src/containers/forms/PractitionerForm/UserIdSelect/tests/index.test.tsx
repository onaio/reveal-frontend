import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import React from 'react';
import UserIdSelect from '..';
import { OpenSRPService } from '../../../../../services/opensrp';
import { openMRSUsers, practitioners } from './fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('src/*/forms/userIdSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    fetch.once(JSON.stringify(practitioners)).once(JSON.stringify(openMRSUsers));
    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = shallow(<UserIdSelect {...props} />);
    await new Promise(resolve => new Promise(resolve));
    wrapper.update();
  });

  it('renders correctly', async () => {
    fetch.once(JSON.stringify(practitioners)).once(JSON.stringify(openMRSUsers));
    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(<UserIdSelect {...props} />);
    await new Promise(resolve => new Promise(resolve));
    wrapper.update();
    const inputSelect = wrapper.find('input');
    expect(toJson(inputSelect)).toMatchSnapshot('Selector Input');
  });

  it('should not reselect an already matched user', async () => {
    // openMRs users (options) shown in select dropdown
    // should not be already mapped to a practitioner entity in opensrp
    fetch.once(JSON.stringify(practitioners)).once(JSON.stringify(openMRSUsers));
    const props = {
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(<UserIdSelect {...props} />);

    await flushPromises();
    wrapper.update();

    // now look at passed options to Select
    const selectWrapperProps = wrapper.find('Select').props();
    const selectWrapperOptions = (selectWrapperProps as any).options;

    // should be less that those passed in from the api
    expect(selectWrapperOptions.length).toEqual(openMRSUsers.results.length - 2);

    // we then look if the records that are missing are actually
    // those that we want missing i.e from the dropdown options
    const optionNames = selectWrapperOptions.map((option: any) => option.label);
    expect(optionNames.includes('superset-user')).toBeFalsy();
    expect(optionNames.includes('negonga.zatias')).toBeFalsy();
  });

  it('calls onchangeHandler callback correctly with correct arguments', async () => {
    fetch.once(JSON.stringify(practitioners)).once(JSON.stringify(openMRSUsers));
    const mock: any = jest.fn();
    const props = {
      onChangeHandler: mock,
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(<UserIdSelect {...props} />);

    await flushPromises();
    wrapper.update();

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
});
