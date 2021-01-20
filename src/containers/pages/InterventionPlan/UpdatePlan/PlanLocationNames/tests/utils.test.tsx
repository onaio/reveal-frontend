import { OpenSRPService } from '../../../../../../services/opensrp';
import { loadLocations } from '../utils';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../../configs/env');

describe('src/containers/pages/InterventionPlan/UpdatePlan/PlanLoc.utils', () => {
  it('loadLocations works correctly', async () => {
    const mockActionCreator = jest.fn();
    fetch.once(JSON.stringify([]));
    loadLocations(OpenSRPService, 'somePlanId', mockActionCreator).catch(err => {
      throw err;
    });

    await new Promise(resolve => setImmediate(resolve));
    // made the correct call(hit the correct endpoints)
    expect(fetch.mock.calls[0]).toEqual([
      'https://test.smartregister.org/opensrp/rest/plans/findLocationNames/somePlanId',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer null',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ]);

    // dispatched the correct stuff
    expect(mockActionCreator.mock.calls[0]).toEqual([[], 'somePlanId']);
  });
});
