import { mount } from 'enzyme';
import React from 'react';
import DropDownCell from '../DropDownCell';

describe('src/components/Table', () => {
  it('renders correctly when with children', () => {
    const props = {
      cellValue: <div>Cell value</div>,
      hasChildren: true,
    };
    const wrapper = mount(<DropDownCell {...props} />);
    expect(wrapper.text()).toMatchInlineSnapshot(`"Cell value ▼"`);
  });

  it('renders correctly when without children', () => {
    const props = {
      cellValue: <div>Cell value</div>,
      hasChildren: false,
    };
    const wrapper = mount(<DropDownCell {...props} />);
    expect(wrapper.text()).toMatchInlineSnapshot(`"Cell value"`);
  });
});
