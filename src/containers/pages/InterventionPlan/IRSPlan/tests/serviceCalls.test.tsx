import { OpenSRPService } from '../../../../../services/opensrp';
import { irsPlanDefinition1 } from '../../PlanningView/IRSPlans/tests/fixtures';
import { loadPlan } from '../serviceCalls';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('src/containers/pages/InterventionPlan/IRS/plan/serviceCals', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('loadPlan works correctly', async () => {
    // mock fetchPlanRecords
    const actionCreatorMock = jest.fn();
    fetch.once(JSON.stringify([irsPlanDefinition1]));

    loadPlan(OpenSRPService, 'someId', actionCreatorMock).catch(err => err);
    await new Promise(resolve => setImmediate(resolve));

    // check the url ; calls are as expected
    expect(fetch.mock.calls).toEqual([
      [
        'https://reveal-stage.smartregister.org/opensrp/rest/plans/someId',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ]);

    // action creator called correctly
    expect(actionCreatorMock).toHaveBeenCalledWith([
      {
        date: '2019-08-09',
        effective_period_end: '2019-08-29',
        effective_period_start: '2019-08-09',
        fi_reason: 'Routine',
        fi_status: 'A1',
        identifier: '0230f9e8-1f30-5e91-8693-4c993661785e',
        intervention_type: 'IRS',
        jurisdictions: ['3952'],
        name: 'IRS-2019-08-09',
        status: 'draft',
        title: 'IRS 2019-08-09',
        useContext: [
          {
            code: 'interventionType',
            valueCodableConcept: 'IRS',
          },
          {
            code: 'taskGenerationStatus',
            valueCodableConcept: 'False',
          },
        ],
        version: '1',
      },
    ]);
  });
});
