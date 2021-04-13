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
import ConnectedMDALiteWardsReport, { MDALiteWardsReport } from '../';
import { REPORT_MDA_LITE_WARD_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  reducerName as genericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import GenericPlansReducer, {
  reducerName as genericPlanReducerName,
} from '../../../../../store/ducks/generic/plans';
import {
  MDALitePlans,
  MDALiteWardsData,
  MDALteJurisidtionsData,
} from '../../../../../store/ducks/superset/MDALite/tests/fixtures';
import wardsReducer, {
  reducerName as wardsReducerName,
} from '../../../../../store/ducks/superset/MDALite/wards';

/** register the reducers */
reducerRegistry.register(genericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericPlanReducerName, GenericPlansReducer);
reducerRegistry.register(wardsReducerName, wardsReducer);

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

const mock: any = jest.fn();
const planId = MDALiteWardsData[0].plan_id;
const jurisdictionId = MDALiteWardsData[0].parent_id;
const props = {
  history,
  location: mock,
  match: {
    isExact: true,
    params: {
      jurisdictionId,
      planId,
    },
    path: `${REPORT_MDA_LITE_WARD_URL}/:planId/:jurisdictionId`,
    url: `${REPORT_MDA_LITE_WARD_URL}/${planId}/${jurisdictionId}`,
  },
};

describe('components/MDA/Lite/Reports/wards', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    shallow(
      <Router history={history}>
        <MDALiteWardsReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => MDALiteWardsData);
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
          <ConnectedMDALiteWardsReport {...allProps} />
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
    // table tests
    expect(wrapper.find('DrillDownTable .thead .tr').length).toEqual(2);
    wrapper
      .find('.thead .tr .th')
      .forEach((th, i) => expect(th.text()).toMatchSnapshot(`table headers-${i + 1}`));
    expect(wrapper.find('.no-data-cls').length).toMatchInlineSnapshot(`0`);
    // check data rendered
    expect(wrapper.find('.tbody .tr').length).toEqual(2);
    const row1 = wrapper.find('.tbody .tr').at(0);
    const row2 = wrapper.find('.tbody .tr').at(1);
    expect(
      row1
        .find('.td')
        .at(0)
        .text()
    ).toEqual('lugaga');
    expect(
      row2
        .find('.td')
        .at(0)
        .text()
    ).toEqual('mungoma');
    // do we have correct links to cdds supervisors
    expect(
      row1
        .find('.td a')
        .at(0)
        .prop('href')
    ).toEqual(
      '/intervention/mda-lite/cdd/report/5e396185-6094-4817-9dd4-24bcbbc698b0/28713d21-d4f9-49b7-aab7-b07838fb086f'
    );
    expect(
      row2
        .find('.td a')
        .at(0)
        .prop('href')
    ).toEqual(
      '/intervention/mda-lite/cdd/report/5e396185-6094-4817-9dd4-24bcbbc698b0/9ec52632-7bfb-40f5-9ef7-8804627a65cb'
    );
  });
});
