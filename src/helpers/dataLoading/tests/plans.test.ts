import flushPromises from 'flush-promises';
import { OPENSRP_PLANS, OPENSRP_PLANS_BY_USER_FILTER } from '../../../constants';
import { PlanPayload } from '../../../store/ducks/plans';
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

  it('load loadOpenSRP plans works correctly', async () => {
    const someMockPlans: PlanPayload[] = [];
    const mockList = jest.fn(async () => someMockPlans);
    const sampleMockCreator = (args: any) => ({ type: 'someType', payload: args });
    const setLoadingMock = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    loadOpenSRPPlans(mockClass, sampleMockCreator, setLoadingMock);
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_PLANS);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);

    // setLoading
    expect(setLoadingMock).toHaveBeenCalledWith(false);
  });
});
