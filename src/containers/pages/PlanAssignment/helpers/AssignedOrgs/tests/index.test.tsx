import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { AssignedOrgs } from '../index';

describe('PlanAssignment/AssignedOrgs', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders when no orgs', () => {
    const wrapper = mount(<AssignedOrgs displayLimit={2} id="42" orgs={[]} />);
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('Org names');
    expect(toJson(wrapper.find('Tooltip'))).toMatchSnapshot('Tooltip');
    wrapper.unmount();
  });
});
