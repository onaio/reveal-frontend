import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { Props, RowHeightFilter } from '..';

describe('src/components/forms/FilterForm/rowHeightFilter', () => {
  it('renders without crashing', () => {
    mount(<RowHeightFilter />);
  });
  it('works correctly', () => {
    // click on a label and check that changeHandler was called.
    const onChangeHandlerMock = jest.fn();
    const props: Props = {
      changeHandler: onChangeHandlerMock,
      rowHeightsConfs: {
        SHORT: {
          label: 'Short',
          value: '1em',
        },
        TALL: {
          label: 'Tall',
          value: '2em',
        },
      },
    };
    const wrapper = mount(<RowHeightFilter {...props} />);
    expect(wrapper.text()).toMatchSnapshot('rendered nodes');

    // lets click on one radio say the one with label short
    const nodeShort = wrapper.find('input#Short');
    nodeShort.simulate('change');
    wrapper.update();
    expect(onChangeHandlerMock).toHaveBeenCalledWith(props.rowHeightsConfs.SHORT.value);
    expect(toJson(wrapper.find('input[checked]'))).toMatchSnapshot(
      '#Short radio button is checked'
    );
  });
});
