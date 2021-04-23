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
import { REPORT_MDA_LITE_CDD_REPORT_URL } from '../../../../../constants';
import store from '../../../../../store';
import cddReducer, {
  reducerName as cddReducerName,
} from '../../../../../store/ducks/superset/MDALite/cdd';
import {
  MDALiteCDDReportData,
  MDALiteWardsData,
} from '../../../../../store/ducks/superset/MDALite/tests/fixtures';
import wardsReducer, {
  reducerName as wardsReducerName,
} from '../../../../../store/ducks/superset/MDALite/wards';
import ConnectedMDALiteCddReports, { MDALiteCddReports } from '../cdds';

/** register the reducers */
reducerRegistry.register(cddReducerName, cddReducer);
reducerRegistry.register(wardsReducerName, wardsReducer);

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

const mock: any = jest.fn();
const planId = MDALiteCDDReportData[0].plan_id;
const jurisdictionId = MDALiteCDDReportData[0].base_entity_id;
const supervisorId = MDALiteCDDReportData[0].supervisor_id;
const props = {
  history,
  location: mock,
  match: {
    isExact: true,
    params: {
      jurisdictionId,
      planId,
      supervisorId,
    },
    path: `${REPORT_MDA_LITE_CDD_REPORT_URL}/:planId/:jurisdictionId/:supervisorId`,
    url: `${REPORT_MDA_LITE_CDD_REPORT_URL}/${planId}/${jurisdictionId}/${supervisorId}`,
  },
};

describe('components/MDA/Lite/Reports/cddReport/supervisor', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    shallow(
      <Router history={history}>
        <MDALiteCddReports {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => MDALiteCDDReportData);
    supersetServiceMock.mockImplementationOnce(async () => MDALiteWardsData);
    const allProps = {
      ...props,
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDALiteCddReports {...allProps} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('MDA Lite Reporting: UHS3:UpperHillWard Supervisor 3');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.find('BreadcrumbItem li').forEach((item, i) => {
      expect(item.text()).toMatchSnapshot(`breadcrumb item-${i + 1}`);
      expect(toJson(item.find('a'))).toMatchSnapshot(`breadcrumb item href-${i + 1}`);
    });
    expect(wrapper.find('.page-title').text()).toEqual(
      'MDA Lite Reporting: UHS3:UpperHillWard Supervisor 3'
    );
    // table tests
    expect(wrapper.find('DrillDownTable .thead .tr').length).toEqual(2);
    wrapper
      .find('.thead .tr .th')
      .forEach((th, i) => expect(th.text()).toMatchSnapshot(`table headers-${i + 1}`));
    expect(wrapper.find('.no-data-cls').length).toMatchInlineSnapshot(`0`);
    //   // check data rendered
    expect(wrapper.find('.tbody .tr').length).toEqual(2);
    const row1 = wrapper.find('.tbody .tr').at(0);
    const row2 = wrapper.find('.tbody .tr').at(1);
    expect(
      row1
        .find('.td')
        .at(0)
        .text()
    ).toEqual('UHCDD1:UpperHillWard CDD 1');
    expect(
      row2
        .find('.td')
        .at(0)
        .text()
    ).toEqual('UH4CDD4:UpperHillWard CDD 4');
    // check if text breaking class is loaded
    expect(
      row1
        .find('.td')
        .at(0)
        .find('div div')
        .hasClass('break-text')
    ).toBeTruthy();
  });
});
