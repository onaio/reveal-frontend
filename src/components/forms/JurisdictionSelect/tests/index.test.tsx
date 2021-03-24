import { fireEvent, render } from '@testing-library/react';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import JurisdictionSelect, { SelectOption } from '..';
import defaultProps, {
  handleChange as handleChangeHandler,
  handleChangeWithOptions as handleChangeWithOptionsHandler,
  handleChangeWithoutOptions as handleChangeWithoutOptionsHandler,
} from '..';
import { OPENSRP_FIND_BY_PROPERTIES, OPENSRP_LOCATION } from '../../../../constants';
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

    const handleChange = jest.fn(handleChangeHandler);
    const handleChangeWithOptions = jest.fn(handleChangeWithOptionsHandler);
    const handleChangeWithoutOptions = jest.fn(handleChangeWithoutOptionsHandler);
    const handleLoadOptionsPayload = jest.fn().mockImplementation(() => {
      return options;
    });
    /** Not certain this is the best way to mock promiseOptions and handleLoadOptionsPayLoad */
    const promiseOptions = jest.fn(handleLoadOptionsPayload);
    const props = {
      apiEndpoint: 'location/findByProperties',
      cascadingSelect: true,
      handleChange,
      handleChangeWithOptions,
      handleChangeWithoutOptions,
      handleLoadOptionsPayload,
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
  it('handleChange works with options correctly', async () => {
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

    const handleChange = jest.fn(handleChangeHandler);
    const handleChangeWithOptions = jest.fn(handleChangeWithOptionsHandler);
    const handleChangeWithoutOptions = jest.fn(handleChangeWithoutOptionsHandler);
    const handleLoadOptionsPayload = jest.fn().mockImplementation(() => {
      return options;
    });
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve(options);
        },
      };
    });
    /** Not certain this is the best way to mock promiseOptions and handleLoadOptionsPayLoad */
    const promiseOptions = jest.fn(handleLoadOptionsPayload);
    const props = {
      apiEndpoint: 'location/findByProperties',
      cascadingSelect: true,
      handleChange,
      handleChangeWithOptions,
      handleChangeWithoutOptions,
      handleLoadOptionsPayload,
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
      expect(handleChange).toBeCalledTimes(1);
      expect(handleChangeWithOptions).toBeCalledTimes(1);
    }
    expect(
      (container.querySelector('.jurisdiction__single-value') as HTMLElement).innerHTML
    ).toEqual('Sinda');

    fireEvent.focus(inputValue as any);
    fireEvent.keyDown(inputValue as any, { key: 'ArrowDown', code: 40 });
    fireEvent.click(getByText('Siavonga'));
    expect(handleChange).toBeCalled();
    expect(handleChangeWithOptions).toBeCalled();
    expect(
      (container.querySelector('.jurisdiction__single-value') as HTMLElement).innerHTML
    ).toEqual('Siavonga');
    expect(mockedOpenSRPservice).toBeCalledTimes(1);
  });
  it('handleChange works without options correctly', async () => {
    const handleChange = jest.fn(handleChangeHandler);
    const handleChangeWithOptions = jest.fn(handleChangeWithOptionsHandler);
    const handleChangeWithoutOptions = jest.fn(handleChangeWithoutOptionsHandler);
    const handleLoadOptionsPayload = jest.fn().mockImplementation(() => {
      return [];
    });
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve([]);
        },
      };
    });
    /** Not certain this is the best way to mock promiseOptions and handleLoadOptionsPayLoad */
    const promiseOptions = jest.fn(handleLoadOptionsPayload);
    const props = {
      apiEndpoint: 'location/findByProperties',
      cascadingSelect: true,
      handleChange,
      handleChangeWithOptions,
      handleChangeWithoutOptions,
      handleLoadOptionsPayload,
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
    fireEvent.focus(inputValue as any);
    fireEvent.keyDown(inputValue as any, { key: 'ArrowDown', code: 40 });
    expect(container.querySelector('.jurisdiction__menu')).toMatchSnapshot(
      'Jurisdiction Menu No Options'
    );
    expect(container.querySelector('.jurisdiction__single-value') as HTMLElement).toEqual(null);
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
  it('drills down to locationlevel', async () => {
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

    const handleChange = jest.fn(handleChangeHandler);
    const handleChangeWithOptions = jest.fn(handleChangeWithOptionsHandler);
    const handleChangeWithoutOptions = jest.fn(handleChangeWithoutOptionsHandler);
    const handleLoadOptionsPayload = jest.fn().mockImplementation(() => {
      return options;
    });
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve([]);
        },
      };
    });
    /** Not certain this is the best way to mock promiseOptions and handleLoadOptionsPayLoad */
    const promiseOptions = jest.fn(handleLoadOptionsPayload);
    const props = {
      apiEndpoint: 'location/findByProperties',
      cascadingSelect: true,
      handleChange,
      handleChangeWithOptions,
      handleChangeWithoutOptions,
      handleLoadOptionsPayload,
      loadLocations: true,
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
    if (inputValue) {
      fireEvent.focus(inputValue);
      fireEvent.keyDown(inputValue, { key: 'ArrowDown', code: 40 });
      expect(container.querySelector('.jurisdiction__menu')).toMatchSnapshot('Jurisdiction Menu');
      fireEvent.click(getByText('Sinda'));
      await flushPromises();
    }
    // At initial load JurisdictionStatus should be true
    expect(promiseOptions.mock.calls[0][3]).toEqual(true);
    /**
     * Since we are returning [] on mockedopensrpservice jurisdiction status should be false
     * This sets is_jurisdiction param to false
     */
    expect(promiseOptions.mock.calls[1][3]).toEqual(false);
    /** promiseOptions is called on initial load and after making the selection */
    expect(promiseOptions).toHaveBeenCalledTimes(2);
    /** Opensrpservice is called onload, twice when promiseOptions is called and on handlechange */
    expect(mockedOpenSRPservice).toHaveBeenCalledTimes(4);
    /** Called after firing select event */
    expect(handleChange).toBeCalledTimes(1);
    // properties to filter has status as active
    promiseOptions.mock.calls.forEach(call => {
      expect(call[1].properties_filter.includes('status:Active')).toBeTruthy();
    });
  });
  it('Uses Status: Active in filter param', async () => {
    const mock = jest.fn();
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify([]));
    const mockOptions: SelectOption = { label: 'Akros', value: '395X' };
    const service = new OpenSRPService(`${OPENSRP_LOCATION}/${OPENSRP_FIND_BY_PROPERTIES}`);
    handleChangeHandler(
      {},
      true,
      service,
      mockOptions,
      [],
      true,
      true,
      true,
      mock,
      mock,
      mock,
      mock,
      mock,
      mock,
      '',
      '',
      mock as any,
      mock,
      handleChangeWithOptionsHandler,
      mock
    );
    await new Promise(resolve => setImmediate(resolve));
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/location/findByProperties?is_jurisdiction=true&properties_filter=parentId:395X,status:Active'
    );
  });
});
