import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import ConnectedPlansLocationNames, { PlanLocationNames } from '..';
import { OPENSRP_LOCATIONS_BY_PLAN } from '../../../../../../constants';
import { OpenSRPService } from '../../../../../../services/opensrp';
import store from '../../../../../../store';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import locationReducer, {
  fetchLocations,
  Location,
  reducerName,
  removeAllPlansLocations,
} from '../../../../../../store/ducks/opensrp/planLocations';
import { sampleLocations } from '../../../../../../store/ducks/opensrp/planLocations/tests/fixtures';

reducerRegistry.register(reducerName, locationReducer);
const history = createBrowserHistory();

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

describe('src/components/locationIdToNames', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    store.dispatch(removeAllPlansLocations);
  });

  it('renders without crashing', () => {
    fetch.once(JSON.stringify([]));
    const props = {
      fetchLocationsAction: fetchLocations,
      locations: [],
      plan: plans[1],
      serviceClass: OpenSRPService,
    };

    shallow(
      <Router history={history}>
        <PlanLocationNames {...props} />
      </Router>
    );
  });

  it('Makes the correct api calls', async () => {
    const mockRead = jest.fn(async () => []);
    const classMock = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });
    const props = {
      plan: plans[1],
      serviceClass: classMock as any,
    };

    mount(
      <Router history={history}>
        <PlanLocationNames {...props} />
      </Router>
    );
    await flushPromises();

    // to the correct endpoint
    expect(classMock).toHaveBeenCalledWith(OPENSRP_LOCATIONS_BY_PLAN);

    expect(mockRead).toHaveBeenCalledWith(plans[1].identifier);
  });

  it('renders correctly', async () => {
    fetch.once(JSON.stringify([]));
    const props = {
      child: () => <h2 className="mock-child">Mock child render function</h2>,
      locations: sampleLocations,
      plan: plans[1],
    };

    const wrapper = mount(
      <Router history={history}>
        <PlanLocationNames {...props} />
      </Router>
    );
    await flushPromises();
    wrapper.update();

    // should have at exactly 2 li with children spans
    expect(wrapper.find('li').length).toEqual(2);
    expect(toJson(wrapper.find('li').at(0))).toMatchSnapshot();
    expect(toJson(wrapper.find('li').at(1))).toMatchSnapshot();

    // invokes render prop child
    expect(toJson(wrapper.find('h2.mock-child'))).toMatchSnapshot();
  });

  it('renders jurisdiction names as links for FI', async () => {
    fetch.once(JSON.stringify([]));
    const props = {
      child: () => <h2 className="mock-child">Mock child render function</h2>,
      locations: sampleLocations,
      plan: plans[0],
    };

    const wrapper = mount(
      <Router history={history}>
        <PlanLocationNames {...props} />
      </Router>
    );
    await flushPromises();
    wrapper.update();

    // should have at exactly 2 li with children links.
    expect(wrapper.find('li').length).toEqual(2);
    expect(toJson(wrapper.find('li').at(0))).toMatchSnapshot();
    expect(toJson(wrapper.find('li').at(1))).toMatchSnapshot();

    // invokes render prop child
    expect(toJson(wrapper.find('h2.mock-child'))).toMatchSnapshot();
  });

  it('renders jurisdiction names as links for Dynamic-FI', async () => {
    fetch.once(JSON.stringify([]));
    const plan = cloneDeep(plans[0]);
    plan.useContext = [{ code: 'interventionType', valueCodableConcept: 'Dynamic-FI' }];
    const props = {
      child: () => <h2 className="mock-child">Mock child render function</h2>,
      locations: sampleLocations,
      plan,
    };

    const wrapper = mount(
      <Router history={history}>
        <PlanLocationNames {...props} />
      </Router>
    );
    await flushPromises();
    wrapper.update();

    // should have at exactly 2 li with children links.
    expect(wrapper.find('li').length).toEqual(2);
    expect(toJson(wrapper.find('li').at(0))).toMatchSnapshot();
    expect(toJson(wrapper.find('li').at(1))).toMatchSnapshot();

    // invokes render prop child
    expect(toJson(wrapper.find('h2.mock-child'))).toMatchSnapshot();
  });

  it('works correctly with store', () => {
    fetch.once(JSON.stringify([]));
    store.dispatch(fetchLocations(sampleLocations as Location[], plans[1].identifier));
    const props = {
      plan: plans[1],
    };

    // should display the correct location Name
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedPlansLocationNames {...props} />
        </Router>
      </Provider>
    );
    wrapper.update();

    expect(
      wrapper
        .find('li')
        .at(0)
        .text()
    ).toEqual('Namibia');
    expect(toJson(wrapper.find('li').at(0))).toMatchSnapshot();
    expect(toJson(wrapper.find('li').at(1))).toMatchSnapshot();
  });
});
