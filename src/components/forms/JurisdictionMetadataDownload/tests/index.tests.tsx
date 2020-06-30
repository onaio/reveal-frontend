import { render } from '@testing-library/react';
import React from 'react';
import JurisdictionMetadataDownloadForm from '..';

describe('components/forms/JurisdictionMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<JurisdictionMetadataDownloadForm />);
  });
});
