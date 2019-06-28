import * as gatekeeper from '@onaio/gatekeeper';
import { cloneDeep } from 'lodash';
import {
  BLACK,
  TASK_BLUE as BLUE,
  TASK_GREEN as GREEN,
  TASK_PINK as PINK,
  TASK_PURPLE as PURPLE,
  TASK_RED as RED,
  TASK_YELLOW as YELLOW,
} from '../../colors';
import { ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../../configs/env';
import { Plan } from '../../store/ducks/plans';
import { InitialTask } from '../../store/ducks/tasks';
import * as fixtures from '../../store/ducks/tests/fixtures';
import { colorMaps } from '../structureColorMaps';
import {
  extractPlan,
  getColor,
  getColorByValue,
  getLocationColumns,
  oAuthUserInfoGetter,
  transformValues,
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

  it('updates property names correctly', () => {
    const sample = {
      height: 0,
      name: null,
      weight: '65',
    };
    const expected = {
      height: '',
      name: '',
      weight: '65',
    };
    expect(transformValues(sample, ['name', 'height'])).toEqual(expected);
    expect(transformValues(sample, ['name', 'height'], '', [0, '0', null, 'null'])).toEqual(
      expected
    );
    const otherExpected = {
      height: 0,
      name: '',
      weight: '65',
    };
    expect(transformValues(sample, ['height', 'name'], '', [null, 'null'])).toEqual(otherExpected);
  });

  it('extractPlan handles plans with null jurisdiction name path', () => {
    const plan: Plan = cloneDeep(fixtures.plan1) as Plan;
    (plan as any).jurisdiction_name_path = 'null';
    const result = extractPlan(plan);
    const expected = {
      canton: null,
      caseClassification: null,
      caseNotificationDate: null,
      district: null,
      focusArea: plan.jurisdiction_name,
      id: plan.id,
      jurisdiction_id: plan.jurisdiction_parent_id,
      jurisdiction_parent_id: plan.jurisdiction_parent_id,
      plan_id: plan.plan_id,
      province: null,
      reason: plan.plan_fi_reason,
      status: plan.plan_fi_status,
      village: null,
    };
    expect(result).toEqual(expected);
  });
});
