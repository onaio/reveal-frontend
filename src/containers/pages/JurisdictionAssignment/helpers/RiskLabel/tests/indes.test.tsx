import { mount } from 'enzyme';
import React from 'react';
import { RiskLabel, RiskLabelProps } from '..';
import { JurisdictionMetadata } from '../../../../../../store/ducks/tests/fixtures';

describe('Jurisdiction Assignment risk label', () => {
  it('Risk label is rendered correctly', () => {
    const mockNode: any = { model: { id: '79b139c-3a20-4656-b684-d2d9ed83c94e' } };
    const props: RiskLabelProps = {
      metadata: JurisdictionMetadata,
      node: mockNode,
    };
    const wrapper = mount(<RiskLabel {...props} />);
    expect(wrapper.text()).toMatchInlineSnapshot(`"80"`);
  });
  it('Risk label is rendered correctly if node is not found', () => {
    const mockNode: any = { model: { id: 'nonExistentID' } };
    const props: RiskLabelProps = {
      metadata: JurisdictionMetadata,
      node: mockNode,
    };
    const wrapper = mount(<RiskLabel {...props} />);
    expect(wrapper.text()).toMatchInlineSnapshot(`"--"`);
  });
});
