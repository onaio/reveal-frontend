import flushPromises from 'flush-promises';
import {
  OPENSRP_GET_PLANS_COUNT,
  OPENSRP_PLANS,
  OPENSRP_PLANS_BY_USER_FILTER,
} from '../../../constants';
import { PlanPayload } from '../../../store/ducks/plans';
import * as utils from '../../utils';
import { loadOpenSRPPlans, loadPlansByUserFilter } from '../plans';

describe('helpers/dataLoading', () => {
  it('load plansByUserFilter works correctly', async () => {
    const someMockPlans = [{}];
    const userName = 'user1';
    const mockList = jest.fn(async () => someMockPlans);
    const sampleMockCreator = (args: any) => ({ type: 'someType', payload: args });
    const mockActionCreator = jest.fn(sampleMockCreator);
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    const responseMockCreator = jest.fn(sampleMockCreator);

    loadPlansByUserFilter(userName, mockActionCreator, mockClass, responseMockCreator).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(`${OPENSRP_PLANS_BY_USER_FILTER}/${userName}`);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(someMockPlans, userName);

    expect(responseMockCreator).toHaveBeenCalledWith(someMockPlans);
  });

  it('Plans and planids are pushed to store', async () => {
    const someMockPlans = [{}];
    const userName = 'user1';
    const mockList = jest.fn(async () => someMockPlans);
    const sampleMockCreator = (args: any) => ({ type: 'someType', payload: args });
    const mockActionCreator = jest.fn(sampleMockCreator);
    const SpyextractPlansFn = jest.spyOn(utils, 'extractPlanRecordResponseFromPlanPayload');
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    const responseMockCreator = jest.fn(sampleMockCreator);

    loadPlansByUserFilter(userName, mockActionCreator, mockClass, responseMockCreator, true).catch(
      e => {
        throw e;
      }
    );
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(`${OPENSRP_PLANS_BY_USER_FILTER}/${userName}`);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(someMockPlans, userName);

    // extracts plans
    expect(SpyextractPlansFn).toHaveBeenCalledTimes(1);

    // mock plans not valid hence dropped
    expect(responseMockCreator).toHaveBeenCalledWith([]);
  });

  it('load loadOpenSRP plans works correctly', async () => {
    const someMockPlans: PlanPayload[] = [];
    const mockList = jest.fn(async () => someMockPlans);
    const sampleMockCreator = (args: any) => ({ type: 'someType', payload: args });
    const setLoadingMock = jest.fn();
    const mockClass = jest.fn();
    mockClass.mockImplementationOnce(() => {
      return {
        list: jest.fn(async () => ({ count: 5000 })),
      };
    });
    mockClass.mockImplementationOnce(() => {
      return {
        list: mockList,
      };
    });
    await loadOpenSRPPlans(mockClass, sampleMockCreator, setLoadingMock);
    // tslint:disable-next-line: no-floating-promises
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass.mock.calls).toEqual([[OPENSRP_GET_PLANS_COUNT], [OPENSRP_PLANS]]);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(3);
    expect(mockList.mock.calls).toEqual([
      [{ pageNumber: 1, pageSize: 2000 }],
      [{ pageNumber: 2, pageSize: 2000 }],
      [{ pageNumber: 3, pageSize: 2000 }],
    ]);

    // setLoading
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });
});
