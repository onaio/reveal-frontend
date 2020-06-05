import flushPromises from 'flush-promises';
import { OPENSRP_PLANS_BY_USER_FILTER } from '../../../constants';
import { loadPlansByUserFilter } from '../plans';

describe('helpers/dataLoading', () => {
  it('loadPractitioners works correctly', async () => {
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
});
