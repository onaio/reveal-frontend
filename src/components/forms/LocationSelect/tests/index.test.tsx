import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import { act } from 'react-dom/test-utils';
import LocationSelect from '..';
import { jurisidtionsFixture } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('components/forms/LocationSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<LocationSelect />);
  });

  it('renders renders correctly when no data is found', async () => {
    fetch.mockResponseOnce(JSON.stringify([]));

    const wrapper = mount(<LocationSelect />);

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('NoDataComponent').text()).toEqual('No Data Found');
  });

  it('renders renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify([jurisidtionsFixture[0], jurisidtionsFixture[1]]));
    fetch.mockResponseOnce(JSON.stringify([jurisidtionsFixture[2]]));
    fetch.mockResponseOnce(JSON.stringify([jurisidtionsFixture[3]]));
    const wrapper = mount(<LocationSelect />);
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    // check items displayed
    expect(wrapper.find('.rstm-tree-item').length).toEqual(2);
    expect(
      wrapper
        .find('.rstm-tree-item')
        .at(0)
        .text()
    ).toEqual('ราชอาณาจักรไทย');
    expect(
      wrapper
        .find('.rstm-tree-item')
        .at(1)
        .text()
    ).toEqual('Eswatini');

    // click eswatini
    wrapper
      .find('.rstm-tree-item')
      .at(1)
      .simulate('click');
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.find('.rstm-tree-item').length).toEqual(3);
    expect(
      wrapper
        .find('.rstm-tree-item')
        .at(2)
        .text()
    ).toEqual('Lubombo');

    // click lubombo
    wrapper
      .find('.rstm-tree-item')
      .at(2)
      .simulate('click');
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.find('.rstm-tree-item').length).toEqual(4);
    expect(
      wrapper
        .find('.rstm-tree-item')
        .at(3)
        .text()
    ).toEqual('Lomahasha');

    expect(fetch.mock.calls).toMatchSnapshot('fetch calls');
    wrapper.unmount();
  });

  it('renders downloads', async () => {
    fetch.mockResponseOnce(JSON.stringify([jurisidtionsFixture[0], jurisidtionsFixture[1]]));
    const wrapper = mount(<LocationSelect />);
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    // check jurisdictions loaded
    expect(wrapper.find('.rstm-tree-item').length).toEqual(2);
    expect(wrapper.find('form').length).toEqual(2);
    // click download of the second
    wrapper
      .find('form')
      .at(1)
      .simulate('submit');
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    // check if download fetch was made
    expect(fetch.mock.calls).toMatchSnapshot('download form fetch calls');
    wrapper.update();
  });
});
