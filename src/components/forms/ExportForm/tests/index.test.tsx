import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import { act } from 'react-dom/test-utils';
import ExportForm from '..';

jest.mock('../../../../configs/env');

describe('components/forms/ExportForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<ExportForm />);
  });

  it('renders correctly', async () => {
    const wrapper = mount(<ExportForm />);

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('#export-row h3').text()).toMatchInlineSnapshot(`"Export Student List"`);
    expect(wrapper.find('Alert').text()).toMatchInlineSnapshot(
      `"Export Country based on Geographical level!"`
    );
    expect(wrapper.find('LocationSelect').length).toEqual(1);
  });
});
