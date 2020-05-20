import flushPromises from 'flush-promises';
import { OPENSRP_PLANS_BY_USER_FILTER } from '../../../constants';
import { loadPlansByUserFilter } from '../plans';

describe('helpers/dataLoading', () => {
  it('loadPractitioners works correctly', async () => {
    const someMockPlans = [{}];
    const userName = 'user1';
    const mockList = jest.fn(async () => someMockPlans);
    const mockActionCreator = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    loadPlansByUserFilter(userName, mockActionCreator, mockClass).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(`${OPENSRP_PLANS_BY_USER_FILTER}/${userName}`);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(someMockPlans, userName);
  });
});
