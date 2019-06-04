import * as gatekeeper from '@onaio/gatekeeper';
import { cloneDeep } from 'lodash';
import { BLACK, GREEN, RED, YELLOW } from '../../colors';
import { ONADATA_OAUTH_STATE, OPENSRP_OAUTH_STATE } from '../../configs/env';
import * as fixtures from '../../store/ducks/tests/fixtures';
import colorMaps from '../structureColorMaps';
import { getColor, getColorByValue, getLocationColumns, oAuthUserInfoGetter } from '../utils';

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

  it('getColorbyValue gets correct color', () => {
    let color = getColor(fixtures.task1);
    expect(color).toEqual(YELLOW);

    color = getColor(fixtures.task2);
    expect(color).toEqual(YELLOW);
    color = getColor(fixtures.task3);
    expect(color).toEqual(GREEN);
    color = getColor(fixtures.task1);
    expect(color).toEqual(YELLOW);
    // custom tasks for sampling other action codes and statuses
    const task5 = cloneDeep(fixtures.task1);
    task5.geojson.properties.action_code = 'Case Confirmation';
    task5.geojson.properties.task_business_status = 'Refused';
    color = getColor(task5);
    expect(color).toEqual(RED);
    const task6 = cloneDeep(fixtures.task1);
    task6.geojson.properties.action_code = 'Larval Dipping';
    task6.geojson.properties.task_business_status = 'Not Eligible';
    color = getColor(task6);
    expect(color).toEqual(BLACK);
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

  it('returns null for invalid business Status', () => {
    /** getting null probably means business status received
     * from api did not match any of those recognized by this app
     */
    const invalidTask = cloneDeep(fixtures.task1);
    invalidTask.geojson.properties.task_business_status = 'Invalid Business Status';
    const color3 = getColor(invalidTask);
    expect(color3).toBeNull();
  });

  it('gets correct color by value from colorMaps', () => {
    let color = getColorByValue(colorMaps.CASE_CONFIRMATION, 'Refused');
    expect(color).toEqual(RED);
    color = getColorByValue(colorMaps.CASE_CONFIRMATION, 'Sth Extraordinary');
    expect(color).toBeNull();
  });
});
