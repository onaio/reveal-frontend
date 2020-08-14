import { fireEvent, render, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import JurisdictionMetadataForm, { submitForm } from '..';
import { INVALID_CSV, UPLOAD_FILE, UPLOADING_FILE } from '../../../../configs/lang';

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

  it('form validation works', async () => {
    const { getByText, getByTestId } = render(<JurisdictionMetadataForm />);
    fireEvent.submit(getByTestId('form'));
    /** Assert Validation Response and Button disable */
    await waitFor(() => {
      expect(getByText('Upload File')).toBeDisabled();
    });
  });

  it('file type validation works', async () => {
    const { getByText, getByTestId, container } = render(<JurisdictionMetadataForm />);
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const fileInput = getByText('Upload File');
    fireEvent.change(fileInput, { target: { file: [file] } });
    fireEvent.submit(getByTestId('form'));
    // submit button text changes
    expect((container.getElementsByClassName('btn-primary').item(0) as any).textContent).toEqual(
      UPLOADING_FILE
    );
    /** Assert Validation Response and Button disable */
    await waitFor(() => {
      expect(getByText('Upload File')).toBeDisabled();
      expect((container.getElementsByClassName('btn-primary').item(0) as any).textContent).toEqual(
        UPLOAD_FILE
      );
    });
    /** Assert uploaded csv is invalid */
    expect(container.getElementsByClassName('text-danger').length).toEqual(1);
    expect((container.getElementsByClassName('text-danger').item(0) as any).textContent).toEqual(
      INVALID_CSV
    );
    fireEvent.click(getByTestId('file'));
    // error is cleared on clicking to choose another file
    expect(container.getElementsByClassName('text-danger').length).toEqual(0);
  });

  it('submitForm uploads CSV file', async () => {
    const fileContents = 'jurisdiction_id, jurisdiction_name';
    const file = new File([fileContents], 'jurisdiction.csv', { type: 'text/csv' });
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
