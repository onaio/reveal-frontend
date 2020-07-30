import { fireEvent, render, waitFor } from '@testing-library/react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Papaparse from 'papaparse';
import React from 'react';
import JurisdictionHierachyDownloadForm, { Option, submitJurisdictionHierachyForm } from '..';
import {
  FILE_DOWNLOADED_SUCCESSFULLY,
  JURISDICTION_HIERARCHY_TEMPLATE,
} from '../../../../configs/lang';
import { OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT, TEXT_PLAIN } from '../../../../constants';
import * as helperUtils from '../../../../helpers/utils';
import { sampleHierarchy } from '../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { csvData } from './fixtures/csvData';

jest.mock('../../../../configs/env');
// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

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
    fetch.once(JSON.stringify(sampleHierarchy));
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const mockGrowl: any = jest.fn();
    const mockDownload: any = jest.fn();
    (helperUtils as any).successGrowl = mockGrowl;
    (helperUtils as any).downloadFile = mockDownload;
    const csv: string = Papaparse.unparse(csvData, { header: true });
    const fileName = `${JURISDICTION_HIERARCHY_TEMPLATE}.csv`;
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
      serviceClass: new mockedOpenSRPservice(OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT),
    };
    submitJurisdictionHierachyForm(setSubmitting, setGlobalError, props as any, { jurisdictions });
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockedOpenSRPservice).toHaveBeenCalledWith(OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT);
      expect(mockGrowl).toBeCalled();
      expect(mockGrowl).toBeCalledWith(FILE_DOWNLOADED_SUCCESSFULLY);
      expect(mockDownload).toBeCalled();
      expect(mockDownload).toBeCalledWith(csv, fileName, TEXT_PLAIN);
    });
  });
});
