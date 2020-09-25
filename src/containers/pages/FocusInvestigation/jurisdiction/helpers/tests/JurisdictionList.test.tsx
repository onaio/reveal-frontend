import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import store from '../../../../../../store';
import plansReducer, {
  fetchPlans,
  FetchPlansAction,
  makePlansArraySelector,
  Plan,
  reducerName as plansReducerName,
} from '../../../../../../store/ducks/plans';
import {
  plan101,
  plan102,
  plan103,
  plan104,
  plan99,
} from '../../../../../../store/ducks/tests/fixtures';
import JurisdictionList from '../JurisdictionList';

jest.mock('../../../../../../configs/env');
/** register reducers */
reducerRegistry.register(plansReducerName, plansReducer);

describe('containers/FocusInvestigation/Jurisdiction/JurisdictionList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getMapStateToProps works as expected', () => {
    const envModule = require('../../../../../../configs/env');
    envModule.DISPLAYED_PLAN_TYPES = 'FI,IRS,MDA,MDA-Point,Dynamic-FI,Dynamic-IRS,Dynamic-MDA'.split(
      ','
    );
    store.dispatch(fetchPlans([plan99, plan101, plan102, plan103, plan104] as Plan[]));

    const getPlansArray = makePlansArraySelector();

    const SomeComponent = (_: any) => <div>mosh</div>;

    /** ObjectList options */
    const objectListOptions = {
      actionCreator: fetchPlans,
      dispatchPropName: 'actionCreator',
      returnPropName: 'planz',
      selector: getPlansArray,
    };

    const ClassBasedView = new JurisdictionList<Plan, FetchPlansAction, typeof getPlansArray, any>(
      SomeComponent,
      objectListOptions
    );

    const mapStateToProps = ClassBasedView.getMapStateToProps();

    expect(typeof mapStateToProps === 'function').toBeTruthy();

    let ownProps = {
      match: {
        isExact: true,
        params: { jurisdictionId: '4550a8ab-b310-4881-8c76-1b6a817ea63a' },
        path: `test/:jurisdictionId`,
        url: `test/4550a8ab-b310-4881-8c76-1b6a817ea63a`,
      },
    };

    expect(mapStateToProps(store.getState(), ownProps)).toEqual({
      completeReactivePlans: [plan101],
      completeRoutinePlans: [plan103],
      currentReactivePlans: [plan99],
      currentRoutinePlans: [plan102, plan104],
    });

    ownProps = {
      match: {
        isExact: true,
        params: { jurisdictionId: 'some-random-jurisdiction' },
        path: `test/:jurisdictionId`,
        url: `test/some-random-jurisdiction`,
      },
    };

    expect(mapStateToProps(store.getState(), ownProps)).toEqual({
      completeReactivePlans: [],
      completeRoutinePlans: [],
      currentReactivePlans: [],
      currentRoutinePlans: [],
    });
  });
});
