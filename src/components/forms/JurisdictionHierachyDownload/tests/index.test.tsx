import { fireEvent, render, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import JurisdictionHierachyDownloadForm, { Option, submitJurisdictionHierachyForm } from '..';
import * as helperUtils from '../../../../helpers/utils';
import { sampleHierarchy } from '../../../../store/ducks/opensrp/hierarchies/tests/fixtures';

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
  it('submitJurisdictionHierachyForm downloads CSV file', async () => {
    const jurisdictions: Option = { id: '', name: '' };
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const mockGrowl: any = jest.fn();
    const mockDownload: any = jest.fn();
    (helperUtils as any).successGrowl = mockGrowl;
    (helperUtils as any).downloadFile = mockDownload;
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        read: () => {
          return Promise.resolve(sampleHierarchy);
        },
      };
    });
    const props = {
      initialValues: {
        jurisdictions,
      },
      serviceClass: new mockedOpenSRPservice(),
    };
    submitJurisdictionHierachyForm(setSubmitting, setGlobalError, props as any, { jurisdictions });
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockGrowl).toBeCalled();
      expect(mockDownload).toBeCalled();
    });
  });
});
