import { mount, shallow } from 'enzyme';
import React from 'react';
import SimpleOrgSelect from '..';
import defaultProps from '..';

describe('components/forms/SimpleOrgSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<SimpleOrgSelect />);
    mount(<SimpleOrgSelect {...defaultProps} />);
  });
  it('renders select options correctly', () => {
    const wrapper = mount(<SimpleOrgSelect {...defaultProps} />);

    expect(wrapper.children().props()).toMatchSnapshot('SimpleOrgSelect Select Props ownProps');
    expect(
      wrapper
        .children()
        .children()
        .children()
        .props()
    ).toMatchSnapshot('SimpleOrgSelect Select Props');
  });
});
