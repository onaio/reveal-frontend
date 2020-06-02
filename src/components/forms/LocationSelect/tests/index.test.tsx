import { mount, shallow } from 'enzyme';
import React from 'react';
import LocationSelect from '..';
import { defaultProps } from '../../JurisdictionSelect';
describe('components/forms/LocationSelect', () => {
  it('renders without crashing', () => {
    shallow(<LocationSelect />);
    mount(<LocationSelect />);
  });
  it('renders jurisdictionselect with right props', () => {
    const props = {
      ...defaultProps,
      loadLocations: true,
    };

    const wrapper = mount(<LocationSelect {...props} />);
    expect(wrapper.children().props()).toMatchSnapshot('Jurisdiction Select Props');
  });
});
