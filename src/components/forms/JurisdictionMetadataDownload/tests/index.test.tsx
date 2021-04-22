import { fireEvent, render, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import JurisdictionMetadataDownloadForm, { Option, submitForm } from '..';
import { ERROR_NO_JURISDICTION_METADATA_FOUND } from '../../../../configs/lang';
import { JURISDICTION_METADATA_RISK } from '../../../../constants';
import * as helperErrors from '../../../../helpers/errors';
import * as helperUtils from '../../../../helpers/utils';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

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

  it('passes right select options', () => {
    const wrapper = mount(<JurisdictionMetadataDownloadForm />);
    expect(wrapper.props().identifierOptions).toEqual([
      {
        label: 'Coverage',
        value: 'jurisdiction_metadata-coverage',
      },
      {
        label: 'Other Population (Unofficial)',
        value: 'jurisdiction_metadata-other-population',
      },
      {
        label: 'Population',
        value: 'jurisdiction_metadata-population',
      },
      {
        label: 'Risk',
        value: 'jurisdiction_metadata-risk',
      },
      {
        label: 'Structures',
        value: 'jurisdiction_metadata-structures',
      },
      {
        label: 'Target',
        value: 'jurisdiction_metadata-target',
      },
    ]);
  });

  it('Download disabled', async () => {
    const { getByText, getByTestId } = render(<JurisdictionMetadataDownloadForm />);
    fireEvent.submit(getByTestId('form'));
    await waitFor(() => {
      expect(getByText('Download File')).toBeDisabled();
    });
  });

  it('submitForm downloads CSV file', async () => {
    const identifier: Option = { value: JURISDICTION_METADATA_RISK, label: 'Risk' };
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const mockGrowl: any = jest.fn();
    const mockDownload: any = jest.fn();
    (helperUtils as any).successGrowl = mockGrowl;
    (helperUtils as any).downloadFile = mockDownload;
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve(fixtures.JurisdictionMetadata);
        },
      };
    });
    const props = {
      initialValues: {
        identifier,
      },
      serviceClass: new mockedOpenSRPservice(),
    };
    submitForm(setSubmitting, setGlobalError, props as any, { identifier });
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockGrowl).toBeCalled();
      expect(mockDownload).toBeCalled();
    });
  });

  it('csv file is not download is response is empty', async () => {
    const identifier: Option = { value: JURISDICTION_METADATA_RISK, label: 'Risk' };
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const mockGrowl: any = jest.fn();
    const mockDownload: any = jest.fn();
    const mockDisplayError: any = jest.fn();
    (helperUtils as any).successGrowl = mockGrowl;
    (helperUtils as any).downloadFile = mockDownload;
    (helperErrors as any).displayError = mockDisplayError;
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve([]);
        },
      };
    });
    const props = {
      initialValues: {
        identifier,
      },
      serviceClass: new mockedOpenSRPservice(),
    };
    submitForm(setSubmitting, setGlobalError, props as any, { identifier });
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockGrowl).not.toBeCalled();
      expect(mockDownload).not.toBeCalled();
      expect(mockDisplayError).toBeCalledWith(new Error(ERROR_NO_JURISDICTION_METADATA_FOUND));
    });
  });
});
