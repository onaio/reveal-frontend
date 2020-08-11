import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { PlanStatus } from '../../../../../store/ducks/plans';

const plan = { ...plans[0] };

export const afterDraftSave = [
  'https://reveal-stage.smartregister.org/opensrp/rest/plans',
  {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    body: JSON.stringify({ ...plan, jurisdiction: [{ code: '3951' }], status: PlanStatus.DRAFT }),
    headers: {
      accept: 'application/json',
      authorization: 'Bearer null',
      'content-type': 'application/json;charset=UTF-8',
    },
    method: 'PUT',
  },
];

export const afterSaveAndActivate = [
  'https://reveal-stage.smartregister.org/opensrp/rest/plans',
  {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    body: JSON.stringify({ ...plan, jurisdiction: [{ code: '3951' }], status: PlanStatus.ACTIVE }),
    headers: {
      accept: 'application/json',
      authorization: 'Bearer null',
      'content-type': 'application/json;charset=UTF-8',
    },
    method: 'PUT',
  },
];
