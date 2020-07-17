import flushPromises from 'flush-promises';
import {
  OPENSRP_FIND_LOCATION_BY_JURISDICTION_IDS,
  OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT,
  OPENSRP_PLANS,
  OPENSRP_V2_SETTINGS,
} from '../../../constants';
import {
  loadJurisdiction,
  loadJurisdictionsMetadata,
  LoadOpenSRPHierarchy,
  putJurisdictionsToPlan,
} from '../jurisdictions';
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
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT);

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
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT);

    // Uses the correct service method
    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(res).toEqual(failure(erred));
  });
  it('puts jurisdictions for a plan', async () => {
    const mockPlan: any = {};
    const jurisdictionIds = ['1', '2', '3'];
    const mockUpdate = jest.fn(() => Promise.resolve({}));
    const mockActionCreator = jest.fn();
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        update: mockUpdate,
      };
    });
    let response = await putJurisdictionsToPlan(
      mockPlan,
      jurisdictionIds,
      mockClass,
      mockActionCreator
    );
    await new Promise(resolve => setImmediate(resolve));
    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_PLANS);

    // Uses the correct service method
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(response).toEqual(success({}));

    /** check for failure */
    const err = new Error('Down');
    const errMockUpdate = jest.fn(() => Promise.reject(err));
    const errMockClass: any = jest.fn().mockImplementation(() => {
      return {
        update: errMockUpdate,
      };
    });

    response = await putJurisdictionsToPlan(
      mockPlan,
      jurisdictionIds,
      errMockClass,
      mockActionCreator
    );
    await new Promise(resolve => setImmediate(resolve));
    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_PLANS);

    // Uses the correct service method
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(response).toEqual(failure(err));
  });

  it('loads jurisdiction correctly', async () => {
    const mockJurisdictionResponse = [{}];
    const mockList = jest.fn(async () => mockJurisdictionResponse);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    const res = await loadJurisdiction('jurisdictionId', mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_FIND_LOCATION_BY_JURISDICTION_IDS);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);
    expect(res).toEqual(success({}));
  });

  it('loads jurisdiction bad response', async () => {
    const mockJurisdictionResponse: any = [];
    const mockList = jest.fn(async () => mockJurisdictionResponse);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    const res = await loadJurisdiction('jurisdictionId', mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_FIND_LOCATION_BY_JURISDICTION_IDS);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);
    expect(res && res.error).toBeDefined();
  });

  it('error when loading jurisdiction', async () => {
    const err = new Error('Bazinga');
    const mockList = jest.fn(async () => Promise.reject(err));
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    const res = await loadJurisdiction('jurisdictionId', mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_FIND_LOCATION_BY_JURISDICTION_IDS);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);
    expect(res).toEqual(failure(err));
  });
  it('loads jurisdictions metadata successfully', async () => {
    const mockJurisdictionsMetadataResponse = [{}];
    const mockRead = jest.fn(async () => mockJurisdictionsMetadataResponse);
    const sampleMockCreator = (args: any) => ({ type: 'someType', payload: args });
    const mockActionCreator = jest.fn(sampleMockCreator);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });
    const settingsIdentifier = 'jurisdiction_metadata-test-risk';
    loadJurisdictionsMetadata(settingsIdentifier, mockClass, mockActionCreator).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_V2_SETTINGS);

    // Uses the correct service method
    expect(mockRead).toHaveBeenCalledTimes(1);
    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(mockJurisdictionsMetadataResponse);
  });
});
