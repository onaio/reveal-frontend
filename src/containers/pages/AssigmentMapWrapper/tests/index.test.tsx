import reducerRegistry from '@onaio/redux-reducer-registry';
import { FeatureCollection } from '@turf/turf';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { AssignmentMapWrapper, ConnectedAssignmentMapWrapper } from '..';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import hierachyReducer, {
  reducerName as hierachyReducerName,
} from '../../../../store/ducks/opensrp/hierarchies';
import jurisdictionsReducer, {
  fetchJurisdictions,
  reducerName as jurisdictionsReducerName,
} from '../../../../store/ducks/opensrp/jurisdictions';
import * as fixtures from './fixtures';

reducerRegistry.register(jurisdictionsReducerName, jurisdictionsReducer);
reducerRegistry.register(hierachyReducerName, hierachyReducer);

const history = createBrowserHistory();

jest.mock('../../../../components/GisidaLite', () => {
  const GisidaLiteMock = () => <div>I love oov</div>;
  return {
    MemoizedGisidaLite: GisidaLiteMock,
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
    fetch.resetMocks();
  });
  it('renders successfully', () => {
    shallow(
      <Router history={history}>
        <AssignmentMapWrapper />
      </Router>
    );
  });
  it('renders jurisdictions assignment map', () => {
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

    expect(toJson(wrapper.find('AssignmentMapWrapper'))).toMatchSnapshot();
    wrapper.unmount();
  });
  it('works correctly with store', async () => {
    store.dispatch(fetchJurisdictions(fixtures.payload as any));
    const props = {
      currentParentId: '07b09ec1-0589-4a98-9480-4c403ac24d59',
      rootJurisdictionId: '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedAssignmentMapWrapper {...props} />
        </Router>
      </Provider>
    );
    expect(wrapper.find('AssignmentMapWrapper').props()).toEqual({
      currentChildren: [],
      currentParentId: '07b09ec1-0589-4a98-9480-4c403ac24d59',
      fetchJurisdictionsActionCreator: expect.any(Function),
      getJurisdictionsFeatures: {
        features: [],
        type: 'FeatureCollection',
      },
      rootJurisdictionId: '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
      serviceClass: OpenSRPService,
    });

    wrapper.unmount();
  });
});
