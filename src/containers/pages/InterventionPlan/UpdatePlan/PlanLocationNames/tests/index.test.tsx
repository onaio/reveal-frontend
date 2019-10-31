import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import React from 'react';
import { Provider } from 'react-redux';
import ConnectedPlansLocationNames, { JurisdictionIdToName } from '..';
import { OPENSRP_LOCATIONS_BY_PLAN } from '../../../../../../constants';
import store from '../../../../../../store';
import locationReducer, {
  fetchLocations,
   Location,
  reducerName,
  removeAllPlansLocations,
} from '../../../../../../store/ducks/opensrp/locations';
import { sampleLocations } from '../../../../../../store/ducks/opensrp/locations/tests/fixtures';

reducerRegistry.register(reducerName, locationReducer);

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
        fetchLocationsAction: fetchLocations;
        plan: ;
        serviceClass: typeof OpenSRPService;
    };

    shallow(<JurisdictionIdToName {...props} />);
  });

  it('Makes the correct api calls', async () => {
    const mockList = jest.fn(async () => []);
    const classMock = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    const props = {
      ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128', '3951'],
      serviceClass: classMock,
    };

    mount(<JurisdictionIdToName {...props} />);
    await flushPromises();

    // to the correct endpoint
    expect(classMock).toHaveBeenCalledWith(OPENSRP_LOCATIONS_BY_PLAN);

    // correct filter parameters
    const filterParams = {
      location_ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128', '3951'],
      return_geometry: false,
    };
    expect(mockList).toHaveBeenCalledWith(filterParams);
  });

  it('renders correctly', async () => {
    fetch.once(JSON.stringify(sampleLocations));
    const props = {
      ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128', '3951'],
    };

    const wrapper = mount(<JurisdictionIdToName {...props} />);
    await flushPromises();
    wrapper.update();

    // should have at exactly 2 lis
    expect(wrapper.find('li').length).toEqual(2);
    expect(toJson(wrapper.find('li').at(0))).toMatchSnapshot();
    expect(toJson(wrapper.find('li').at(1))).toMatchSnapshot();
  });

  it('works correctly with store', () => {
    fetch.once(JSON.stringify([]));
    store.dispatch(fetchLocations(sampleLocations as Location[]));
    const props = {
      ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128', '3951'],
    };

    // should display the correct location Name
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlansLocationNames {...props} />
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

  it('renders correctly when connected to store', async () => {
    // component should render the id initially and then re-render
    // with the location name
    fetch.once(JSON.stringify(sampleLocations));
    const props = {
      ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128', '3951'],
    };

    // should display the correct location Name
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlansLocationNames {...props} />
      </Provider>
    );
    await flushPromises();
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

  it('Should not make api call if name is in store', async () => {
    const mockList = jest.fn(async () => []);
    const classMock = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });
    store.dispatch(fetchLocations(sampleLocations as Location[]));
    const props = {
      ids: ['f45b9380-c970-4dd1-8533-9e95ab12f128', '3951'],
      serviceClass: classMock,
    };

    // the service Class should not be called
    expect(classMock).not.toHaveBeenCalled();

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlansLocationNames {...props} />
      </Provider>
    );
    await flushPromises();

    // should have at exactly 2 lis
    expect(wrapper.find('li').length).toEqual(2);
    expect(toJson(wrapper.find('li').at(0))).toMatchSnapshot();
    expect(toJson(wrapper.find('li').at(1))).toMatchSnapshot();
  });
});

