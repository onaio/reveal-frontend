import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { NoDataComponent } from '..';
import { NO_DATA_FOUND, NO_INVESTIGATIONS_FOUND } from '../../../../configs/lang';

describe('src/components/Table/NoDataComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(<NoDataComponent />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.text().includes(NO_DATA_FOUND)).toBeTruthy();
  });
  it('renders custom message', () => {
    const props = {
      message: NO_INVESTIGATIONS_FOUND,
    };
    const wrapper = mount(<NoDataComponent {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.text().includes(NO_INVESTIGATIONS_FOUND)).toBeTruthy();
  });
});
