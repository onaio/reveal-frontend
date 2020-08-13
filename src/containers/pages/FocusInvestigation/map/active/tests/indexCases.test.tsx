import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import * as goalDucks from '../../../../../../store/ducks/goals';
import * as jurisdictionDucks from '../../../../../../store/ducks/jurisdictions';
import * as planDucks from '../../../../../../store/ducks/plans';
import * as structureDucks from '../../../../../../store/ducks/structures';
import * as tasksDucks from '../../../../../../store/ducks/tasks';
import ConnectedMapSingleFI from '../../active/';
import * as fixturesMap from './fixtures';

jest.mock('../../../../../../components/GisidaLite', () => {
  const GisidaLiteMock = () => <div>I love oov</div>;
  const MemoizedGisidaLiteMock = () => <div>I love oov</div>;

  return {
    GisidaLite: GisidaLiteMock,
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});
jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();
const { fetchGoals } = goalDucks;
const { fetchJurisdictions } = jurisdictionDucks;
const fetchPlans = planDucks.fetchPlans;
const { fetchTasks } = tasksDucks;

describe('containers/pages/FocusInvestigation/activeMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(goalDucks.removeGoalsAction);
    store.dispatch(jurisdictionDucks.removeJurisdictionsAction);
    store.dispatch(planDucks.removePlansAction);
    store.dispatch(structureDucks.removeStructuresAction);
    store.dispatch(tasksDucks.removeTasksAction);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  it('passes historical index cases to gisida lite', async () => {
    // use dispatch
    store.dispatch(fetchPlans(fixturesMap.processedPlansJSON));
    store.dispatch(fetchJurisdictions(fixturesMap.processedJurisdictionJSON));
    store.dispatch(structureDucks.setStructures(fixturesMap.processedStructuresJSON));
    store.dispatch(fetchGoals(fixturesMap.processedGoalsJSON));
    store.dispatch(fetchTasks(fixturesMap.processedPlansTasksJson));
    store.dispatch(fetchTasks(fixturesMap.processedCaseConfirmationTasksJSON));
    const mock = jest.fn();
    const supersetServiceMock = jest.fn(async () => null);
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: 'dbd9851f-2548-5aaa-8267-010897f98f45' },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/dbd9851f-2548-5aaa-8267-010897f98f45`,
      },
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    const componentProps: any = wrapper.find('SingleActiveFIMap').props();

    expect(componentProps.plan.id).toEqual('dbd9851f-2548-5aaa-8267-010897f98f45');
    expect(componentProps.jurisdiction.jurisdiction_id).toEqual('3951');
    expect(componentProps.pointFeatureCollection.features.length).toEqual(95);
    expect(componentProps.polygonFeatureCollection.features.length).toEqual(7);
    expect(componentProps.currentPointIndexCases.features.length).toEqual(1);
    expect(componentProps.currentPolyIndexCases.features.length).toEqual(0);
    expect(componentProps.historicalPointIndexCases.features.length).toEqual(0);
    expect(componentProps.historicalPolyIndexCases.features.length).toEqual(2);

    // gisida lite layers
    const gisidaLiteProps: any = wrapper.find('MemoizedGisidaLiteMock').props();
    const { layers } = gisidaLiteProps;

    layers.forEach((layer: any) => {
      const layerProps = layer.props;
      // remove data so that we do not pollute the snapshot
      const localLayer = cloneDeep(layerProps);
      delete localLayer.data;
      expect(localLayer).toMatchSnapshot();
    });
  });

  it('displays historical indices for empty map', async () => {
    // use dispatch
    store.dispatch(fetchPlans(fixturesMap.processedPlansJSON));
    store.dispatch(fetchJurisdictions(fixturesMap.processedJurisdictionJSON));
    store.dispatch(structureDucks.setStructures(fixturesMap.processedStructuresJSON));
    store.dispatch(fetchGoals(fixturesMap.processedGoalsJSON));
    store.dispatch(fetchTasks(fixturesMap.processedPlansTasksJson));
    store.dispatch(fetchTasks(fixturesMap.processedCaseConfirmationTasksJSON));
    const mock = jest.fn();
    const supersetServiceMock = jest.fn(async () => null);
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '94af1ec6-52c9-5bbb-8453-0ff71d572400' },
        path: `${FI_SINGLE_URL}/:id`,
        url: `${FI_SINGLE_URL}/94af1ec6-52c9-5bbb-8453-0ff71d572400`,
      },
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMapSingleFI {...props} />
        </Router>
      </Provider>
    );
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    const componentProps: any = wrapper.find('SingleActiveFIMap').props();

    expect(componentProps.plan.id).toEqual('94af1ec6-52c9-5bbb-8453-0ff71d572400');
    expect(componentProps.jurisdiction.jurisdiction_id).toEqual('3951');
    expect(componentProps.pointFeatureCollection.features.length).toEqual(0);
    expect(componentProps.polygonFeatureCollection.features.length).toEqual(0);
    expect(componentProps.currentPointIndexCases).toEqual(null);
    expect(componentProps.currentPolyIndexCases).toEqual(null);
    expect(componentProps.historicalPointIndexCases.features.length).toEqual(1);
    expect(componentProps.historicalPolyIndexCases.features.length).toEqual(2);

    // gisida lite layers
    const gisidaLiteProps: any = wrapper.find('MemoizedGisidaLiteMock').props();
    const { layers } = gisidaLiteProps;

    layers.forEach((layer: any) => {
      const layerProps = layer.props;
      // remove data so that we do not pollute the snapshot
      const localLayer = cloneDeep(layerProps);
      delete localLayer.data;
      expect(localLayer).toMatchSnapshot();
    });
  });
});
