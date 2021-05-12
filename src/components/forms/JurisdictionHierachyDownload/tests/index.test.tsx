import { fireEvent, render, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import JurisdictionHierachyDownloadForm from '..';

jest.mock('../../../../configs/env');

describe('components/forms/JurisdictionMetadata', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<JurisdictionHierachyDownloadForm />);
  });

  it('renders correctly', () => {
    // emphasizes on fields showing up
    const wrapper = mount(<JurisdictionHierachyDownloadForm />);
    expect(toJson(wrapper.find('input#react-select-3-input'))).toMatchSnapshot(
      'JurisdictionHierachyDownloadForm react-select-3-input'
    );
  });
  it('Download disabled', async () => {
    const { getByText, getByTestId } = render(<JurisdictionHierachyDownloadForm />);
    fireEvent.submit(getByTestId('form'));
    await waitFor(() => {
      expect(getByText('Download File')).toBeDisabled();
    });
  });
});
