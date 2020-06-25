import flushPromises from 'flush-promises';
import { OPENSRP_HIERARCHY_ENDPOINT } from '../../../constants';
import { LoadOpenSRPHierarchy } from '../jurisdictions';
import { failure, success } from '../utils';

describe('helpers/dataLoading.jurisdictions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it('loadHierarchy works correctly', async () => {
    const mockJurisdictionResponse = {};
    const mockRead = jest.fn(async () => mockJurisdictionResponse);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });

    const rootJurisdictionId = 'sampleJurisdiction';
    const res = await LoadOpenSRPHierarchy(rootJurisdictionId, mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_HIERARCHY_ENDPOINT);

    // Uses the correct service method
    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(res).toEqual(success(mockJurisdictionResponse));
  });

  it('loadHierarchy fails graciously', async () => {
    const erred = new Error('Bazinga');
    const mockRead = jest.fn(() => Promise.reject(erred));
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });

    const rootJurisdictionId = 'sampleJurisdiction';
    const res = await LoadOpenSRPHierarchy(rootJurisdictionId, mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_HIERARCHY_ENDPOINT);

    // Uses the correct service method
    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(res).toEqual(failure(erred));
  });
});
