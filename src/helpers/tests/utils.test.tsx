import * as gatekeeper from '@onaio/gatekeeper';
import { authenticateUser, updateExtraData } from '@onaio/session-reducer';
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
import store from '../../store';
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
  creatSettingsPayloads,
  descendingOrderSort,
  extractPlan,
  extractPlanRecordResponseFromPlanPayload,
  formatDates,
  generateNameSpacedUUID,
  getAcessTokenOrRedirect,
  getColor,
  getColorByValue,
  getLocationColumns,
  getPlanStatusToDisplay,
  getQueryParams,
  IndicatorThresholdItemPercentage,
  isPlanDefinitionOfType,
  oAuthUserInfoGetter,
  PapaResult,
  removeNullJurisdictionPlans,
  roundToPrecision,
  SettingConfiguration,
} from '../utils';
import { refreshTokenResponse, userAuthData } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
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
  refreshToken: jest.requireActual('@onaio/gatekeeper').refreshToken,
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

    // when case classification is available
    const caseClassification = 'A';
    const planCopy = { ...fixtures.plan99, case_classification: caseClassification };
    expect(extractPlan(planCopy as Plan)).toEqual({
      ...fixtures.plan99,
      canton: 'Laem Klat Canton 2',
      caseClassification,
      caseNotificationDate: '2019-07-03',
      case_classification: caseClassification,
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
    MockDate.reset();
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
    const result = extractPlanRecordResponseFromPlanPayload([fixtures.irsPlanDefinition1] as any);
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

  it('computes the interventionType of a planDefinition correctly with many interventionTypes', () => {
    const sampleFIPlan = planDefinitionFixtures.plans[0];
    let result = isPlanDefinitionOfType(sampleFIPlan, [InterventionType.FI, InterventionType.IRS]);
    expect(result).toBeTruthy();
    result = isPlanDefinitionOfType(sampleFIPlan, [
      InterventionType.IRS,
      InterventionType.DynamicFI,
    ]);
    expect(result).toBeFalsy();
    const sampleIRSPlan = planDefinitionFixtures.plans[1];
    result = isPlanDefinitionOfType(sampleIRSPlan, [
      InterventionType.FI,
      InterventionType.DynamicMDA,
    ]);
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

  it('gets query params from URL correctly', () => {
    const location = {
      hash: '',
      pathname: '/foo',
      query: {},
      search: '?q=venom',
      state: undefined,
    };
    expect(getQueryParams(location)).toEqual({
      q: 'venom',
    });
  });

  it('creates Payloads correctly', () => {
    /** test User */
    const testUser = {
      email: 'test@example.com',
      gravatar: '',
      name: 'test',
      username: 'testUser',
    };
    // dispatch user
    store.dispatch(authenticateUser(true, testUser));
    const result: PapaResult = {
      data: [
        {
          coverage: '30',
          jurisdiction_id: '79b139c-3a20-4656-b684-d2d9ed83c94e',
          jurisdiction_name: 'test1',
          risk: '80',
        },
        {
          coverage: '50',
          jurisdiction_id: '02ebbc84-5e29-4cd5-9b79-c594058923e9',
          jurisdiction_name: 'test2',
          risk: '70',
        },
      ],
      errors: [],
      meta: [],
    };

    const resultCopy = { ...result };

    const expectedPayload = {
      _id: '36ff5f7a-c13f-5205-9125-52cc324b935b',
      identifier: 'jurisdiction_metadata-coverage',
      settings: [
        {
          description: 'Jurisdiction Metadata for test1 id 79b139c-3a20-4656-b684-d2d9ed83c94e',
          key: '79b139c-3a20-4656-b684-d2d9ed83c94e',
          label: 'test1',
          uuid: 'e0968f38-be3b-56b7-babe-fd644c60860b',
          value: '30',
        },
        {
          description: 'Jurisdiction Metadata for test2 id 02ebbc84-5e29-4cd5-9b79-c594058923e9',
          key: '02ebbc84-5e29-4cd5-9b79-c594058923e9',
          label: 'test2',
          uuid: '7aaf15cc-150c-546c-b5d3-0c2738a48d6c',
          value: '50',
        },
      ],
      type: 'SettingConfiguration',
    };

    const payloads: SettingConfiguration[] = creatSettingsPayloads(result);
    const payload: SettingConfiguration = payloads[0];

    expect(payloads).toHaveLength(2);
    expect(payload).toEqual(expectedPayload);

    const payloadWithProvider: SettingConfiguration[] = creatSettingsPayloads(result, true);
    const expectedPayloadWithProvider = { ...expectedPayload, providerId: 'testUser' };
    expect(payloadWithProvider[0]).toEqual(expectedPayloadWithProvider);

    // data missing some values
    result.data[0].risk = '';
    result.data[1].risk = '';
    const partialInvalidPayloads: SettingConfiguration[] = creatSettingsPayloads(result);
    expect(partialInvalidPayloads).toHaveLength(1);
    expect(partialInvalidPayloads).toEqual([expectedPayload]);

    // data missing all values
    result.data[0].coverage = '';
    result.data[1].coverage = '';
    const invalidPayloads: SettingConfiguration[] = creatSettingsPayloads(result);
    expect(invalidPayloads).toHaveLength(0);
    expect(invalidPayloads).toEqual([]);

    // data missing jurisdiction id
    resultCopy.data[1].jurisdiction_id = '';
    const noJurisdictionId: SettingConfiguration[] = creatSettingsPayloads(result);
    expect(noJurisdictionId).toHaveLength(0);
    expect(noJurisdictionId).toEqual([]);
  });

  it('getPlanStatusToDisplay - eliminates unwanted plans', () => {
    expect(getPlanStatusToDisplay([])).toEqual(['active', 'complete', 'draft', 'retired']);
    expect(getPlanStatusToDisplay(['active'])).toEqual(['complete', 'draft', 'retired']);
    expect(getPlanStatusToDisplay(['active', 'draft'])).toEqual(['complete', 'retired']);
  });

  it('formatDates - formats dates correctly', () => {
    // valid date
    expect(formatDates('2020-09-26 00:00:00', 'YYYY-MM-DD')).toEqual('2020-09-26');
    expect(formatDates('2020-09-26 00:00:00', 'DD-MMM')).toEqual('26-Sep');

    // invalid dates
    expect(formatDates('test', 'YYYY-MM-HH')).toEqual('Invalid Date');
    const customInvalidMessage = 'Date provided is not valid';
    expect(formatDates('test', 'YYYY-MM-HH', customInvalidMessage)).toEqual(customInvalidMessage);
  });

  it('getAcessTokenOrRedirect works correctly', async () => {
    MockDate.set('1-1-2021 19:31');
    const displayErrorSpy = jest.spyOn(helpers, 'displayError');
    const envModule = require('../../configs/env');
    envModule.CHECK_SESSION_EXPIRY_STATUS = true;

    // no session found
    await getAcessTokenOrRedirect().catch(e => {
      expect(e.message).toEqual('Error: Your session is expired. Please renew session');
    });

    // acess token availble and not expired
    store.dispatch(updateExtraData(userAuthData));
    const token = await getAcessTokenOrRedirect();
    expect(token).toEqual(userAuthData.oAuth2Data.access_token);

    // refresh token when expired
    fetch.once(JSON.stringify(refreshTokenResponse));
    const authDataCopy = {
      ...userAuthData,
      oAuth2Data: {
        ...userAuthData.oAuth2Data,
        token_expires_at: '2019-01-02T14:11:20.102Z', // set token to expired
      },
    };
    store.dispatch(updateExtraData(authDataCopy));
    const newToken = await getAcessTokenOrRedirect();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(newToken).toEqual('refreshed-i-feel-new');

    // refresh token throws an error
    const errorMessage = 'API is down';
    fetch.mockRejectOnce(() => Promise.reject(errorMessage));
    store.dispatch(updateExtraData(authDataCopy));
    await getAcessTokenOrRedirect().catch(e => {
      expect(e.message).toEqual('Error: Your session is expired. Please renew session');
    });
    expect(displayErrorSpy).toHaveBeenCalledWith(new Error(errorMessage));
    MockDate.reset();
  });
});
