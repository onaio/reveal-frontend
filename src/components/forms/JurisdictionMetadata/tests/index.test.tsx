import { fireEvent, render, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import JurisdictionMetadataForm, { submitForm } from '..';

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

  it('Upload disabled', async () => {
    const { getByText, getByTestId } = render(<JurisdictionMetadataForm />);
    fireEvent.submit(getByTestId('form'));
    await waitFor(() => {
      expect(getByText('Upload File')).toBeDisabled();
    });
  });

  it('submitForm uploads CSV file', async () => {
    const file = new File([''], 'jurisdiction.csv', { type: 'text/csv' });
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const setIfDoneHere = jest.fn();
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        create: () => {
          return Promise.resolve({});
        },
      };
    });
    const props = {
      initialValues: {
        file: new File([], ''),
      },
      serviceClass: new mockedOpenSRPservice(),
    };
    submitForm(setSubmitting, setGlobalError, setIfDoneHere, props as any, { file });
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
    });
  });
});
