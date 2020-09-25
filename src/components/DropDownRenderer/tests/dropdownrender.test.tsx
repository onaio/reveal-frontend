import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { DropDownRenderer, DropDownRendererProps } from '..';

const props: DropDownRendererProps = {
  renderMenu: () => 'sample',
  renderToggle: () => <div>The body</div>,
};

describe('src/forms/filterForms/helpers', () => {
  it('renders without crashing', () => {
    mount(<DropDownRenderer {...props} />);
  });
  it('Opens', () => {
    const wrapper = mount(<DropDownRenderer {...props} />);
    wrapper.find('button.filter-bar-btns').simulate('click');
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('.btn-outline-secondary-active').length).toBeFalsy();
  });

  it('applies active class', () => {
    props.filterActive = true;
    const wrapper = mount(<DropDownRenderer {...props} />);
    expect(wrapper.find('.btn-outline-secondary-active').length).toBeTruthy();
  });
});
