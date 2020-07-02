import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import {
  organization1,
  organization2,
  organization3,
} from '../../../../../../store/ducks/tests/fixtures';
import { AssignedOrgs } from '../index';

describe('PlanAssignment/AssignedOrgs', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders when no orgs', () => {
    const wrapper = mount(<AssignedOrgs displayLimit={2} id="42" orgs={[]} />);
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('Org names');
    expect(wrapper.find('Tooltip').length).toEqual(0);
    wrapper.unmount();
  });

  it('renders when limit greater than orgs', () => {
    const wrapper = mount(
      <AssignedOrgs displayLimit={6} id="42" orgs={[organization1, organization2, organization3]} />
    );
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('Org names');
    expect(wrapper.find('Tooltip').length).toEqual(0);
    wrapper.unmount();
  });

  it('renders when limit lower than orgs', async () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'org-tooltip-42');
    document.body.appendChild(div);

    const wrapper = mount(
      <AssignedOrgs displayLimit={2} id="42" orgs={[organization1, organization2, organization3]} />
    );
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('Org names');
    expect(wrapper.find('Tooltip').length).toEqual(1);

    wrapper.unmount();
  });
});
