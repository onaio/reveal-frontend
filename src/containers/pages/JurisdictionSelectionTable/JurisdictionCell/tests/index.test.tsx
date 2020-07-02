import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { NodeCell } from '..';

describe('src/pages/JurisdictionAssignment/JurisdictionCell', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it('renders correctly by default', () => {
    const mockNode: any = {
      children: { length: 1 },
      model: { label: 'Gaz' },
    };
    const onClickMock = jest.fn();
    const props = {
      node: mockNode,
      onClickCallback: onClickMock,
    };
    const wrapper = mount(<NodeCell {...props} />);
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('should have classNames link');
    expect(wrapper.find('.btn-link').length).toEqual(1);
  });

  it('renders correctly when node does not have children', () => {
    const mockNode: any = {
      children: { length: 0 },
      model: { label: 'Gaz' },
    };
    const onClickMock = jest.fn();
    const props = {
      node: mockNode,
      onClickCallback: onClickMock,
    };
    const wrapper = mount(<NodeCell {...props} />);
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('should have classNames link');
    expect(wrapper.find('.btn-link').length).toEqual(0);
  });
});
