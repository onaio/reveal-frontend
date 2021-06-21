import { setEnv } from '../utils';

describe('helpers/utils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets an env var value to integer type', () => {
    const envModule = require('../../configs/env');
    envModule.SUPERSET_MAX_RECORDS = 1;
    let recordsNumber = Number(setEnv('REACT_APP_SUPERSET_MAX_RECORDS', '1'));
    expect(typeof recordsNumber).toEqual('number');
    recordsNumber = setEnv('REACT_APP_SUPERSET_MAX_RECORDS', '1');
    expect(typeof recordsNumber).toEqual('string');
  });
});
