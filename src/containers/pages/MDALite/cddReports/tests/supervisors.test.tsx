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
import supervisorReducer, {
  reducerName as supervisorReducerName,
} from '../../../../../store/ducks/superset/MDALite/supervisors';
import {
  MDALiteSupervisorData,
  MDALiteWardsData,
} from '../../../../../store/ducks/superset/MDALite/tests/fixtures';
import wardsReducer, {
  reducerName as wardsReducerName,
} from '../../../../../store/ducks/superset/MDALite/wards';
import ConnectedMDALiteSupervisorReports, { MDALiteSupervisorReports } from '../supervisors';

/** register the reducers */
reducerRegistry.register(supervisorReducerName, supervisorReducer);
reducerRegistry.register(wardsReducerName, wardsReducer);

jest.mock('../../../../../configs/env');

const history = createBrowserHistory();

const mock: any = jest.fn();
const planId = MDALiteSupervisorData[0].plan_id;
const jurisdictionId = MDALiteSupervisorData[0].base_entity_id;
const props = {
  history,
  location: mock,
  match: {
    isExact: true,
    params: {
      jurisdictionId,
      planId,
    },
    path: `${REPORT_MDA_LITE_CDD_REPORT_URL}/:planId/:jurisdictionId`,
    url: `${REPORT_MDA_LITE_CDD_REPORT_URL}/${planId}/${jurisdictionId}`,
  },
};

describe('components/MDA/Lite/Reports/cddReport/supervisor', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    shallow(
      <Router history={history}>
        <MDALiteSupervisorReports {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementationOnce(async () => MDALiteSupervisorData);
    supersetServiceMock.mockImplementationOnce(async () => MDALiteWardsData);
    const allProps = {
      ...props,
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMDALiteSupervisorReports {...allProps} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    const helmet = Helmet.peek();
    expect(helmet.title).toEqual('MDA Lite Reporting: mungoma');
    expect(wrapper.find('HeaderBreadcrumb').length).toEqual(1);
    wrapper.find('BreadcrumbItem li').forEach((item, i) => {
      expect(item.text()).toMatchSnapshot(`breadcrumb item-${i + 1}`);
      expect(toJson(item.find('a'))).toMatchSnapshot(`breadcrumb item href-${i + 1}`);
    });
    expect(wrapper.find('.page-title').text()).toEqual('MDA Lite Reporting: mungoma');
    // table tests
    expect(wrapper.find('DrillDownTable .thead .tr').length).toEqual(1);
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
    ).toEqual('emuhayaSupervisor1:emuhaya Supervisor 1');
    expect(
      row2
        .find('.td')
        .at(0)
        .text()
    ).toEqual('UHS3:UpperHillWard Supervisor 3');
    // do we have correct links to cdds
    expect(
      row1
        .find('.td a')
        .at(0)
        .prop('href')
    ).toEqual(
      '/intervention/mda-lite/cdd/report/5e396185-6094-4817-9dd4-24bcbbc698b0/9ec52632-7bfb-40f5-9ef7-8804627a65cb/13890722-db5d-53a6-a930-a9fb04c7bcc3'
    );
    expect(
      row2
        .find('.td a')
        .at(0)
        .prop('href')
    ).toEqual(
      '/intervention/mda-lite/cdd/report/5e396185-6094-4817-9dd4-24bcbbc698b0/9ec52632-7bfb-40f5-9ef7-8804627a65cb/b26bbce2-75b0-5d5f-8e3d-4eec512f24d3'
    );
    // check if text breaking class is loaded
    expect(
      row1
        .find('.td')
        .at(0)
        .find('a')
        .hasClass('break-text')
    ).toBeTruthy();
  });
});
