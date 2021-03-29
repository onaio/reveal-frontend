import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { PlanDefinitionList } from '../';
import { PLAN_LIST_URL } from '../../../../../constants';
import { extractPlanRecordResponseFromPlanPayload } from '../../../../../helpers/utils';
import store from '../../../../../store';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import plansByUserReducer, {
  reducerName as plansByUserReducerName,
} from '../../../../../store/ducks/opensrp/planIdsByUser';
import plansReducer, {
  fetchPlanRecords,
  reducerName as plansReducerName,
} from '../../../../../store/ducks/plans';

jest.mock('../../../../../configs/env', () => ({
  ...require.requireActual('../../../../../configs/env'),
  PLAN_LIST_SHOW_FI_REASON_COLUMN: true,
}));

const history = createBrowserHistory();

jest.mock('../../../../../components/forms/UserFilter', () => {
  return {
    UserSelectFilter: () => <div id="user-filter-mock">Filter users here</div>,
  };
});

/** register the plan definitions reducer */
reducerRegistry.register(plansReducerName, plansReducer);
reducerRegistry.register(plansByUserReducerName, plansByUserReducer);

const extractedPlanRecords = fixtures.plans
  .map((plan: any) => extractPlanRecordResponseFromPlanPayload(plan))
  .filter((plan: any) => !!plan);

describe('components/InterventionPlan/PlanDefinitionList: FI reason column', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2019-04-07T10:20:30Z').getTime());
  });

  it('show right columns when set to show FI reason columns', async () => {
    const envModule = require('../../../../../configs/env');
    envModule.PLAN_LIST_SHOW_FI_REASON_COLUMN = true;

    const mockList = jest.fn(async () => []);
    const mockClass: any = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    const fiPlans = extractedPlanRecords.filter(
      (plan: any) => plan.intervention_type === 'FI' || plan.intervention_type === 'Dynamic-FI'
    );
    store.dispatch(fetchPlanRecords(fiPlans));
    const props = {
      history,
      location: {
        hash: '',
        pathname: PLAN_LIST_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${PLAN_LIST_URL}`,
        url: `${PLAN_LIST_URL}`,
      },
      serviceClass: mockClass,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <PlanDefinitionList {...props} />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();
    // the table headers
    expect(wrapper.find('.thead .tr').text()).toMatchInlineSnapshot(
      `"TitleFocus Investigation ReasonStatusLast Modified"`
    );
    // plans displayed
    expect(wrapper.find('.tbody .tr').length).toEqual(fiPlans.length);
    fiPlans.map((_: any, i: number) => {
      expect(
        wrapper
          .find('.tbody .tr')
          .at(i)
          .text()
      ).toMatchSnapshot(`plan-${i}`);
    });
  });
});
