import { waitFor } from '@testing-library/react';
import Papaparse from 'papaparse';
import {
  FILE_DOWNLOADED_SUCCESSFULLY,
  JURISDICTION_HIERARCHY_TEMPLATE,
  STRUCTURE_HIERARCHY_TEMPLATE,
} from '../../../../configs/lang';
import {
  OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT,
  OPENSRP_STRUCTURE_HIERARCHY_ENDPOINT,
  TEXT_PLAIN,
} from '../../../../constants';
import * as helperUtils from '../../../../helpers/utils';
import { sampleHierarchy } from '../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { Option, submitJurisdictionHierachyForm, submitStructureHierachyForm } from '../helpers';
import { jurisdictionsCsvData, structureCsvData } from './fixtures/csvData';
import { structuresPayLoad } from './fixtures/structuresPayload';

jest.mock('../../../../configs/env');
// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('components/forms/JurisdictionMetadata/helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    const csv: string = Papaparse.unparse(jurisdictionsCsvData, { header: true });
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
    submitJurisdictionHierachyForm(setSubmitting, setGlobalError, props.serviceClass, {
      jurisdictions,
    });
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockedOpenSRPservice).toHaveBeenCalledWith(OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT);
      expect(mockGrowl).toBeCalled();
      expect(mockGrowl).toBeCalledWith(FILE_DOWNLOADED_SUCCESSFULLY);
      expect(mockDownload).toBeCalled();
      expect(mockDownload).toBeCalledWith(csv, fileName, TEXT_PLAIN);
    });
  });

  it('submitStructureHierachyForm downloads CSV file', async () => {
    const jurisdictions: Option = { id: 'test_id', name: 'kenya' };
    fetch.once(JSON.stringify(structuresPayLoad));
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const mockGrowl: any = jest.fn();
    const mockDownload: any = jest.fn();
    (helperUtils as any).successGrowl = mockGrowl;
    (helperUtils as any).downloadFile = mockDownload;
    const csv: string = Papaparse.unparse(structureCsvData, { header: true });
    const fileName = `${jurisdictions.name}_${STRUCTURE_HIERARCHY_TEMPLATE}.csv`;
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        list: () => {
          return Promise.resolve(structuresPayLoad);
        },
      };
    });
    const props = {
      initialValues: {
        jurisdictions,
      },
      serviceClass: new mockedOpenSRPservice(OPENSRP_STRUCTURE_HIERARCHY_ENDPOINT),
    };
    submitStructureHierachyForm(setSubmitting, setGlobalError, props.serviceClass, {
      jurisdictions,
    });
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockedOpenSRPservice).toHaveBeenCalledWith(OPENSRP_STRUCTURE_HIERARCHY_ENDPOINT);
      expect(mockGrowl).toBeCalled();
      expect(mockGrowl).toBeCalledWith(FILE_DOWNLOADED_SUCCESSFULLY);
      expect(mockDownload).toBeCalled();
      expect(mockDownload).toBeCalledWith(csv, fileName, TEXT_PLAIN);
    });
  });
});
