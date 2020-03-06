import * as utils from '../../../../../helpers/errors';
import { getEventId, planIsReactive } from '../utils';
import { planDefinition1, planDefinition2 } from './fixtures';

describe('src/containers/pages/InterventionPlan/updatePlan/utils', () => {
  it('Test planIsReactive for nominal case', () => {
    let result = planIsReactive(planDefinition1);
    expect(result).toBeTruthy();
    result = planIsReactive(planDefinition2);
    expect(result).toBeFalsy();
  });

  it('Test getEventId for nominal case', () => {
    let result = getEventId(planDefinition1);
    expect(result).toEqual('ee1f53cf-a6ce-41c0-a5cb-d0083009f973');
    result = getEventId(planDefinition2);
    expect(result).toEqual(null);
  });

  it('displayError is called where getEventId fails', () => {
    const displayErrorMock = jest.fn();
    (utils as any).displayError = displayErrorMock;
    getEventId(planDefinition1);
    getEventId(planDefinition2);
    expect(displayErrorMock).toHaveBeenCalledTimes(1);
  });
});
