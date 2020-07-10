import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { raKsh2Node, raLuapulaNode } from '../../../../../../components/TreeWalker/tests/fixtures';
import { JurisdictionCell } from '../index';

describe('PlanAssignment/JurisdictionCell', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders leaf nodes', () => {
    if (!raKsh2Node) {
      fail();
    }

    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionCell node={raKsh2Node} url={`/${raKsh2Node.model.id}`} />
      </MemoryRouter>
    );
    expect(toJson(wrapper.find('span'))).toMatchSnapshot('Leaf node');
    wrapper.unmount();
  });

  it('renders leaf non-leaf nodes', () => {
    if (!raLuapulaNode) {
      fail();
    }

    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionCell node={raLuapulaNode} url={`/${raLuapulaNode.model.id}`} />
      </MemoryRouter>
    );
    expect(toJson(wrapper.find('Link'))).toMatchSnapshot('Non-Leaf node');
    wrapper.unmount();
  });
});
