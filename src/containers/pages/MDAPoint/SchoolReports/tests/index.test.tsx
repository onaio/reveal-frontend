import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedSchoolReports, { SchoolReportsList } from '..';
import { MDA_POINT_SCHOOL_REPORT_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import MDAPointSchoolReportReducer, {
  FetchMDAPointSchoolReportAction,
  reducerName as MDAPointSchoolReportReducerName,
} from '../../../../../store/ducks/generic/MDASchoolReport';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';
import { MDAPointJurisdictionsJSON } from '../../jurisdictionsReport/tests/fixtures';

jest.mock('../../../../../configs/env');
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

reducerRegistry.register(MDAPointSchoolReportReducerName, MDAPointSchoolReportReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

const jurisdictionData = superset.processData(MDAPointJurisdictionsJSON) || [];
store.dispatch(fetchGenericJurisdictions('esw-jurisdictions', jurisdictionData));

const props = {
  history,
  location: {
    hash: '',
    pathname: MDA_POINT_SCHOOL_REPORT_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {
      jurisdictionId: '3951',
      planId: '40357eff-81b6-4e32-bd3d-484019689f7c',
    },
    path: `${MDA_POINT_SCHOOL_REPORT_URL}`,
    url: `${MDA_POINT_SCHOOL_REPORT_URL}`,
  },
};

describe('components/MDA Reports/MDAPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <SchoolReportsList {...props} />
      </Router>
    );
  });

  it('should render school reports correctly', () => {
    store.dispatch(FetchMDAPointSchoolReportAction(fixtures.MDAPointSchoolReportData));

    const tableData = [
      ['11 - 15', 9, 6, 0.6666666666666666, 0, 0, 0, 0, 0],
      ['< 6', 6, 0, 0, 0, 0, 0, 0, 0],
    ];

    fetch.mockResponseOnce(fixtures.MDAPointSchoolReportData);

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedSchoolReports {...props} />
        </Router>
      </Provider>
    );

    expect(wrapper.find('h3.page-title').text()).toEqual('MDA Point School Reporting: Akros_1');
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');

    // correct table data is passed
    expect(wrapper.find('GenericSupersetDataTable').props().data).toEqual(tableData);
    expect(wrapper.find('ListView').props().data).toEqual(tableData);

    expect(toJson(wrapper.find('ListView table'))).toMatchSnapshot('table');
    // two reports rendered
    expect(wrapper.find('.listview-tbody tr').length).toEqual(2);
  });
});
