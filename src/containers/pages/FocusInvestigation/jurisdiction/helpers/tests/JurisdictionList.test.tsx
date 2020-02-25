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
import { plan101, plan102, plan103, plan99 } from '../../../../../../store/ducks/tests/fixtures';
import JurisdictionList from '../JurisdictionList';

/** register reducers */
reducerRegistry.register(plansReducerName, plansReducer);

describe('containers/FocusInvestigation/Jurisdiction/JurisdictionList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getMapStateToProps works as expected', () => {
    store.dispatch(fetchPlans([plan99, plan101, plan102, plan103] as Plan[]));

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

    const ownProps = {
      match: {
        isExact: true,
        params: { jurisdictionId: '4550a8ab-b310-4881-8c76-1b6a817ea63a' },
        path: `test/:jurisdictionId`,
        url: `test/4550a8ab-b310-4881-8c76-1b6a817ea63a`,
      },
    };

    const mapStateToProps = ClassBasedView.getMapStateToProps();

    expect(mapStateToProps(store.getState(), ownProps)).toEqual({
      completeReactivePlans: [plan101],
      completeRoutinePlans: [plan103],
      currentReactivePlans: [plan99],
      currentRoutinePlans: [plan102],
    });
  });
});
