import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { NodeCell } from '..';

const history = createBrowserHistory();

describe('src/pages/JurisdictionAssignment/JurisdictionCell', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it('renders correctly by default', () => {
    const mockNode: any = {
      children: { length: 1 },
      hasChildren: () => true,
      model: { label: 'Gaz' },
    };
    const props = {
      baseUrl: '/example',
      node: mockNode,
    };
    const wrapper = mount(
      <Router history={history}>
        <NodeCell {...props} />
      </Router>
    );
    expect(toJson(wrapper.find('NodeCell'))).toMatchSnapshot('should have classNames link');
    expect(wrapper.find('span').length).toEqual(0);
  });

  it('renders correctly when node does not have children', () => {
    const mockNode: any = {
      children: { length: 0 },
      hasChildren: () => false,
      model: { label: 'Gaz' },
    };
    const props = {
      baseUrl: '/example',
      node: mockNode,
    };
    const wrapper = mount(
      <Router history={history}>
        <NodeCell {...props} />
      </Router>
    );
    expect(toJson(wrapper.find('NodeCell'))).toMatchSnapshot('should have classNames link');
    expect(wrapper.find('span').length).toEqual(1);
  });
});
