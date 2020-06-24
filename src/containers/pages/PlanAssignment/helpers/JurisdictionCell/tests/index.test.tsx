import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { openSRPJurisdiction } from '../../JurisdictionAssignmentForm/tests/fixtures';
import { JurisdictionCell } from '../index';

describe('PlanAssignment/JurisdictionCell', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders leaf nodes', () => {
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionCell
          node={openSRPJurisdiction}
          jurisdictionTree={[]}
          url={`/${openSRPJurisdiction.id}`}
        />
      </MemoryRouter>
    );
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('Leaf node');
    wrapper.unmount();
  });

  it('renders leaf non-leaf nodes', () => {
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionCell
          node={openSRPJurisdiction}
          jurisdictionTree={[
            { jurisdiction_id: '12409', jurisdiction_parent_id: openSRPJurisdiction.id },
          ]}
          url={`/${openSRPJurisdiction.id}`}
        />
      </MemoryRouter>
    );
    expect(toJson(wrapper.find('Link'))).toMatchSnapshot('Non-Leaf node');
    wrapper.unmount();
  });
});
