import flushPromises from 'flush-promises';
import { OpenSRPService } from '../../../../../../services/opensrp';
import { assignments } from '../../JurisdictionAssignmentForm/tests/fixtures';
import { getAllAssignments } from '../serviceHooks';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../../configs/env');

describe('src/containers/pages/PractitionerViews/helpers/serviceHooks', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.mockClear();
    fetchMock.resetMocks();
  });

  it('getAllPractitioners works correctly', async () => {
    fetch.once(JSON.stringify(assignments));
    const mockFn = jest.fn();
    const planId = '123-123-123';
    await getAllAssignments(OpenSRPService, planId, mockFn, { getAll: false });
    await flushPromises();
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization/assignedLocationsAndPlans?pageNumber=1&pageSize=1000&plan=123-123-123'
    );
  });
  it('getAllPractitioners works correctly with pagination', async () => {
    fetch.once(JSON.stringify(assignments));
    fetch.once(JSON.stringify(assignments));
    fetch.once(JSON.stringify([]));
    const mockFn = jest.fn();
    const planId = '123-123-123';
    await getAllAssignments(OpenSRPService, planId, mockFn, { getAll: true });
    await flushPromises();
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization/assignedLocationsAndPlans?pageNumber=1&pageSize=1000&plan=123-123-123'
    );
    expect(fetch.mock.calls[1][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization/assignedLocationsAndPlans?pageNumber=2&pageSize=1000&plan=123-123-123'
    );
    expect(fetch.mock.calls[2][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/organization/assignedLocationsAndPlans?pageNumber=3&pageSize=1000&plan=123-123-123'
    );
  });
});
