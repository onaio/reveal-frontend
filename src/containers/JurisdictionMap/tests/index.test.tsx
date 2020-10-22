import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import * as errorHelpers from '../../../helpers/errors';
import store from '../../../store';
import jurisdictionReducer, {
  fetchJurisdictions,
  reducerName as jurisdictionReducerName,
} from '../../../store/ducks/jurisdictions';
import { jurisdiction1 } from '../../../store/ducks/tests/fixtures';
import { AN_ERROR_OCCURRED } from '../.././../configs/lang';
import * as mapUtil from '../../pages/FocusInvestigation/map/active/helpers/utils';
import ConnectedJurisdictionMap, {
  defaultProps,
  JurisdictionMap,
  JurisdictionMapProps,
} from '../index';

/** register the jurisdictions reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

jest.mock('../../../configs/env');

jest.mock('../../../components/GisidaLite', () => {
  const MemoizedGisidaLiteMock = () => <div>Mock component</div>;
  return {
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});

describe('containers/JurisdictionMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props: JurisdictionMapProps = {
      ...defaultProps,
      jurisdiction: jurisdiction1,
      jurisdictionId: jurisdiction1.jurisdiction_id,
    };
    shallow(
      <MemoryRouter>
        <JurisdictionMap {...props} />
      </MemoryRouter>
    );
  });

  it('renders correctly', async () => {
    const callbackMock: any = jest.fn();
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const props: JurisdictionMapProps = {
      ...defaultProps,
      callback: callbackMock,
      cssClass: 'super-custom',
      jurisdiction: jurisdiction1,
      jurisdictionId: jurisdiction1.jurisdiction_id,
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionMap {...props} />
      </MemoryRouter>
    );

    /** Show loading indicator */
    expect(wrapper.find('JurisdictionMap>Ripple').length).toEqual(1);

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    /** No longer show loading indicator */
    expect(wrapper.find('JurisdictionMap>Ripple').length).toEqual(0);

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        1 /** this comes from the envs mock */,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
          ],
          row_limit: 1,
        },
      ],
    ]);
    expect(supersetServiceMock).toHaveBeenCalledTimes(1);

    expect(callbackMock.mock.calls).toEqual([[jurisdiction1]]);
    expect(callbackMock).toHaveBeenCalledTimes(1);
  });

  it('renders fetch error correctly', async () => {
    const mockDisplayError: any = jest.fn();
    (errorHelpers as any).displayError = mockDisplayError;

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => undefined);

    const props: JurisdictionMapProps = {
      ...defaultProps,
      jurisdictionId: jurisdiction1.jurisdiction_id,
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionMap {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(mockDisplayError.mock.calls).toEqual([[new Error(AN_ERROR_OCCURRED)]]);
    expect(mockDisplayError).toHaveBeenCalledTimes(1);

    expect(toJson(wrapper.find('div'))).toMatchSnapshot('jurisdiction error');
  });

  it('renders supersetService error correctly', async () => {
    const mockDisplayError: any = jest.fn();
    (errorHelpers as any).displayError = mockDisplayError;

    const error = new Error('Catastrophy!!');

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockRejectedValue(error);

    const props: JurisdictionMapProps = {
      ...defaultProps,
      jurisdictionId: jurisdiction1.jurisdiction_id,
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionMap {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(mockDisplayError.mock.calls).toEqual([[error]]);
    expect(mockDisplayError).toHaveBeenCalledTimes(1);

    expect(toJson(wrapper.find('div'))).toMatchSnapshot('supersetService error');
  });

  it('works when connected to the store', async () => {
    store.dispatch(fetchJurisdictions([jurisdiction1]));

    const buildJurisdictionLayersSpy = jest.spyOn(mapUtil, 'buildJurisdictionLayers');
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => [jurisdiction1]);

    const props: JurisdictionMapProps = {
        ...defaultProps,
        jurisdictionId: jurisdiction1.jurisdiction_id,
        supersetService: supersetServiceMock,
      } /** the jurisdiction is not supplied as it will be fetched from the store */;

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ConnectedJurisdictionMap {...props} />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(buildJurisdictionLayersSpy).toBeCalledTimes(1);
    expect(buildJurisdictionLayersSpy).toBeCalledWith(jurisdiction1);
  });
});
