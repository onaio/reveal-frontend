import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import Helmet from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedMDALiteMapReport, { MDALiteMapReport } from '../';
import { GisidaLiteProps } from '../../../../../components/GisidaLite';
import { REPORT_MDA_LITE_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  reducerName as genericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import GenericPlansReducer, {
  reducerName as genericPlanReducerName,
} from '../../../../../store/ducks/generic/plans';
import genericStructuresReducer, {
  reducerName as genericStructuresReducerName,
} from '../../../../../store/ducks/generic/structures';
import {
  MDALitePlans,
  MDALiteWardGeojsonData,
  MDALteJurisidtionsData,
} from '../../../../../store/ducks/superset/MDALite/tests/fixtures';

/** register the reducers */
reducerRegistry.register(genericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericPlanReducerName, GenericPlansReducer);
reducerRegistry.register(genericStructuresReducerName, genericStructuresReducer);

jest.mock('../../../../../configs/env');

jest.mock('../../../../../components/GisidaLite', () => {
  const MemoizedGisidaLiteMock = () => <div>Mock component</div>;
  return {
    MemoizedGisidaLite: MemoizedGisidaLiteMock,
  };
});

const history = createBrowserHistory();

const mock: any = jest.fn();
const planId = MDALiteWardGeojsonData[0].plan_id;
const jurisdictionId = MDALiteWardGeojsonData[0].jurisdiction_id;
const props = {
  history,
  location: mock,
  match: {
    isExact: true,
    params: {
      jurisdictionId,
      planId,
    },
    path: `${REPORT_MDA_LITE_PLAN_URL}/:planId/:jurisdictionId/map`,
    url: `${REPORT_MDA_LITE_PLAN_URL}/${planId}/${jurisdictionId}/map`,
  },
};

describe('components/MDA/Lite/Reports/wards', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    shallow(
      <Router history={history}>
        <MDALiteMapReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => MDALiteWardGeojsonData);
    supersetServiceMock.mockImplementationOnce(async () => MDALitePlans);
    supersetServiceMock.mockImplementationOnce(async () => MDALteJurisidtionsData);
    supersetServiceMock.mockImplementationOnce(async () => []);
    const allProps = {
      ...props,
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDALiteMapReport {...allProps} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('MDA Lite Reporting: vihiga');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.find('BreadcrumbItem li').forEach((item, i) => {
      expect(item.text()).toMatchSnapshot(`breadcrumb item-${i + 1}`);
      expect(toJson(item.find('a'))).toMatchSnapshot(`breadcrumb item href-${i + 1}`);
    });
    expect(wrapper.find('.page-title').text()).toEqual('MDA Lite Reporting: vihiga');

    const mapProps = wrapper.find('MemoizedGisidaLiteMock').props() as GisidaLiteProps;
    // Check Gisida component map layers
    expect((mapProps as any).layers.map((e: any) => e.key)).toMatchSnapshot('GisidaLite layers');
    expect(mapProps.zoom).toEqual(12);
    expect(mapProps.mapCenter).toEqual([34.6768368460001, 0.0131305400000485]);
    expect(mapProps.mapBounds).toEqual([
      34.6264335430001,
      -0.026151141999947,
      34.7272401490001,
      0.052412222000044,
    ]);
    wrapper.unmount();
  });
});
