import {
  COMPLETE_PLAN_MESSAGE,
  PLAN_CHANGES_HAVE_NOT_BEEN_SAVED,
} from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import * as utils from '../../../../../helpers/errors';
import * as helperUtils from '../../../../../helpers/utils';
import { PlanStatus } from '../../../../../store/ducks/plans';
import { beforeSubmitFactory, getEventId, planIsReactive } from '../utils';
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

  it('beforeSubmit works on completing plan', () => {
    delete (window as any).confirm;
    const confirmMock = jest.fn(() => false);
    (window as any).confirm = confirmMock;

    const infoMockGrowl = jest.fn();
    (helperUtils as any).infoGrowl = infoMockGrowl;

    const originalPlanMock = ({ status: PlanStatus.DRAFT } as unknown) as PlanDefinition;
    const payloadPlanMock = ({ status: PlanStatus.COMPLETE } as unknown) as PlanDefinition;

    const beforeSubmit = beforeSubmitFactory(originalPlanMock);

    const res = beforeSubmit(payloadPlanMock);

    expect(confirmMock).toHaveBeenCalledWith(COMPLETE_PLAN_MESSAGE);
    expect(infoMockGrowl).toHaveBeenCalledWith(PLAN_CHANGES_HAVE_NOT_BEEN_SAVED);
    expect(res).toBeFalsy();
  });
});
