import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { ducks } from 'gisida';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { APP, MAP_ID } from '../../../constants';
import store from '../../../store';
import * as fixtures from '../../../store/ducks/tests/fixtures';
import GisidaWrapper from '../index';

jest.mock('gisida-react', () => {
  const MapComponent = () => <div>I love oov</div>;
  return { Map: MapComponent };
});

reducerRegistry.register(APP, ducks.APP.default);
reducerRegistry.register(MAP_ID, ducks.MAP.default);

const history = createBrowserHistory();
describe('components/GisidaWrapper', () => {
  it('renders component without crashing', () => {
    const props = {
      geoData: fixtures.jurisdictions[0],
      goal: fixtures.goals,
      handlers: [],
      tasks: null,
    };
    shallow(
      <Router history={history}>
        <GisidaWrapper {...props} />
      </Router>
    );
  });

  it('renders map component without tasks', () => {
    const props = {
      basemapStyle: 'mapbox://styles/mapbox/satellite-v9',
      geoData: fixtures.jurisdictions[0],
      minHeight: '200px',
    };
    const wrapper = mount(<GisidaWrapper {...props} />);
    expect(store.getState().APP).toMatchSnapshot();
    expect(store.getState()['map-1']).toMatchSnapshot();
    expect(toJson(wrapper)).toMatchSnapshot();
    jest.useFakeTimers();
    wrapper.setProps({ ...props });
    wrapper.setState({ doRenderMap: true });
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot();
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
    });
    expect(store.getState()['map-1']).toMatchSnapshot({
      reloadLayers: expect.any(Number),
    });
    wrapper.unmount();
  });

  it('renders map component with tasks', () => {
    const props1 = {
      basemapStyle: 'mapbox://styles/mapbox/satellite-v9',
      currentGoal: null,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      tasks: fixtures.bednetTasks,
    };
    const props = {
      currentGoal: fixtures.task6.goal_id,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      tasks: fixtures.bednetTasks,
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    /** Investigate why it won't set state inside initmap even though
     * it goes into init map this leads to setting dorenderMap to state
     * manually
     */
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.find('MapComponent').props()).toMatchSnapshot();
    expect(store.getState().APP).toMatchSnapshot({
      accessToken: expect.any(String),
      apiAccessToken: expect.any(String),
    });
    expect(store.getState()['map-1']).toMatchSnapshot({
      reloadLayers: expect.any(Number),
    });
    wrapper.unmount();
  });

  it('works with DigitalGlobe base layer', () => {
    const props1 = {
      currentGoal: null,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      tasks: fixtures.bednetTasks,
    };
    const props = {
      currentGoal: fixtures.task6.goal_id,
      geoData: fixtures.jurisdictions[2],
      goal: fixtures.goals,
      handlers: [],
      tasks: fixtures.bednetTasks,
    };
    const wrapper = mount(<GisidaWrapper {...props1} />);
    wrapper.setState({ doRenderMap: true });
    wrapper.setProps({ ...props });
    expect(toJson(wrapper)).toMatchSnapshot();
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
    wrapper.unmount();
  });
});
