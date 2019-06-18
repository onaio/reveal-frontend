import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import { fetchGoals } from '../../../../../../store/ducks/goals';
import { fetchJurisdictions } from '../../../../../../store/ducks/jurisdictions';
import { fetchPlans } from '../../../../../../store/ducks/plans';
import { fetchTasks } from '../../../../../../store/ducks/tasks';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import ConnectedMapSingleFI, { SingleActiveFIMap } from '../../active/';

jest.mock('../../../../../../components/GisidaWrapper');
jest.mock('../../../../../../configs/env');

const history = createBrowserHistory();

describe('containers/pages/FocusInvestigation/activeMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      currentGoal: fixtures.goal3,
      featureCollection: {
        features: [fixtures.task4.geojson],
        type: 'FeatureCollection',
      },
      goals: [fixtures.goal3],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan1,
      tasks: fixtures.tasks,
    };
    shallow(
      <Router history={history}>
        <SingleActiveFIMap {...props} />
      </Router>
    );
  });

  it('renders SingleActiveFimap correctly', () => {
    const mock: any = jest.fn();
    const props = {
      currentGoal: fixtures.goal3,
      featureCollection: {
        features: [fixtures.task4.geojson],
        type: 'FeatureCollection',
      },
      goals: [fixtures.goal3],
      history,
      jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      plan: fixtures.plan1,
      tasks: fixtures.tasks,
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleActiveFIMap {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('GisidaWrapper').props()).toMatchSnapshot();
    wrapper.unmount();
  });

  it('works with redux store', () => {
    const mock: any = jest.fn();
    store.dispatch(fetchGoals([fixtures.goal3]));
    store.dispatch(fetchJurisdictions([fixtures.jurisdictions[0]]));
    store.dispatch(fetchPlans([fixtures.plan1]));
    store.dispatch(fetchTasks(fixtures.tasks));
    const props = {
      currentGoal: fixtures.goal3,
      featureCollection: {
        features: [fixtures.task4.geojson],
        type: 'FeatureCollection',
      },
      // goals: [fixtures.goal3],
      history,
      // jurisdiction: fixtures.jurisdictions[0],
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plan1.id },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/13`,
      },
      // plan: fixtures.plan1,
      // tasks: fixtures.tasks,
    };
    const wrapper = mount(
      <Router history={history}>
        <SingleActiveFIMap {...props} />
      </Router>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('GisidaWrapper').props()).toMatchSnapshot();
    wrapper.unmount();
  });

  // it('renders without crashing', () => {
  //     const mock: any = jest.fn();
  //     const props = {
  //         currentGoal: fixtures.goal3,
  //         featureCollection:{
  //             type: 'FeatureCollection',
  //             features: [fixtures.]
  //         };
  //         // fetchGoalsActionActionCreator;
  //         // fetchJurisdictionActionCreator;
  //         // fetchPlansActionCreator:
  //         // fetchTasksActionCreator;
  //         goals: [fixtures.goal3],
  //         jurisdiction: fixtures.jurisdictions[0],
  //         plan: fixtures.plan1,
  //         tasks: fixtures.tasks,
  //         history,
  //         location: mock,
  //         match:{
  //             isExact: true,
  //             params: {id: fixtures.plan1.id},
  //             path: `${FI_SINGLE_URL}/:id`,
  //             url: `${FI_SINGLE_URL}/13`,
  //         }
  //     };
  //     shallow(<Router history={history}>
  //         <SingleActiveFIMap {...props} />
  //     </Router>);
  // })
});
