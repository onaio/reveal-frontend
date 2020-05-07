import { fireEvent, render } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import JurisdictionSelect from '..';
import defaultProps from '..';
import { OpenSRPService } from '../../../../services/opensrp';

jest.mock('../../../../configs/env');
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
  it('loads select options', async () => {
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

    const promiseOptions = jest.fn().mockImplementation(async () => {
      return options;
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
    await flushPromises();
    wrapper.update();
    wrapper
      .find('.jurisdiction__dropdown-indicator')
      .at(0)
      .simulate('mouseDown', {
        button: 0,
      });
    expect(wrapper.find('.jurisdiction__option').length).toEqual(4);
    expect((wrapper.find('Select').props() as any).options).toEqual(options);
    expect(promiseOptions).toHaveBeenCalledTimes(1);
  });
  it('handleChange works correctly', async () => {
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

    const promiseOptions = jest.fn().mockImplementation(async () => {
      return options;
    });
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve(options);
        },
      };
    });
    const props = {
      apiEndpoint: 'location/findByProperties',
      cascadingSelect: true,
      params: {
        is_jurisdiction: true,
        return_geometry: false,
      },
      promiseOptions,
      serviceClass: mockedOpenSRPservice,
    };
    const { container, getByText } = render(<JurisdictionSelect {...props} />);
    await flushPromises();
    expect(mockedOpenSRPservice).toBeCalledTimes(1);
    expect(promiseOptions).toHaveBeenCalledTimes(1);
    const placeholder = getByText('Select');
    expect(placeholder).toBeTruthy();
    const inputValue = container.querySelector('input');
    expect(inputValue).not.toBeNull();
    if (inputValue) {
      fireEvent.focus(inputValue);
      fireEvent.keyDown(inputValue, { key: 'ArrowDown', code: 40 });
      expect(container.querySelector('.jurisdiction__menu')).toMatchSnapshot('Jurisdiction Menu');
      fireEvent.click(getByText('Sinda'));
    }
    expect(
      (container.querySelector('.jurisdiction__single-value') as HTMLElement).innerHTML
    ).toEqual('Sinda');

    fireEvent.focus(inputValue as any);
    fireEvent.keyDown(inputValue as any, { key: 'ArrowDown', code: 40 });
    fireEvent.click(getByText('Siavonga'));
    expect(
      (container.querySelector('.jurisdiction__single-value') as HTMLElement).innerHTML
    ).toEqual('Siavonga');
    expect(mockedOpenSRPservice).toBeCalledTimes(1);
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
