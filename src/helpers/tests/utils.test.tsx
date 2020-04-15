import * as gatekeeper from '@onaio/gatekeeper';
import { cloneDeep, map } from 'lodash';
import MockDate from 'mockdate';
import moment from 'moment';
import {
  BLACK,
  TASK_BLUE as BLUE,
  TASK_GREEN as GREEN,
  TASK_PINK as PINK,
  TASK_PURPLE as PURPLE,
  TASK_RED as RED,
  TASK_YELLOW as YELLOW,
} from '../../colors';
import { ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE, PLAN_UUID_NAMESPACE } from '../../configs/env';
import { SORT_BY_EFFECTIVE_PERIOD_START_FIELD } from '../../constants';
import { irsPlanDefinition1 } from '../../containers/pages/InterventionPlan/IRS/tests/fixtures';
import * as planDefinitionFixtures from '../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { InterventionType, Plan } from '../../store/ducks/plans';
import { InitialTask } from '../../store/ducks/tasks';
import * as fixtures from '../../store/ducks/tests/fixtures';
import {
  Item,
  plan1,
  plan5,
  plan6,
  plan99,
  sortedPlansArray,
} from '../../store/ducks/tests/fixtures';
import * as helpers from '../errors';
import { colorMaps } from '../structureColorMaps';
import {
  descendingOrderSort,
  extractPlan,
  extractPlanRecordResponseFromPlanPayload,
  generateNameSpacedUUID,
  getColor,
  getColorByValue,
  getLocationColumns,
  IndicatorThresholdItemPercentage,
  isPlanDefinitionOfType,
  oAuthUserInfoGetter,
  removeNullJurisdictionPlans,
  roundToPrecision,
} from '../utils';
interface SampleColorMap {
  [key: string]: string;
}

/** common test functionality for contextual coloring
 * @param {InitialTask} task - a sample task object
 * @param {SampleColorMap} obj - minimum unique differences for colorMaps
 */
const getColorSharedTest = (task: InitialTask, obj: SampleColorMap) => {
  for (const [status, color] of Object.entries(obj)) {
    task.geojson.properties.task_business_status = status;
    expect(getColor(task)).toEqual(color);
  }
};

jest.mock('@onaio/gatekeeper', () => ({
  getOnadataUserInfo: jest.fn(),
  getOpenSRPUserInfo: jest.fn(),
}));

describe('helpers/utils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getLocationColumns works okay', () => {
    const items = [
      {
        identifier: 'province',
        level: 23,
        name: 'Province',
      },
      {
        identifier: 'district',
        level: 24,
        name: 'District',
      },
    ];

    expect(getLocationColumns(items, false)).toEqual([
      {
        Header: 'Province',
        accessor: 'province',
      },
      {
        Header: 'District',
        accessor: 'district',
      },
    ]);

    expect(getLocationColumns(items, true)).toEqual([
      {
        Header: 'Province',
        columns: [
          {
            Header: '',
            accessor: 'province',
          },
        ],
      },
      {
        Header: 'District',
        columns: [
          {
            Header: '',
            accessor: 'district',
          },
        ],
      },
    ]);
  });

  it('oAuthUserInfoGetter works for OpenSRP', () => {
    const mock = jest.spyOn(gatekeeper, 'getOpenSRPUserInfo');
    const resp = { foo: 'bar', oAuth2Data: { state: OPENSRP_OAUTH_STATE } };
    oAuthUserInfoGetter(resp);
    expect(mock).toHaveBeenCalledWith(resp);
    mock.mockRestore();
  });

  it('oAuthUserInfoGetter works for Ona', () => {
    const mock = jest.spyOn(gatekeeper, 'getOnadataUserInfo');
    const resp = { foo: 'bar', oAuth2Data: { state: ONADATA_OAUTH_STATE } };
    oAuthUserInfoGetter(resp);
    expect(mock).toHaveBeenCalledWith(resp);
    mock.mockRestore();
  });

  it('gets correct color for RACD Register Family', () => {
    const task = cloneDeep(fixtures.task1);
    const sampleColorMap: SampleColorMap = {
      Complete: PINK,
      Incomplete: RED,
      'Not Eligible': BLACK,
      'Not Visited': YELLOW,
      Refused: RED,
    };
    getColorSharedTest(task, sampleColorMap);
  });

  it('gets correct color for Mosquito collection action code', () => {
    const task = cloneDeep(fixtures.task1);
    task.geojson.properties.action_code = 'Mosquito Collection';
    const sampleColorMap: SampleColorMap = {
      Complete: GREEN,
      'In Progress': RED,
      Incomplete: RED,
      'Not Eligible': BLACK,
      'Not Visited': YELLOW,
    };
    getColorSharedTest(task, sampleColorMap);
  });

  it('gets correct color for Larval Dipping', () => {
    const task = cloneDeep(fixtures.task1);
    task.geojson.properties.action_code = 'Larval Dipping';
    const sampleColorMap: SampleColorMap = {
      Complete: GREEN,
      'In Progress': RED,
      Incomplete: RED,
      'Not Eligible': BLACK,
      'Not Visited': YELLOW,
    };
    getColorSharedTest(task, sampleColorMap);
  });

  it('gets correct color for IRS action code', () => {
    const task = cloneDeep(fixtures.task1);
    task.geojson.properties.action_code = 'IRS';
    const sampleColorMap: SampleColorMap = {
      'Not Sprayable': BLACK,
      'Not Sprayed': RED,
      'Not Visited': YELLOW,
      Refused: RED,
      Sprayed: GREEN,
    };
    getColorSharedTest(task, sampleColorMap);
  });

  it('gets correct color for Bednet action code', () => {
    const task = cloneDeep(fixtures.task1);
    task.geojson.properties.action_code = 'Bednet Distribution';
    const sampleColorMap: SampleColorMap = {
      Complete: BLUE,
      Incomplete: RED,
      'Not Eligible': BLACK,
      'Not Visited': YELLOW,
      Refused: RED,
    };
    getColorSharedTest(task, sampleColorMap);
  });

  it('gets correct color for Case Confirmation action code', () => {
    const task = cloneDeep(fixtures.task1);
    task.geojson.properties.action_code = 'Case Confirmation';
    const sampleColorMap: SampleColorMap = {
      Complete: GREEN,
      Incomplete: RED,
      'Not Eligible': BLACK,
      'Not Visited': YELLOW,
      Refused: RED,
    };
    getColorSharedTest(task, sampleColorMap);
  });

  it('gets correct color for Blood Screening action code', () => {
    const task = cloneDeep(fixtures.task1);
    task.geojson.properties.action_code = 'Blood Screening';
    const sampleColorMap: SampleColorMap = {
      Complete: PURPLE,
      Incomplete: RED,
      'Not Eligible': BLACK,
      'Not Visited': YELLOW,
      Refused: RED,
    };
    getColorSharedTest(task, sampleColorMap);
  });

  it('returns correct default color where necessary', () => {
    const invalidTaskActionCode = cloneDeep(fixtures.task1);
    invalidTaskActionCode.geojson.properties.action_code = 'Invalid Action Code';
    let color = getColor(invalidTaskActionCode);
    expect(color).toEqual(YELLOW);
    // implementing color map for BCC renders below test void
    const unimplementedTask = cloneDeep(fixtures.task1);
    unimplementedTask.geojson.properties.action_code = 'BCC';
    color = getColor(unimplementedTask);
    expect(color).toEqual(YELLOW);
  });

  it('returns Yellow for invalid business Status', () => {
    const invalidTask = cloneDeep(fixtures.task1);
    invalidTask.geojson.properties.task_business_status = 'Invalid Business Status';
    const color3 = getColor(invalidTask);
    expect(color3).toEqual(YELLOW);
  });

  it('gets correct color by value from colorMaps', () => {
    let color = getColorByValue(colorMaps.CASE_CONFIRMATION, 'Refused');
    expect(color).toEqual(RED);
    color = getColorByValue(colorMaps.CASE_CONFIRMATION, 'Sth Extraordinary');
    expect(color).toEqual(YELLOW);
  });

  it('extractPlan works', () => {
    expect(extractPlan(fixtures.plan99 as Plan)).toEqual({
      ...fixtures.plan99,
      canton: 'Laem Klat Canton 2',
      caseClassification: null,
      caseNotificationDate: '2019-07-03',
      district: 'Mueng Trat District 2',
      focusArea: 'Tha Sen 8',
      province: 'Trat 2',
      reason: 'Case Triggered',
      status: 'A1',
      village: 'Laem Klat Moo 8',
    });
  });

  it('extractPlan handles plans with null jurisdiction name path', () => {
    const plan: Plan = cloneDeep(fixtures.plan1);
    (plan as any).jurisdiction_name_path = 'null';
    const result = extractPlan(plan);
    const expected = {
      canton: null,
      caseClassification: null,
      caseNotificationDate: null,
      district: null,
      focusArea: plan.jurisdiction_name,
      id: plan.id,
      jurisdiction_depth: plan.jurisdiction_depth,
      jurisdiction_id: plan.jurisdiction_id,
      jurisdiction_name: plan.jurisdiction_name,
      jurisdiction_name_path: plan.jurisdiction_name_path,
      jurisdiction_parent_id: plan.jurisdiction_parent_id,
      jurisdiction_path: plan.jurisdiction_path,
      plan_date: plan.plan_date,
      plan_effective_period_end: plan.plan_effective_period_end,
      plan_effective_period_start: plan.plan_effective_period_start,
      plan_fi_reason: plan.plan_fi_reason,
      plan_fi_status: plan.plan_fi_status,
      plan_id: plan.plan_id,
      plan_intervention_type: plan.plan_intervention_type,
      plan_status: plan.plan_status,
      plan_title: plan.plan_title,
      plan_version: plan.plan_version,
      province: null,
      reason: plan.plan_fi_reason,
      status: plan.plan_fi_status,
      village: null,
    };
    expect(result).toEqual(expected);
  });

  it('rounds Decimal values correctly', () => {
    const values = [1, 1.2354532, 1.523, 0.002143, 0.00009, 2431, 9.9999];
    const precisions = [0, 2, 1, 0, 3, 4, 3];
    const expected = [1, 1.24, 1.5, 0, 0, 2431, 10];
    const got = map(values, (value, index) => roundToPrecision(value, precisions[index]));
    expect(got).toEqual(expected);
  });

  it('generates name spaced uuids', () => {
    MockDate.set('7-13-17 19:31', 3); // Mersenne primes :)
    expect(generateNameSpacedUUID('plan 1', PLAN_UUID_NAMESPACE)).toEqual(
      '1b3714e5-4fef-5e41-bb81-3800003e3b83'
    );
    expect(generateNameSpacedUUID('A2 Akros_2 2019-07-30', PLAN_UUID_NAMESPACE)).toEqual(
      'b3debab9-1da3-5a24-ad81-c5eb8dd0cbd2'
    );
    expect(generateNameSpacedUUID(moment().toString(), PLAN_UUID_NAMESPACE)).toEqual(
      `cd9a43dd-e408-5a4d-a360-ef59c6e7c2a6`
    );
  });

  it('filters out plans with null jurisdictions', () => {
    const result = removeNullJurisdictionPlans([plan5, plan6, plan1] as Plan[]);
    expect(result.length).toEqual(1);
    expect(result).toEqual([plan1]);
  });

  it('sorts plans array in descending order', () => {
    const sortedPlans = descendingOrderSort(
      [plan99, plan1] as Plan[],
      SORT_BY_EFFECTIVE_PERIOD_START_FIELD
    );
    expect(sortedPlans).toEqual(sortedPlansArray);
  });

  it('extractPlanRecordResponseFromPlanPayload shows error as expected', () => {
    const displayErrorMock = jest.fn();
    (helpers as any).displayError = displayErrorMock;
    const result = extractPlanRecordResponseFromPlanPayload([irsPlanDefinition1] as any);
    expect(result).toBeNull();
    expect(displayErrorMock).toHaveBeenCalledTimes(1);
  });

  it('computes the interventionType of a planDefinition correctly', () => {
    const sampleFIPlan = planDefinitionFixtures.plans[0];
    let result = isPlanDefinitionOfType(sampleFIPlan, InterventionType.FI);
    expect(result).toBeTruthy();
    result = isPlanDefinitionOfType(sampleFIPlan, InterventionType.IRS);
    expect(result).toBeFalsy();
    const sampleIRSPlan = planDefinitionFixtures.plans[1];
    result = isPlanDefinitionOfType(sampleIRSPlan, InterventionType.FI);
    expect(result).toBeFalsy();
    result = isPlanDefinitionOfType(sampleIRSPlan, InterventionType.IRS);
    expect(result).toBeTruthy();
  });
  it('Returns percentage value', () => {
    const result = IndicatorThresholdItemPercentage(Item);
    expect(result).toEqual('60%');
  });
  it('Should return percentage value with supplied decimal value', () => {
    const result = IndicatorThresholdItemPercentage(Item, 1);
    expect(result).toEqual('60.0%');
  });
});
