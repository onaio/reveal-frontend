import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import fs from 'fs';
import { createBrowserHistory } from 'history';
import path from 'path';
import React from 'react';
import { Router } from 'react-router';
import JurisdictionMetadataForm, { submitForm } from '..';
import { INVALID_CSV, UPLOAD_FILE, UPLOADING_FILE } from '../../../../configs/lang';
import { body } from './fixtures';

jest.mock('../../../../configs/env');

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

  it('CSV file with missing jurisdiction id', async () => {
    const { getByText, getByTestId, container } = render(<JurisdictionMetadataForm />);

    const invalidCsvPath = path.join(__dirname, 'fixtures', 'invalidData.csv');
    const fileContents = fs.readFileSync(invalidCsvPath);
    const file = new File([fileContents], 'invalidData.csv', { type: 'text/csv' });

    const fileInput = getByText('Upload File');
    fireEvent.change(fileInput, { target: { file: [file] } });
    fireEvent.submit(getByTestId('form'));

    /** Assert uploaded csv is invalid */
    await waitFor(() => {
      expect(container.getElementsByClassName('text-danger').length).toEqual(1);
      expect((container.getElementsByClassName('text-danger').item(0) as any).textContent).toEqual(
        INVALID_CSV
      );
    });
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

describe('uploads form', () => {
  const fetch = require('jest-fetch-mock');
  fetch.mockResponse(JSON.stringify({}), { status: 201 });

  const history = createBrowserHistory();

  it('uploads a csv file correctly, makes correct calls', async () => {
    const wrapper = mount(
      <Router history={history}>
        <JurisdictionMetadataForm />
      </Router>
    );

    const riskFileSampleDir = path.join(__dirname, 'fixtures', 'riskTest.csv');
    const fileContents = fs.readFileSync(riskFileSampleDir);
    const derivedBlob = new File([fileContents], 'riskTest.csv', { type: 'text/csv' });

    // simulate uploading the csv file.
    const fileInputField = wrapper.find('input#file');
    expect(toJson(fileInputField)).toMatchSnapshot('file input field');
    fileInputField.simulate('change', { target: { files: [derivedBlob] } });

    expect(wrapper.find('button[type="submit"]').props().disabled).toBeFalsy();

    // simulate submit
    wrapper.find('form').simulate('submit');

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/settings/sync',
        {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          body: JSON.stringify(body),
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'POST',
        },
      ],
    ]);
  });
});
