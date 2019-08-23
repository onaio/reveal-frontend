import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Actions, ducks } from 'gisida';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { goalsWithSymbols } from '../../../configs/settings';
import { APP, MAP_ID } from '../../../constants';
import { FeatureCollection, toggleLayer, wrapFeatureCollection } from '../../../helpers/utils';
import store from '../../../store';
import { Task, TaskGeoJSON } from '../../../store/ducks/tasks';
import * as fixtures from '../../../store/ducks/tests/fixtures';
import GisidaWrapper from '../index';
import { appState, gisidaWrapperProps, layer1, map1Fixture } from './fixtures';

jest.mock('gisida-react', () => {
  const MapComponent = () => <div>I love oov</div>;
  return { Map: MapComponent };
});

jest.mock('../../../configs/env');
jest.useFakeTimers();

reducerRegistry.register(APP, ducks.APP.default);
reducerRegistry.register(MAP_ID, ducks.MAP.default);
const history = createBrowserHistory();
describe('components/GisidaWrapper', () => {
  it('renders component without crashing', () => {
    const props = {
      geoData: fixtures.jurisdictions[0],
      goal: fixtures.goals,
      handlers: [],
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    shallow(
      <Router history={history}>
        <GisidaWrapper {...props} />
      </Router>
    );
  });

  it('renders given symbol layers based on currentGoal', () => {
    /* get this from settings file so when someone adds a goal that should render a symbol layer 
      the snapshots fail **/
    goalsWithSymbols.forEach(goal => {
      const polygonFeatureCollection: FeatureCollection<TaskGeoJSON> = {
        features: fixtures.polygonTask.map((task: any) => task.geojson),
        type: 'FeatureCollection',
      };
      const pointFeatureCollection: FeatureCollection<TaskGeoJSON> = {
        features: fixtures.pointTasks.map((task: any) => task.geojson),
        type: 'FeatureCollection',
      };

      const props1 = {
        basemapStyle: 'mapbox://styles/mapbox/satellite-v9',
        currentGoal: null,
        geoData: fixtures.jurisdictions[2],
        goal: fixtures.goals,
        handlers: [],
        pointFeatureCollection,
        polygonFeatureCollection,
        structures: wrapFeatureCollection([fixtures.structure1.geojson]),
      };
      const props = {
        currentGoal: goal,
        geoData: fixtures.jurisdictions[2],
        goal: fixtures.goals,
        handlers: [],
        pointFeatureCollection,
        polygonFeatureCollection,
        structures: wrapFeatureCollection([fixtures.structure1.geojson]),
      };
      const wrapper = mount(<GisidaWrapper {...props1} />);
      /** Investigate why it won't set state inside initmap even though
       * it goes into init map this leads to setting dorenderMap to state
       * manually
       */
      wrapper.setState({ doRenderMap: true });
      wrapper.setProps({ ...props });

      jest.runOnlyPendingTimers();
      const layer = store.getState()['map-1'].layers;

      for (const goalLayer in layer) {
        if (layer.hasOwnProperty(goalLayer)) {
          expect(layer[goalLayer]).toMatchSnapshot();
        }
      }

      const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
      wrapper.unmount();
      expect(componentWillUnmount).toHaveBeenCalled();
    });
  });

  it('renders map component without Featurecollection', () => {
    const props = {
      basemapStyle: 'mapbox://styles/mapbox/satellite-v9',
      geoData: fixtures.jurisdictions[0],
      minHeight: '200px',
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    const wrapper = mount(<GisidaWrapper {...props} />);
    expect(store.getState().APP).toMatchSnapshot(JSON.stringify(appState));
    const map1 = store.getState()['map-1'];
    // remove reloadLayers because they keep changing
    delete map1.reloadLayers;
    expect(map1).toMatchSnapshot({});
    expect(toJson(wrapper).props).toEqual(gisidaWrapperProps);
    wrapper.setProps({ ...props });
    wrapper.setState({ doRenderMap: true });
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
    expect(toJson(wrapper).props).toMatchSnapshot(JSON.stringify(gisidaWrapperProps));
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot('Map component');
    store.dispatch((Actions as any).mapRendered('map-1', true));
    store.dispatch((Actions as any).mapLoaded('map-1', true));
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
    });
    jest.runOnlyPendingTimers();
    expect(store.getState()['map-1']).toMatchSnapshot({
      currentRegion: expect.any(Number),
      reloadLayers: expect.any(Number),
    });
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  it('renders map component with FeatureCollection', () => {
    const polygonFeatureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.polygonTask.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };
    const pointFeatureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.pointTasks.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };

    const props1 = {
      basemapStyle: 'mapbox://styles/mapbox/satellite-v9',
      currentGoal: null,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      pointFeatureCollection,
      polygonFeatureCollection,
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    const props = {
      currentGoal: fixtures.task3.goal_id,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      pointFeatureCollection,
      polygonFeatureCollection,
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    /** Investigate why it won't set state inside initmap even though
     * it goes into init map this leads to setting dorenderMap to state
     * manually
     */
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(toJson(wrapper)).toMatchSnapshot('gisida wrapper 1');
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot({});
    store.dispatch((Actions as any).mapRendered('map-1', true));
    store.dispatch((Actions as any).mapLoaded('map-1', true));
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
    });

    jest.runOnlyPendingTimers();
    /** Investigate why it won't toggleLayers considering.
     * point and polygon featurecollection has been added to props
     * Had to add toggling functionality to test that out.
     */
    const allLayers = store.getState()['map-1'].layers;
    toggleLayer(allLayers, props.currentGoal, store, Actions);
    const map1 = store.getState()['map-1'];
    delete map1.currentRegion;
    delete map1.reloadLayers;
    expect(map1).toEqual(map1Fixture);
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  it('works with DigitalGlobe base layer', () => {
    const polygonFeatureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.polygonTask.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };
    const pointFeatureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.pointTasks.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };

    const props1 = {
      currentGoal: null,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      pointFeatureCollection,
      polygonFeatureCollection,
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    const props = {
      currentGoal: fixtures.task6.goal_id,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      pointFeatureCollection,
      polygonFeatureCollection,
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(toJson(wrapper)).toMatchSnapshot('gisida wrapper');
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
      mapConfig: {
        style: {
          sources: {
            diimagery: {
              tiles: [expect.any(String)],
            },
          },
        },
      },
    });
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });

  it('renders map component with structures', () => {
    const polygonFeatureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.polygonTask.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };
    const pointFeatureCollection: FeatureCollection<TaskGeoJSON> = {
      features: fixtures.pointTasks.map((task: any) => task.geojson),
      type: 'FeatureCollection',
    };

    const props1 = {
      currentGoal: null,
      geoData: fixtures.jurisdictions[1],
      goal: fixtures.goals,
      handlers: [],
      pointFeatureCollection,
      polygonFeatureCollection,
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    const props = {
      currentGoal: fixtures.task6.goal_id,
      geoData: fixtures.jurisdictions[1],
      goal: fixtures.goals,
      handlers: [],
      pointFeatureCollection,
      polygonFeatureCollection,
      structures: wrapFeatureCollection([fixtures.structure1.geojson]),
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    /** Investigate why it won't set state inside initmap even though
     * it goes into init map this leads to setting dorenderMap to state
     * manually
     */
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot('map component');
    store.dispatch((Actions as any).mapRendered('map-1', true));
    store.dispatch((Actions as any).mapLoaded('map-1', true));
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
      mapConfig: {
        style: {
          sources: {
            diimagery: {
              tiles: [expect.any(String)],
            },
          },
        },
      },
    });
    jest.runOnlyPendingTimers();
    /** Investigate why it won't toggleLayers considering.
     * point and polygon featurecollection has been added to props
     * Had to add toggling functionality to test that out.
     */

    const allLayers = store.getState()['map-1'].layers;
    toggleLayer(allLayers, props.currentGoal, store, Actions);
    expect(store.getState()['map-1']).toMatchSnapshot({
      currentRegion: expect.any(Number),
      reloadLayers: expect.any(Number),
    });
    const componentWillUnmount = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
    wrapper.unmount();
    expect(componentWillUnmount).toHaveBeenCalled();
  });
});
