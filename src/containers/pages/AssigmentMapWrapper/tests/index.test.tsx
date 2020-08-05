import reducerRegistry from '@onaio/redux-reducer-registry';
import { FeatureCollection } from '@turf/turf';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import { EventData } from 'mapbox-gl';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { AssignmentMapWrapper, ConnectedAssignmentMapWrapper, onJurisdictionClick } from '..';
import { getJurisdictions } from '../../../../components/TreeWalker/helpers';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import hierachyReducer, {
  deselectNode,
  fetchTree,
  fetchUpdatedCurrentParent,
  getCurrentChildren,
  reducerName as hierachyReducerName,
  selectNode,
} from '../../../../store/ducks/opensrp/hierarchies';
import { sampleHierarchy } from '../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import jurisdictionsReducer, {
  fetchJurisdictions,
  reducerName as jurisdictionsReducerName,
  removeJurisdictions,
} from '../../../../store/ducks/opensrp/jurisdictions';
import jurisdictionMetadataReducer, {
  reducerName as jurisdictionMetadataReducerName,
} from '../../../../store/ducks/opensrp/jurisdictionsMetadata';
import plansReducer, {
  reducerName as plansReducerName,
} from '../../../../store/ducks/opensrp/PlanDefinition';
import * as fixtures from './fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

reducerRegistry.register(jurisdictionsReducerName, jurisdictionsReducer);
reducerRegistry.register(hierachyReducerName, hierachyReducer);
reducerRegistry.register(jurisdictionMetadataReducerName, jurisdictionMetadataReducer);
reducerRegistry.register(plansReducerName, plansReducer);

const history = createBrowserHistory();

jest.mock('../../../../components/GisidaLite', () => {
  const MemoizedGisidaLiteMock = () => <div>I love oov</div>;
  return {
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});
jest.mock('../../../../configs/env');

describe('containers/pages/AssigmentMapWrapper', () => {
  /** renders correctly, a full render cycle
   *  check that errors are raised.
   * works correctly wth store
   */
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    fetchMock.mockClear();
    fetchMock.resetMocks();
  });

  afterEach(() => store.dispatch(removeJurisdictions()));

  it('renders successfully', () => {
    shallow(
      <Router history={history}>
        <AssignmentMapWrapper />
      </Router>
    );
  });
  it('renders jurisdictions assignment map', () => {
    store.dispatch(fetchJurisdictions(fixtures.payload as any));
    const props = {
      currentParentId: '07b09ec1-0589-4a98-9480-4c403ac24d59',
      getJurisdictionsFeatures: fixtures.geoCollection as FeatureCollection,
      rootJurisdictionId: '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <AssignmentMapWrapper {...props} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper.find('MemoizedGisidaLiteMock div'))).toMatchSnapshot(
      'MemoizedGisidaLiteMock div'
    );
    expect(toJson(wrapper.find('AssignmentMapWrapper'))).toMatchSnapshot();
    wrapper.unmount();
  });
  it('works correctly with store', async () => {
    fetch.mockResponseOnce(JSON.stringify([fixtures.jurisdiction1]), { status: 200 });
    store.dispatch(fetchJurisdictions(fixtures.payload as any));
    const props = {
      currentParentId: '2492',
      rootJurisdictionId: '2492',
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAssignmentMapWrapper {...props} />
        </Router>
      </Provider>
    );
    const params = {
      is_jurisdiction: true,
      return_geometry: true,
    };
    const result = await getJurisdictions(['2492'], params, 1);
    await flushPromises();
    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/location/findByJurisdictionIds?is_jurisdiction=true&return_geometry=true&jurisdiction_ids=2492',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ]);
    expect(fetch.mock.calls).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find('AssignmentMapWrapper').props()).toEqual({
      autoSelectNodesActionCreator: expect.any(Function),
      currentChildren: [],
      currentParentId: '2492',
      currentParentNode: undefined,
      deselectNodeCreator: expect.any(Function),
      fetchJurisdictionsActionCreator: expect.any(Function),
      fetchUpdatedCurrentParentActionCreator: expect.any(Function),
      getJurisdictionsFeatures: {
        features: [],
        type: 'FeatureCollection',
      },
      rootJurisdictionId: '2492',
      selectNodeCreator: expect.any(Function),
      serviceClass: OpenSRPService,
    });
    expect(result).toEqual({ error: null, value: [fixtures.jurisdiction1] });
    wrapper.unmount();
  });
  it('test that jurisdictions are fetched correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify([fixtures.jurisdiction1]), { status: 200 });
    store.dispatch(fetchTree(sampleHierarchy, '2942'));
    const children = getCurrentChildren()(store.getState(), {
      currentParentId: '2942',
      leafNodesOnly: true,
      rootJurisdictionId: '2942',
    });
    const props = {
      currentChildren: [children] as any,
      currentParentId: '3019',
      fetchJurisdictionsActionCreator: fetchJurisdictions,
      fetchUpdatedCurrentParentActionCreator: fetchUpdatedCurrentParent,
      getJurisdictionsFeatures: fixtures.geoCollection as any,
      rootJurisdictionId: '2942',
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAssignmentMapWrapper {...props} />
        </Router>
      </Provider>
    );
    const params = {
      is_jurisdiction: true,
      return_geometry: true,
    };
    const result = await getJurisdictions(['2942'], params, 20);
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(wrapper.find('AssignmentMapWrapper').props()).toEqual({
      autoSelectNodesActionCreator: expect.any(Function),
      currentChildren: expect.any(Array),
      currentParentId: '3019',
      currentParentNode: expect.any(Object),
      deselectNodeCreator: expect.any(Function),
      fetchJurisdictionsActionCreator: expect.any(Function),
      fetchUpdatedCurrentParentActionCreator: expect.any(Function),
      getJurisdictionsFeatures: {
        features: [],
        type: 'FeatureCollection',
      },
      rootJurisdictionId: '2942',
      selectNodeCreator: expect.any(Function),
      serviceClass: OpenSRPService,
    });
    expect(result).toEqual({ error: null, value: expect.any(Array) });
    wrapper.unmount();
  });
  it('tests that geojson is loaded correctly in store', async () => {
    fetch.mockResponseOnce(JSON.stringify([fixtures.jurisdiction1]), { status: 200 });
    store.dispatch(fetchTree(sampleHierarchy, '2942'));
    store.dispatch(fetchJurisdictions(fixtures.payload as any));
    const children = getCurrentChildren()(store.getState(), {
      currentParentId: '2942',
      leafNodesOnly: true,
      rootJurisdictionId: '2942',
    });
    const props = {
      currentChildren: [children] as any,
      currentParentId: '3019',
      fetchJurisdictionsActionCreator: fetchJurisdictions,
      fetchUpdatedCurrentParentActionCreator: fetchUpdatedCurrentParent,
      getJurisdictionsFeatures: fixtures.geoCollection as any,
      rootJurisdictionId: '2942',
      serviceClass: OpenSRPService,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAssignmentMapWrapper {...props} />
        </Router>
      </Provider>
    );
    const params = {
      is_jurisdiction: true,
      return_geometry: true,
    };
    const result = await getJurisdictions(['2942'], params, 20);
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(wrapper.find('AssignmentMapWrapper').props()).toEqual({
      autoSelectNodesActionCreator: expect.any(Function),
      currentChildren: expect.any(Array),
      currentParentId: '3019',
      currentParentNode: expect.any(Object),
      deselectNodeCreator: expect.any(Function),
      fetchJurisdictionsActionCreator: expect.any(Function),
      fetchUpdatedCurrentParentActionCreator: expect.any(Function),
      getJurisdictionsFeatures: {
        features: [fixtures.geoCollection.features[1]],
        type: 'FeatureCollection',
      },
      rootJurisdictionId: '2942',
      selectNodeCreator: expect.any(Function),
      serviceClass: OpenSRPService,
    });
    expect(result).toEqual({ error: null, value: expect.any(Array) });
    wrapper.unmount();
  });
  it('handles jurisdiction click on map', async () => {
    await flushPromises();
    const event = {
      originalEvent: {
        altKey: true,
      },
      point: {
        x: 463.5,
        y: 477.1875,
      },
      target: {
        queryRenderedFeatures: () => {
          return [
            {
              geometry: {
                coordinates: [
                  [
                    [101.16072535514832, 15.119824869285075],
                    [101.15796539300004, 15.052626968000027],
                    [101.16026588800008, 15.052683043000059],
                    [101.16249336800007, 15.05279176700003],
                    [101.16457351200006, 15.05287588400006],
                    [101.16817184600006, 15.053010455000049],
                    [101.16992435000009, 15.05309115600005],
                    [101.16997576800009, 15.052226568000037],
                    [101.17015797000005, 15.050841579000064],
                    [101.17258921900009, 15.050799469000026],
                    [101.17424499900005, 15.050698872000055],
                    [101.17613469500009, 15.050485078000065],
                    [101.17699562400009, 15.050437232000036],
                  ],
                ],
                type: 'Polygon',
              },
              id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
              properties: {
                geographicLevel: 3,
                name: 'Two Three Two Release Village',
                parentId: '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
                status: 'Active',
                version: 0,
              },
              type: 'Feature',
            },
          ];
        },
      },
    };
    const mockMapObj: any = {};
    const selectNodeCreatorMock = jest.fn(selectNode);
    const deselectNodeCreatorMock = jest.fn(deselectNode);
    const mockProps = {
      currentParentNode: {
        model: {
          id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
          meta: { selected: false },
        },
      },
      deselectNodeCreator: deselectNodeCreatorMock,
      rootJurisdictionId: '8fb28715-6c80-4e2c-980f-422798fe9f41',
      selectNodeCreator: selectNodeCreatorMock,
    };
    const onJurisdictionClickMock1 = onJurisdictionClick(mockProps, () => jest.fn());
    onJurisdictionClickMock1(mockMapObj, event as EventData);
    // test that selected node action is created when node is selected on map
    expect(selectNodeCreatorMock).toBeCalledTimes(1);
    expect(deselectNodeCreatorMock).toBeCalledTimes(0);
    await flushPromises();
    // test that deselect node action is created when node is selected on map
    const mockProps2 = {
      currentChildren: [
        {
          model: {
            id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
            meta: { selected: true },
          },
        },
      ],
      currentParentNode: {
        children: [
          {
            model: {
              id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
              meta: { selected: true },
            },
          },
        ],
        model: {
          id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
          meta: { selected: true },
        },
      },
      deselectNodeCreator: deselectNodeCreatorMock,
      rootJurisdictionId: '2942',
      selectNodeCreator: selectNodeCreatorMock,
    };
    const onJurisdictionClickMock2 = onJurisdictionClick(mockProps2, () => jest.fn());
    onJurisdictionClickMock2(mockMapObj, event as EventData);
    expect(selectNodeCreatorMock).toBeCalledTimes(1);
    expect(deselectNodeCreatorMock).toBeCalledTimes(1);
  });
});
