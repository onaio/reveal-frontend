import { render } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import JurisdictionMetadataForm from '..';

describe('components/forms/JurisdictionMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<JurisdictionMetadataForm />);
  });

  it('renders correctly', () => {
    // emphasizes on fields showing up
    const wrapper = mount(<JurisdictionMetadataForm />);

    // team file field
    expect(toJson(wrapper.find('input#file'))).toMatchSnapshot('JurisdictionMetadata file');
  });

  it('renders Jurisdiction Metadata form correctly', () => {
    /** emphasizes on fields showing up  */
    const { container } = render(<JurisdictionMetadataForm />);

    expect(container.querySelector('input[name="file"]')).toMatchSnapshot(
      'JurisdictionMetadata file'
    );
  });
});
