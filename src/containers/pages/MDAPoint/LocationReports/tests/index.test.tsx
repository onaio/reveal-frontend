import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedLocationReports, { LocationReportsList } from '..';
import { MDA_POINT_LOCATION_REPORT_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import MDAPointLocationReportReducer, {
  FetchMDAPointLocationReportAction,
  reducerName as MDAPointLocationReportReducerName,
  removeMDAPointLocationReports,
} from '../../../../../store/ducks/generic/MDALocationsReport';
import GenericPlanreducer, {
  genericFetchPlans,
  GenericPlan,
  reducerName as genericReducerName,
} from '../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';
import { MDAPointJurisdictionsJSON } from '../../jurisdictionsReport/tests/fixtures';

jest.mock('../../../../../configs/env', () => ({
  SHOW_MDA_SCHOOL_REPORT_LABEL: false,
  SUPERSET_MDA_POINT_LOCATION_REPORT_DATA_SLICE: '01',
  SUPERSET_MDA_POINT_REPORTING_JURISDICTIONS_DATA_SLICES: '12,esw-jurisdictions',
}));
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

reducerRegistry.register(MDAPointLocationReportReducerName, MDAPointLocationReportReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericReducerName, GenericPlanreducer);

const jurisdictionData = superset.processData(MDAPointJurisdictionsJSON) || [];
store.dispatch(fetchGenericJurisdictions('esw-jurisdictions', jurisdictionData));
store.dispatch(genericFetchPlans(fixtures.MDAPointPlans as GenericPlan[]));

const props = {
  history,
  location: {
    hash: '',
    pathname: MDA_POINT_LOCATION_REPORT_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {
      jurisdictionId: '3951',
      planId: '40357eff-81b6-4e32-bd3d-484019689f7c',
    },
    path: `${MDA_POINT_LOCATION_REPORT_URL}`,
    url: `${MDA_POINT_LOCATION_REPORT_URL}`,
  },
};

describe('components/MDA Reports/MDAPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <LocationReportsList {...props} />
      </Router>
    );
  });

  it('should render school reports correctly', () => {
    store.dispatch(FetchMDAPointLocationReportAction(fixtures.MDAPointSchoolReportData));

    const tableData = [
      ['11 - 15', 9, 6, '66.67%', 0, 0, '0.00%', '0.00%', 0],
      ['< 6', 6, 0, '0.00%', 0, 0, '0.00%', '0.00%', 0],
    ];

    fetch.mockResponseOnce(fixtures.MDAPointSchoolReportData);

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedLocationReports {...props} />
        </Router>
      </Provider>
    );

    expect(wrapper.find('h3.page-title').text()).toEqual('MDA Point Location Report: Akros_1');
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');

    // correct table data is passed
    expect(wrapper.find('GenericSupersetDataTable').props().data).toEqual(tableData);
    expect(wrapper.find('ListView').props().data).toEqual(tableData);

    expect(toJson(wrapper.find('ListView table'))).toMatchSnapshot('table');
    // two reports rendered
    expect(wrapper.find('.listview-tbody tr').length).toEqual(2);

    // clear store
    store.dispatch(removeMDAPointLocationReports());
    wrapper.update();
    expect(wrapper.find('GenericSupersetDataTable div div').text()).toEqual('No rows found');
  });
});
