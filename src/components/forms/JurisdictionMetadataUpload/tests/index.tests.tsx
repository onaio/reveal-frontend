import { render } from '@testing-library/react';
import React from 'react';
import JurisdictionMetadataUploadForm from '..';

describe('components/forms/JurisdictionMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<JurisdictionMetadataUploadForm />);
  });
});
