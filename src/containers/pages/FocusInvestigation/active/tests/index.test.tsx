import { library } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import DrillDownTable from '@onaio/drill-down-table/dist/types';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import MockDate from 'mockdate';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_PLAN_TYPE } from '../../../../../constants';
import { CURRENT_FOCUS_INVESTIGATION } from '../../../../../constants';
import store from '../../../../../store';
import reducer, { fetchPlans, reducerName } from '../../../../../store/ducks/plans';
import { Plan } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedActiveFocusInvestigation, { ActiveFocusInvestigation } from '../../active';
import { ActiveFIProps } from '../index';
import { activeFocusInvestigationProps } from './fixtures';
reducerRegistry.register(reducerName, reducer);

library.add(faExternalLinkSquareAlt);
const history = createBrowserHistory();
jest.mock('../../../../../configs/env');

describe('containers/pages/ActiveFocusInvestigation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.reset();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
    };
    shallow(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders without crashing for null jurisdictions_name_path', () => {
    const mock: any = jest.fn();
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
    };
    shallow(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
  });

  it('renders ActiveFocusInvestigation correctly $ changes page title', () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      caseTriggeredPlans: [fixtures.plan2],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
      supersetService: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(CURRENT_FOCUS_INVESTIGATION);
    expect(wrapper.find(ActiveFocusInvestigation).props().caseTriggeredPlans).toEqual(
      activeFocusInvestigationProps.caseTriggeredPlans
    );
    expect(wrapper.find(ActiveFocusInvestigation).props().routinePlans).toEqual(
      activeFocusInvestigationProps.routinePlans
    );
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb').props()).toEqual({
      currentPage: {
        label: 'Focus Investigations',
        url: '/focus-investigation',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    });
    wrapper.unmount();
  });

  it('renders ActiveFocusInvestigation correctly for null jurisdictions', () => {
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      caseTriggeredPlans: [fixtures.plan2] as Plan[],
      fetchPlansActionCreator: jest.fn(),
      history,
      location: mock,
      match: mock,
      routinePlans: [fixtures.plan1],
      supersetService: mock,
    };
    const wrapper = mount(
      <Router history={history}>
        <ActiveFocusInvestigation {...props} />
      </Router>
    );
    expect(wrapper.find(ActiveFocusInvestigation).props().caseTriggeredPlans).toEqual(
      activeFocusInvestigationProps.caseTriggeredPlans
    );
    expect(wrapper.find(ActiveFocusInvestigation).props().routinePlans).toEqual(
      activeFocusInvestigationProps.routinePlans
    );
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    expect(wrapper.find('HeaderBreadcrumb').props()).toEqual({
      currentPage: {
        label: 'Focus Investigations',
        url: '/focus-investigation',
      },
      pages: [
        {
          label: 'Home',
          url: '/',
        },
      ],
    });
    wrapper.unmount();
  });

  it('works with the Redux store', () => {
    store.dispatch(fetchPlans(fixtures.plans));
    const mock: any = jest.fn();
    mock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      history,
      location: mock,
      match: mock,
      supersetService: mock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    wrapper.update();
    expect(toJson(wrapper.find('.ReactTable').find('Cell'))).toMatchSnapshot();
    wrapper.unmount();
  });

  it('calls superset with the correct params', () => {
    const actualFormData = superset.getFormData;
    const getFormDataMock: any = jest.fn();
    getFormDataMock.mockImplementation((...args: any) => {
      return actualFormData(...args);
    });
    superset.getFormData = getFormDataMock;
    const mock: any = jest.fn();
    const supersetMock: any = jest.fn();
    supersetMock.mockImplementation(() => Promise.resolve(fixtures.plans));
    const props = {
      history,
      location: mock,
      match: mock,
      supersetService: supersetMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedActiveFocusInvestigation {...props} />
        </Router>
      </Provider>
    );
    const supersetParams = {
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: 'FI',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_intervention_type',
        },
      ],
      row_limit: 2000,
    };

    const supersetCallList = [
      [2000, [{ comparator: FI_PLAN_TYPE, operator: '==', subject: 'plan_intervention_type' }]],
    ];
    expect((superset.getFormData as any).mock.calls).toEqual(supersetCallList);
    expect(supersetMock).toHaveBeenCalledWith(0, supersetParams);
    wrapper.unmount();
  });
});
