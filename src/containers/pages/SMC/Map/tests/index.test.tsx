import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedSMCReportingMap, { SMCReportingMap } from '..';
import { GisidaLiteProps } from '../../../../../components/GisidaLite';
import {
  SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES,
  SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE,
} from '../../../../../configs/env';
import { MAP, REPORT_IRS_PLAN_URL } from '../../../../../constants';
import * as errors from '../../../../../helpers/errors';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  reducerName as GenericJurisdictionsReducerName,
  removeGenericJurisdictions,
} from '../../../../../store/ducks/generic/jurisdictions';
import SMCPlansReducer, {
  reducerName as SMCPlansReducerName,
  removeSMCPlans,
} from '../../../../../store/ducks/generic/SMCPlans';
import genericStructuresReducer, {
  reducerName as genericStructuresReducerName,
  removeGenericStructures,
} from '../../../../../store/ducks/generic/structures';
import { SMCPlans } from '../../../../../store/ducks/generic/tests/fixtures';
import jurisdictionReducer, {
  getJurisdictionById,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import * as mapUtils from '../../../FocusInvestigation/map/active/helpers/utils';
import { SMCReportingJurisdictions } from '../../jurisdictionsReport/tests/fixtures';
import { SMCIndicatorStops } from '../helpers';
import { SMCJurisdiction, SMCStructures } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

jest.mock('../../../../../components/GisidaLite', () => {
  const MemoizedGisidaLiteMock = () => <div>Mock component</div>;
  return {
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});

/** register the reducers */
reducerRegistry.register(SMCPlansReducerName, SMCPlansReducer);
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

const history = createBrowserHistory();

describe('components/SMC Reports/SMCReportingMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const planId = SMCPlans[0].plan_id;
    const jurisdictionId = 'e43190b0-c166-44eb-be1f-63fa5b453c29';
    const props = {
      history,
      jurisdiction: getJurisdictionById(store.getState(), jurisdictionId),
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId,
          planId,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${MAP}`,
      },
    };
    shallow(
      <Router history={history}>
        <SMCReportingMap {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => SMCJurisdiction);
    supersetServiceMock.mockImplementationOnce(async () => SMCStructures);
    supersetServiceMock.mockImplementationOnce(async () => SMCReportingJurisdictions);
    supersetServiceMock.mockImplementationOnce(async () => SMCPlans);

    const planId = SMCPlans[0].plan_id;
    const jurisdictionId = 'e43190b0-c166-44eb-be1f-63fa5b453c29';

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId,
          planId,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${MAP}`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSMCReportingMap {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('BreadcrumbItem li a').map(item => `${item.text()} - ${item.prop('href')}`)
    ).toMatchSnapshot('breadcrumbs');
    expect(wrapper.find('h3.page-title').text()).toEqual('Dynamic-MDA 2020-12-04_2030: Setlements');
    expect(wrapper.find('.mapSidebar h5').text()).toEqual('Setlements');
    expect(
      wrapper
        .find('.sidebar-legend-item')
        .map(
          item =>
            `${item.text()} ${
              (item.find('.sidebar-legend-color').prop('style') as any).backgroundColor
            }`
        )
    ).toMatchSnapshot('Legend items');
    expect(wrapper.find('.responseItem h6').map(item => item.text())).toMatchSnapshot(
      'Response item titles'
    );
    expect(
      wrapper.find('.responseItem p.indicator-description').map(item => item.text())
    ).toMatchSnapshot('Response item descriptions');
    expect(wrapper.find('p.indicator-breakdown').map(item => item.text())).toMatchSnapshot(
      'Indicator item breakdown'
    );
    expect(toJson(wrapper.find('.responseItem ProgressBar .progress-bar'))).toMatchSnapshot(
      'Response item ProgressBar'
    );

    expect(toJson(wrapper.find('MemoizedGisidaLiteMock div'))).toMatchSnapshot(
      'map renders correctly'
    );
    expect(supersetServiceMock).toHaveBeenCalledTimes(4);

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        1,
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: jurisdictionId,
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
          ],
          row_limit: 1,
        },
      ],
      [
        '9',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: jurisdictionId,
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
            {
              clause: 'WHERE',
              comparator: planId,
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 3000,
        },
      ],
      [
        '5',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: jurisdictionId,
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
            {
              clause: 'WHERE',
              comparator: planId,
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 1,
        },
      ],
      [
        '1',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: planId,
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 1,
        },
      ],
    ]);
    wrapper.unmount();
  });

  it('renders both Points and Polygons correctly', async () => {
    const mock: any = jest.fn();
    const buildGsLiteLayersSpy = jest.spyOn(mapUtils, 'buildGsLiteLayers');
    const buildJurisdictionLayersSpy = jest.spyOn(mapUtils, 'buildJurisdictionLayers');

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => SMCJurisdiction);
    supersetServiceMock.mockImplementationOnce(async () => SMCStructures);
    supersetServiceMock.mockImplementationOnce(async () => SMCReportingJurisdictions);
    supersetServiceMock.mockImplementationOnce(async () => SMCPlans);

    const planId = SMCPlans[0].plan_id;
    const jurisdictionId = 'e43190b0-c166-44eb-be1f-63fa5b453c29';

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId,
          planId,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${MAP}`,
      },
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSMCReportingMap {...props} />
        </Router>
      </Provider>
    );

    const jurisdiction = getJurisdictionById(store.getState(), jurisdictionId);

    expect(buildGsLiteLayersSpy).toBeCalledTimes(1);
    expect(buildGsLiteLayersSpy).toBeCalledWith(
      'SMC_report_structures',
      null,
      { features: [], type: 'FeatureCollection' },
      {
        circleColor: {
          property: 'business_status',
          stops: SMCIndicatorStops.nigeria2020,
          type: 'categorical',
        },
        polygonColor: {
          property: 'business_status',
          stops: SMCIndicatorStops.nigeria2020,
          type: 'categorical',
        },
        polygonLineColor: {
          property: 'business_status',
          stops: SMCIndicatorStops.nigeria2020,
          type: 'categorical',
        },
      }
    );

    expect(buildJurisdictionLayersSpy).toBeCalledTimes(1);
    expect(buildJurisdictionLayersSpy).toBeCalledWith(jurisdiction);

    wrapper.unmount();
  });

  it('calls GisidaLite with the correct props', async () => {
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => SMCJurisdiction);
    supersetServiceMock.mockImplementationOnce(async () => SMCStructures);
    supersetServiceMock.mockImplementationOnce(async () => SMCReportingJurisdictions);
    supersetServiceMock.mockImplementationOnce(async () => SMCPlans);

    const planId = SMCPlans[0].plan_id;
    const jurisdictionId = 'e43190b0-c166-44eb-be1f-63fa5b453c29';

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId,
          planId,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${MAP}`,
      },
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSMCReportingMap {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
    });

    const mapProps = wrapper.find('MemoizedGisidaLiteMock').props();
    // Check Gisida component map layers
    expect((mapProps as any).layers.map((e: any) => e.key)).toMatchSnapshot('GisidaLite layers');
    wrapper.unmount();
  });

  it('Loads map without structures structures', async () => {
    // clear structures store incase there is data
    store.dispatch(removeGenericStructures(SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => SMCJurisdiction);
    supersetServiceMock.mockImplementationOnce(async () => []);
    supersetServiceMock.mockImplementationOnce(async () => SMCReportingJurisdictions);
    supersetServiceMock.mockImplementationOnce(async () => SMCPlans);

    const planId = SMCPlans[0].plan_id;
    const jurisdictionId = 'e43190b0-c166-44eb-be1f-63fa5b453c29';

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId,
          planId,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/${planId}/${jurisdictionId}/${MAP}`,
      },
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSMCReportingMap {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const mapProps = wrapper.find('MemoizedGisidaLiteMock').props() as GisidaLiteProps;
    expect(mapProps.zoom).toEqual(17);
    expect(mapProps.mapCenter).toEqual([5.59886410019811, 13.4995634574876]);
    expect(mapProps.mapBounds).toEqual([
      5.59718892942561,
      13.4978599976408,
      5.60053927097061,
      13.5012669173344,
    ]);
    wrapper.unmount();
  });

  it('displays error correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const props = {
      focusArea: null,
      history,
      jurisdiction: null,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: 'invalid-jur-id',
          planId: SMCPlans[0].plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/invali-plan-id/invalid-jur-id/${MAP}`,
      },
      plan: null,
      service: supersetServiceMock,
      structures: [] as any,
    };
    const wrapper = mount(
      <Router history={history}>
        <SMCReportingMap {...props} />
      </Router>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(
      wrapper
        .find('.global-error-container p')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"An error ocurred. Please try and refresh the page."`);
    expect(
      wrapper
        .find('.global-error-container p')
        .at(1)
        .text()
    ).toMatchInlineSnapshot(`"The specific error is: An Error Ocurred"`);
  });

  it('Loads error page when api fails', async () => {
    // clear store
    const slices = SUPERSET_SMC_REPORTING_JURISDICTIONS_DATA_SLICES.split(',');
    const focusAreaSlice = slices.pop();
    store.dispatch(removeSMCPlans());
    store.dispatch(removeGenericJurisdictions(focusAreaSlice));
    store.dispatch(removeGenericStructures(SUPERSET_SMC_REPORTING_STRUCTURES_DATA_SLICE));
    // mocks
    const mock: any = jest.fn();
    const errorText = 'Unknown error occured';
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(() => Promise.reject(errorText));
    const displayErrorSpy = jest.spyOn(errors, 'displayError');

    const props = {
      focusArea: null,
      history,
      jurisdiction: null,
      location: mock,
      match: {
        isExact: true,
        params: {
          jurisdictionId: 'invalid-jur-id',
          planId: SMCPlans[0].plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId/:jurisdictionId/${MAP}`,
        url: `${REPORT_IRS_PLAN_URL}/invali-plan-id/invalid-jur-id/${MAP}`,
      },
      plan: null,
      service: supersetServiceMock,
      structures: [] as any,
    };
    const wrapper = mount(
      <Router history={history}>
        <SMCReportingMap {...props} />
      </Router>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    // flashes error
    expect(displayErrorSpy).toHaveBeenCalledTimes(1);
    expect(displayErrorSpy.mock.calls).toEqual([[errorText]]);
    // displays error page
    expect(wrapper.find('.global-error-container').text()).toMatchInlineSnapshot(
      `"An error ocurred. Please try and refresh the page.The specific error is: An Error Ocurred"`
    );
  });
});
