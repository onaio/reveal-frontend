import { library } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../constants';
import store from '../../../../../store';
import { fetchGoals } from '../../../../../store/ducks/goals';
import { fetchJurisdictions } from '../../../../../store/ducks/jurisdictions';
import { fetchPlans, Plan } from '../../../../../store/ducks/plans';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import ConnectedSingleFI, { SingleFI } from '../../single';

jest.mock('../../../../../components/GisidaWrapper', () => {
  const GisidaWrapperMock = () => <div>I love oov</div>;
  return GisidaWrapperMock;
});

jest.mock('../../../../../configs/env');
jest.mock('@onaio/superset-connector', () => {
  // tslint:disable-next-line: label-position
  const superset = {
    getFormData: () => ({}),
  };
  return superset;
});
const history = createBrowserHistory();
library.add(faExternalLinkSquareAlt);
describe('containers/pages/SingleFI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      completeReactivePlansArray: [fixtures.completeReactivePlan],
      completeRoutinePlansArray: [fixtures.completeRoutinePlan],
      currentReactivePlansArray: [fixtures.plan2],
      currentRoutinePlansArray: [fixtures.plan1],
      goalsArray: fixtures.plan1Goals,
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      planById: fixtures.plan1 as Plan,
      plansIdArray: fixtures.plansIdArray,
    };
    shallow(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
  });

  it('renders SingleFI correctly', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      completeReactivePlansArray: [fixtures.completeReactivePlan],
      completeRoutinePlansArray: [fixtures.completeRoutinePlan],
      currentReactivePlansArray: [fixtures.plan2],
      currentRoutinePlansArray: [fixtures.plan1],
      goalsArray: fixtures.plan1Goals,
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      planById: fixtures.plan1 as Plan,
      plansIdArray: fixtures.plansIdArray,
      supersetService: supersetServiceMock,
      // tslint:disable-next-line: object-literal-sort-keys
      fetchPlansActionCreator: jest.fn(),
      fetchGoalsActionCreator: jest.fn(),
      fetchJurisdictionActionCreator: jest.fn(),
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
    // check that the documents title was changed correctly
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('Focus Investigations in NVI_439');

    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('GisidaWrapperMock').props()).toMatchSnapshot();
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.unmount();
  });

  it('renders SingleFI correctly for null plan jurisdction id', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    const props = {
      completeReactivePlansArray: [],
      completeRoutinePlansArray: [],
      currentReactivePlansArray: [],
      currentRoutinePlansArray: [],
      goalsArray: [],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan5.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      planById: fixtures.plan5,
      plansArray: [fixtures.plan5],
      plansIdArray: [fixtures.plan5.id],
      supersetService: supersetServiceMock,
      // tslint:disable-next-line: object-literal-sort-keys
      fetchPlansActionCreator: jest.fn(),
      fetchGoalsActionCreator: jest.fn(),
      fetchJurisdictionActionCreator: jest.fn(),
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleFI {...props} />
      </Router>
    );
    expect(wrapper.find('GisidaWrapperMock').length).toEqual(0);
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.unmount();
  });

  it('It works with the Redux store', () => {
    const mock: any = jest.fn();
    const supersetServiceMock: any = jest.fn(async () => []);
    store.dispatch(fetchPlans(fixtures.plans as Plan[]));
    store.dispatch(fetchGoals(fixtures.goals));
    store.dispatch(fetchJurisdictions(fixtures.jurisdictions));
    const props = {
      completeReactivePlansArray: [fixtures.completeReactivePlan],
      completeRoutinePlansArray: [fixtures.completeRoutinePlan],
      currentReactivePlansArray: [fixtures.plan2],
      currentRoutinePlansArray: [fixtures.plan1],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/16`,
      },
      supersetService: supersetServiceMock,
      // tslint:disable-next-line: object-literal-sort-keys
      fetchPlansActionCreator: jest.fn(),
      fetchGoalsActionCreator: jest.fn(),
      fetchJurisdictionActionCreator: jest.fn(),
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSingleFI {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('GisidaWrapperMock').props()).toMatchSnapshot();
    wrapper.unmount();
  });

  it('calls superset with the correct params', () => {
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
    expect(supersetMock).toHaveBeenCalledWith(0, {});
    wrapper.unmount();
  });
});
