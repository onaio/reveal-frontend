import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedSMCJurisdictionReport, { SMCJurisdictionReport } from '../';
import { REPORT_MDA_POINT_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import { GenericPlan } from '../../../../../store/ducks/generic/plans';
import SMCPlanReducer, {
  reducerName as SMCPlansReducerName,
  SMCPLANType,
} from '../../../../../store/ducks/generic/SMCPlans';
import { MDAPointPlans, SMCPlans } from '../../../../../store/ducks/generic/tests/fixtures';
import { SMCReportingJurisdictions } from './fixtures';

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

/** register the reducers */
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(SMCPlansReducerName, SMCPlanReducer);

describe('components/SMC/JurisdictionReport', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (MDAPointPlans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_MDA_POINT_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_POINT_PLAN_URL}/${(SMCPlans[0] as SMCPLANType).plan_id}`,
      },
    };
    shallow(
      <Router history={history}>
        <SMCJurisdictionReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => SMCPlans);
    supersetServiceMock.mockImplementationOnce(async () => [SMCReportingJurisdictions[0]]);

    const planId = SMCPlans[1].plan_id;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId,
        },
        path: `${REPORT_MDA_POINT_PLAN_URL}/:planId`,
        url: `${REPORT_MDA_POINT_PLAN_URL}/${planId}`,
      },
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSMCJurisdictionReport {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(wrapper.find('GenericJurisdictionReport').props()).toMatchSnapshot();
    expect(toJson(wrapper.find('BreadcrumbItem li a'))).toMatchSnapshot();
    expect(wrapper.find('.page-title').text()).toEqual(
      'SMC Reporting: Nigeria Cycle 4 - SMC Implementation Plan'
    );
    expect((wrapper.find('DrillDownTable').props().data as any).length).toEqual(1);
    // check headers
    expect(wrapper.find('.thead .th').length).toEqual(10);
    expect(wrapper.find('.thead .th').map(item => item.text())).toEqual([
      'Name',
      'Operational Areas Visited',
      'Distribution Effectiveness (%)',
      'Total Structures',
      'Total Found Structures',
      'Total structures received SPAQ',
      'Found Coverage %',
      'Distribution Coverage %',
      'Treatment Coverage %',
      'Referral Treatment Rate %',
    ]);
  });
});
