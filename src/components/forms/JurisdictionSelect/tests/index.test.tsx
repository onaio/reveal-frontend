import { mount, shallow } from 'enzyme';
import React from 'react';
import JurisdictionSelect from '..';
import defaultProps from '..';
import { OpenSRPService } from '../../../../services/opensrp';
// tslint:disable-next-line:no-var-requires
jest.mock('../../../../configs/env');
// jest.mock('../../../../helpers/errors');
// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('components/forms/JurisdictionSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<JurisdictionSelect />);
    mount(<JurisdictionSelect {...defaultProps} />);
  });
  it('displays errors ', async () => {
    fetch.mockReject(new Error('Request failed'));
    mount(<JurisdictionSelect />);
    await new Promise(resolve => setImmediate(resolve));
  });
  it('select various selections', async () => {
    const options = [
      {
        label: 'Siavonga',
        value: '3953',
      },
      {
        label: 'Sinda',
        value: '2941',
      },
    ];
    const promise = Promise.resolve({ options: [options[1]] });
    //
    const promiseOptions = jest.fn().mockImplementation(() => {
      return () => promise;
    });
    const props = {
      apiEndpoint: 'location/findByProperties',
      cascadingSelect: true,
      params: {
        is_jurisdiction: true,
        return_geometry: false,
      },
      promiseOptions,
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(<JurisdictionSelect {...props} />);
    const select = wrapper.find('Select');
    const selectInstance = wrapper.find('Select').instance();
    // select.props().onInputChange(options[1].value); // simulate a search and launch loadOptions
    // const inp = select.find('input'); // find the hidden input to simulate an option selection
    (selectInstance as any).selectOption({
      label: 'Demo Team',
      value: '4c506c98-d3a9-11e9-bb65-2a2ae2dbcce4',
    });
    wrapper.update();
    select.at(0).simulate('change', { target: { value: options[1].value } });
    select.at(0).simulate('keyDown', { keyCode: 9, key: 'Tab' });

    expect(wrapper.find('Select').text()).toEqual('Demo Team');
    // investigate promiseOptions mock
    expect(promiseOptions).toHaveBeenCalledTimes(1);
  });
  it('renders select options correctly', () => {
    const wrapper = mount(<JurisdictionSelect {...defaultProps} />);

    expect(wrapper.children().props()).toMatchSnapshot('Jurisdiction Select Props ownProps');
    expect(
      wrapper
        .children()
        .children()
        .children()
        .props()
    ).toMatchSnapshot('Jurisdiction Select Props');
    expect(wrapper.find('.jurisdiction__indicator').length).toBe(4);
  });
});
