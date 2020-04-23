import flushPromises from 'flush-promises';
import { OPENSRP_PLANS } from '../../../constants';
import { plans } from '../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { fetchPlanRecords } from '../../../store/ducks/plans';
import { asyncGetPlanRecords } from '../plansService';
import { planRecordJSON1, planResponseJSON1 } from './fixtures';

describe('src/helpers/dataLoadingUtils', () => {
  it('asyncGetPlanRecords works correctly', async () => {
    const mockList = jest.fn(async () => [plans[0]]);
    const mockActionCreator = jest.fn((args: any) => fetchPlanRecords(args));
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    const controller = new AbortController();

    asyncGetPlanRecords({ service: mockClass, fetchPlansCreator: mockActionCreator }, controller)
      .then(response => expect(response).toEqual([planRecordJSON1]))
      .catch(e => {
        throw e;
      });

    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_PLANS, controller.signal);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith([planResponseJSON1]);
  });
});
