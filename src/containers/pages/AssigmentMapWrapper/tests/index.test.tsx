import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import { EventData, Popup } from 'mapbox-gl';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { AssignmentMapWrapper, ConnectedAssignmentMapWrapper } from '..';
import { getJurisdictions } from '../../../../components/TreeWalker/helpers';
import { JURISDICTION_NOT_FOUND, MAP_LOAD_ERROR } from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import { ASSIGN_PLAN_URL, MANUAL_ASSIGN_JURISDICTIONS_URL } from '../../../../constants';
import * as errors from '../../../../helpers/errors';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import hierachyReducer, {
  deselectNode,
  fetchTree,
  getCurrentChildren,
  getMetaData,
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
import { buildMouseMoveHandler, onJurisdictionClick } from '../helpers/utils';
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
jest.mock('../../../../configs/env', () => ({
  OPENSRP_API_BASE_URL: 'https://test.smartregister.org/opensrp/rest/',
  PLAN_TYPES_WITH_MULTI_JURISDICTIONS: ['IRS'],
}));

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
  it('works correctly with store', async () => {
    const displayErrorSpy = jest.spyOn(errors, 'displayError');
    fetch.mockResponseOnce(JSON.stringify([fixtures.jurisdiction1]), { status: 200 });
    store.dispatch(fetchJurisdictions(fixtures.payload as any));
    const props = {
      currentParentId: '2492',
      plan: {
        identifier: '2493',
      } as PlanDefinition,
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
      baseAssignmentURL: '/',
      currentChildren: [],
      currentParentId: '2492',
      currentParentNode: undefined,
      deselectNodeCreator: expect.any(Function),
      fetchJurisdictionsActionCreator: expect.any(Function),
      getJurisdictionsFeatures: {
        features: [],
        type: 'FeatureCollection',
      },
      getJurisdictionsMetadata: {},
      hideBottomBreadCrumbCallback: expect.any(Function),
      jurisdictionsChunkSize: 30,
      plan: {
        identifier: '2493',
      },
      rootJurisdictionId: '2492',
      selectNodeCreator: expect.any(Function),
      serviceClass: OpenSRPService,
    });
    expect(result).toEqual({ error: null, value: [fixtures.jurisdiction1] });

    expect(displayErrorSpy).toHaveBeenCalledTimes(1);
    expect(displayErrorSpy.mock.calls).toEqual([[new Error(JURISDICTION_NOT_FOUND)]]);
    wrapper.unmount();
  });
  it('test that jurisdictions are fetched correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify([fixtures.jurisdiction1]), { status: 200 });
    store.dispatch(fetchTree(sampleHierarchy, '2942'));
    const children = getCurrentChildren()(store.getState(), {
      currentParentId: '2942',
      leafNodesOnly: true,
      planId: '2942',
      rootJurisdictionId: '2942',
    });
    const props = {
      currentChildren: [children] as any,
      currentParentId: '3019',
      fetchJurisdictionsActionCreator: fetchJurisdictions,
      getJurisdictionsFeatures: fixtures.geoCollection as any,
      plan: {
        identifier: '2493',
      } as PlanDefinition,
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
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(wrapper.find('AssignmentMapWrapper').props()).toEqual({
      autoSelectNodesActionCreator: expect.any(Function),
      baseAssignmentURL: '/',
      currentChildren: expect.any(Array),
      currentParentId: '3019',
      currentParentNode: expect.any(Object),
      deselectNodeCreator: expect.any(Function),
      fetchJurisdictionsActionCreator: expect.any(Function),
      getJurisdictionsFeatures: {
        features: [],
        type: 'FeatureCollection',
      },
      getJurisdictionsMetadata: {},
      hideBottomBreadCrumbCallback: expect.any(Function),
      jurisdictionsChunkSize: 30,
      plan: {
        identifier: '2493',
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
    store.dispatch(selectNode('2942', '2942', '2943'));
    const children = getCurrentChildren()(store.getState(), {
      currentParentId: '2942',
      leafNodesOnly: true,
      planId: '2953',
      rootJurisdictionId: '2942',
    });
    const props = {
      currentChildren: [children] as any,
      currentParentId: '3019',
      fetchJurisdictionsActionCreator: fetchJurisdictions,
      getJurisdictionsFeatures: fixtures.geoCollection as any,
      plan: {
        identifier: '2493',
      } as PlanDefinition,
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
      baseAssignmentURL: '/',
      currentChildren: expect.any(Array),
      currentParentId: '3019',
      currentParentNode: expect.any(Object),
      deselectNodeCreator: expect.any(Function),
      fetchJurisdictionsActionCreator: expect.any(Function),
      getJurisdictionsFeatures: {
        features: [fixtures.geoCollection.features[1]],
        type: 'FeatureCollection',
      },
      getJurisdictionsMetadata: {
        '2942': {
          '2943': {
            '2942': {
              actionBy: 'User Change',
              selected: true,
            },
            '3019': {
              actionBy: 'User Change',
              selected: true,
            },
            '3951': {
              actionBy: 'User Change',
              selected: true,
            },
          },
        },
      },
      hideBottomBreadCrumbCallback: expect.any(Function),
      jurisdictionsChunkSize: 30,
      plan: {
        identifier: '2493',
      },
      rootJurisdictionId: '2942',
      selectNodeCreator: expect.any(Function),
      serviceClass: OpenSRPService,
    });
    expect(toJson(wrapper.find('MemoizedGisidaLiteMock div'))).toMatchSnapshot(
      'map renders correctly'
    );
    expect(result).toEqual({ error: null, value: expect.any(Array) });
    wrapper.unmount();
  });
  it('handles jurisdiction click on map', async () => {
    store.dispatch(selectNode('8fb28715-6c80-4e2c-980f-422798fe9f41', '2942', '3019'));
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
      currentChildren: [
        {
          model: {
            id: '2942',
            meta: { selected: false },
          },
        },
        {
          model: {
            id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
            meta: { selected: false },
          },
        },
      ],
      currentParentNode: {
        children: [
          {
            model: {
              id: '2942',
              meta: { selected: false },
            },
          },
          {
            model: {
              id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
              meta: { selected: false },
            },
          },
        ],
        model: {
          id: '2943',
          meta: { selected: false },
        },
      },
      deselectNodeCreator: deselectNodeCreatorMock,
      getJurisdictionsMetadata: getMetaData(store.getState()),
      plan: {
        identifier: '2493',
        useContext: [{ code: 'interventionType', valueCodableConcept: 'IRS' }],
      } as PlanDefinition,
      rootJurisdictionId: '2942',
      selectNodeCreator: selectNodeCreatorMock,
    };
    const onJurisdictionClickMock1 = onJurisdictionClick(mockProps, () => jest.fn(), history);
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
            id: '2943',
            meta: { selected: true },
          },
        },
        {
          model: {
            id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
            meta: { selected: false },
          },
        },
      ],
      currentParentNode: {
        children: [
          {
            model: {
              id: '2943',
              meta: { selected: true },
            },
          },
          {
            model: {
              id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
              meta: { selected: false },
            },
          },
        ],
        model: {
          id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
          meta: { selected: true },
        },
      },
      deselectNodeCreator: deselectNodeCreatorMock,
      getJurisdictionsMetadata: getMetaData(store.getState()),
      plan: {
        identifier: '2493',
        useContext: [{ code: 'interventionType', valueCodableConcept: 'IRS' }],
      } as PlanDefinition,
      rootJurisdictionId: '2942',
      selectNodeCreator: selectNodeCreatorMock,
    };
    const onJurisdictionClickMock2 = onJurisdictionClick(mockProps2, () => jest.fn(), history);
    onJurisdictionClickMock2(mockMapObj, event as EventData);
    expect(selectNodeCreatorMock).toBeCalledTimes(2);
  });
  it('shows popup on hover', () => {
    const event = {
      lngLat: {
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      },
      originalEvent: {},
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
      type: 'fill',
    };

    const mockedPopup = Popup;
    const addToMock = jest.fn();
    mockedPopup.prototype.setLngLat = (e: any) => {
      expect(e).toEqual({
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      });
      e.setHTML = (f: string) => {
        expect(f).toEqual(
          '<div class="jurisdiction-name"><center>Two Three Two Release Village</center></div>'
        );
        e.addTo = addToMock;
        return e;
      };
      return e;
    };

    (global as any).mapboxgl = {
      Popup: mockedPopup,
    };

    const mockStyle = {
      cursor: 'pointer',
    };

    const mockMap: any = {
      // mock unproject function
      getCanvas: jest.fn().mockImplementation(() => {
        return {
          style: {
            ...mockStyle,
          },
        };
      }),
      unproject: () => {
        return {
          lat: 15.065355545319008,
          lng: 101.1799767158821,
        };
      },
    };

    buildMouseMoveHandler(mockMap, event as any);

    expect(addToMock.mock.calls).toEqual([
      [{ getCanvas: expect.any(Function), unproject: expect.any(Function) }],
    ]);
    expect(addToMock).toBeCalledTimes(1);
  });
  it('drills down correctly based on the assignment page base URL', () => {
    const event = {
      originalEvent: {
        altKey: false,
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
    const mockProps = {
      baseAssignmentURL: `${ASSIGN_PLAN_URL}/2493`,
      currentChildren: [
        {
          hasChildren: () => true,
          model: {
            id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
            meta: { selected: false },
          },
        },
      ],
      currentParentNode: {
        children: [
          {
            hasChildren: () => true,
            model: {
              id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
              meta: { selected: false },
            },
          },
        ],
        model: {
          id: '2943',
          meta: { selected: false },
        },
      },
      plan: {
        identifier: '2493',
        useContext: [{ code: 'interventionType', valueCodableConcept: 'IRS' }],
      } as PlanDefinition,
      rootJurisdictionId: '2942',
    };
    const mockMapObj: any = {};
    const onJurisdictionClickMock1 = onJurisdictionClick(mockProps, () => jest.fn(), history);
    onJurisdictionClickMock1(mockMapObj, event as EventData);

    // test correct navigation for plans assignment
    expect(history.location.pathname).toEqual('/assign/2493/8fb28715-6c80-4e2c-980f-422798fe9f41');

    // test correct navigation for jurisdiction assignment
    mockProps.baseAssignmentURL = `${MANUAL_ASSIGN_JURISDICTIONS_URL}/${mockProps.plan.identifier}/${mockProps.rootJurisdictionId}`;
    const onJurisdictionClickMock2 = onJurisdictionClick(mockProps, () => jest.fn(), history);
    onJurisdictionClickMock2(mockMapObj, event as EventData);
    expect(history.location.pathname).toEqual(
      '/manualSelectJurisdictions/2493/2942/8fb28715-6c80-4e2c-980f-422798fe9f41'
    );
  });
  it('shows error div when features have invalid coordinates', async () => {
    store.dispatch(fetchTree(sampleHierarchy, '2942'));
    store.dispatch(fetchJurisdictions(fixtures.payloadWithInvalidCoordinates as any));
    store.dispatch(selectNode('2942', '2942', '2943'));
    const children = getCurrentChildren()(store.getState(), {
      currentParentId: '2942',
      leafNodesOnly: true,
      planId: '2953',
      rootJurisdictionId: '2942',
    });
    const props = {
      currentChildren: [children] as any,
      currentParentId: '3019',
      fetchJurisdictionsActionCreator: fetchJurisdictions,
      getJurisdictionsFeatures: fixtures.invalidCoordinatesGeom as any,
      plan: {
        identifier: '2493',
      } as PlanDefinition,
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
    expect(wrapper.find('div').text()).toEqual(MAP_LOAD_ERROR);
  });
});
