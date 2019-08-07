import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy } from 'lodash';
import { FlushThunks } from 'redux-testkit';
import { PlanDefinition } from '../../../../../configs/settings';
import store from '../../../../index';
import { InterventionType } from '../../../plans';
import reducer, {
  fetchPlanDefinitions,
  getPlanDefinitionById,
  getPlanDefinitionsArray,
  getPlanDefinitionsById,
  reducerName,
} from '../index';
import * as fixtures from './fixtures';

reducerRegistry.register(reducerName, reducer);

describe('reducers/opensrp/PlanDefinition', () => {
  let flushThunks;

  beforeEach(() => {
    flushThunks = FlushThunks.createMiddleware();
    jest.resetAllMocks();
  });

  it('should have initial state', () => {
    expect(getPlanDefinitionsArray(store.getState())).toEqual([]);
    expect(getPlanDefinitionById(store.getState(), '356b6b84-fc36-4389-a44a-2b038ed2f38d')).toEqual(
      null
    );
    expect(getPlanDefinitionsById(store.getState())).toEqual({});
  });

  it('Fetches plan definitions correctly', () => {
    // action creators dispatch
    store.dispatch(fetchPlanDefinitions(fixtures.plans as PlanDefinition[]));

    expect(getPlanDefinitionsArray(store.getState())).toEqual(fixtures.plans);
    expect(getPlanDefinitionById(store.getState(), '356b6b84-fc36-4389-a44a-2b038ed2f38d')).toEqual(
      fixtures.plans[0]
    );
    expect(getPlanDefinitionsById(store.getState())).toEqual(keyBy(fixtures.plans, 'identifier'));

    // filter by intervention type
    expect(getPlanDefinitionsArray(store.getState(), InterventionType.FI)).toEqual([
      fixtures.plans[0],
      fixtures.plans[2],
      fixtures.plans[3],
    ]);
    expect(getPlanDefinitionsArray(store.getState(), InterventionType.IRS)).toEqual([
      fixtures.plans[1],
    ]);
  });
});
