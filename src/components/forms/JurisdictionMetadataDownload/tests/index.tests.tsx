import { render } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import JurisdictionMetadataDownloadForm from '..';

describe('components/forms/JurisdictionMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<JurisdictionMetadataDownloadForm />);
  });

  it('renders correctly', () => {
    // emphasizes on fields showing up
    const wrapper = mount(<JurisdictionMetadataDownloadForm />);
    expect(toJson(wrapper.find('select#identifier'))).toMatchSnapshot(
      'JurisdictionMetadataDownload file'
    );
  });

  it('renders Jurisdiction Metadata form correctly', () => {
    /** emphasizes on fields showing up  */
    const { container } = render(<JurisdictionMetadataDownloadForm />);
    expect(container.querySelector('select[name="identifier"]')).toMatchSnapshot(
      'JurisdictionMetadataDownload file'
    );
  });
});
