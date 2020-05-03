import { mount, shallow } from 'enzyme';
import React from 'react';
import JurisdictionSelect, { defaultProps } from '..';
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
  // it('select various selections', async () => {
  //   const wrapper = mount(<JurisdictionSelect {...defaultProps} />);
  //   // wrapper
  //   //   .find('.jurisdiction-select__dropdown-indicator')
  //   //   .first()
  //   //   .simulate('mouseDown', {
  //   //     button: 0,
  //   //   });
  //   // expect(wrapper.find('.jurisdiction-select__option').length).toEqual(0);
  //   wrapper
  //     .find('.jurisdiction-select__option')
  //     .at(0)
  //     .simulate('click', null);
  //   expect(wrapper.find('.jurisdiction-select__single-value').text()).toEqual('two');
  // });
  // it('Calls promise options', () => {
  //   const wrapper = shallow(<JurisdictionSelect {...defaultProps} />);
  //   const instance = wrapper.instance();
  // });
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
