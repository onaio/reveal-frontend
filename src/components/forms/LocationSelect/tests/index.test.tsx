import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import { act } from 'react-dom/test-utils';
import LocationSelect from '..';
import * as utils from '../../../../helpers/utils';
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
    fetch.mockResponseOnce(JSON.stringify([]));

    const glowSpy = jest.spyOn(utils, 'growl');

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
    // is loading text displayed
    expect(wrapper.find('.loading-text').length).toEqual(0);

    // click eswatini
    wrapper
      .find('.rstm-tree-item')
      .at(1)
      .simulate('click');
    // on clicking location we should see loading
    expect(wrapper.find('.loading-text').length).toEqual(1);
    expect(wrapper.find('.loading-text').text()).toEqual('loading......');
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.find('.loading-text').length).toEqual(0);
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

    // click Lomahasha
    wrapper
      .find('.rstm-tree-item')
      .at(3)
      .simulate('click');
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(glowSpy).toHaveBeenCalledTimes(1);
    expect(glowSpy).toHaveBeenCalledWith('This is the lowest jurisdiction', { type: 'success' });
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
