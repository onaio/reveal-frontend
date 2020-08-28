import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedChildReports, { ChildReportList } from '..';
import { MDA_POINT_CHILD_REPORT_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import MDAPointChildReportReducer, {
  FetchMDAPointChildReportAction,
  reducerName as MDAPointChildReportReducerName,
  removeMDAPointChildReports,
} from '../../../../../store/ducks/generic/MDAChildReport';
import GenericPlanreducer, {
  genericFetchPlans,
  GenericPlan,
  reducerName as genericReducerName,
} from '../../../../../store/ducks/generic/plans';
import * as fixtures from '../../../../../store/ducks/generic/tests/fixtures';
import { MDAPointJurisdictionsJSON } from '../../jurisdictionsReport/tests/fixtures';

jest.mock('../../../../../configs/env');
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();

reducerRegistry.register(MDAPointChildReportReducerName, MDAPointChildReportReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);
reducerRegistry.register(genericReducerName, GenericPlanreducer);

const jurisdictionData = superset.processData(MDAPointJurisdictionsJSON) || [];
store.dispatch(fetchGenericJurisdictions('esw-jurisdictions', jurisdictionData));
store.dispatch(genericFetchPlans(fixtures.MDAPointPlans as GenericPlan[]));

const props = {
  history,
  location: {
    hash: '',
    pathname: MDA_POINT_CHILD_REPORT_URL,
    search: '',
    state: undefined,
  },
  match: {
    isExact: true,
    params: {
      jurisdictionId: '3951',
      planId: '40357eff-81b6-4e32-bd3d-484019689f7c',
    },
    path: `${MDA_POINT_CHILD_REPORT_URL}`,
    url: `${MDA_POINT_CHILD_REPORT_URL}`,
  },
};

describe('components/MDA Reports/MDAPlansList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <ChildReportList {...props} />
      </Router>
    );
  });

  it('should render school reports correctly', () => {
    store.dispatch(FetchMDAPointChildReportAction(fixtures.MDAPointChildReportData));

    const tableData = [
      ['annonymous user', '2345', 'No', 'Yes', 'No', 'No', 'No', 0, 0],
      ['known man', '843', 'No', 'No', 'Yes', 'Yes', 'No', 0, 0],
    ];

    fetch.mockResponseOnce(fixtures.MDAPointChildReportData);

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedChildReports {...props} />
        </Router>
      </Provider>
    );

    expect(wrapper.find('h3.page-title').text()).toEqual('MDA Point Child Report: Akros_1');
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');

    // correct table data is passed
    expect(wrapper.find('ChildSupersetDataTable').props().data).toEqual(tableData);
    expect(wrapper.find('ListView').props().data).toEqual(tableData);

    expect(toJson(wrapper.find('ListView table'))).toMatchSnapshot('table');
    // two reports rendered
    expect(wrapper.find('.listview-tbody tr').length).toEqual(2);

    // clear store
    store.dispatch(removeMDAPointChildReports());
    wrapper.update();
    expect(wrapper.find('ChildSupersetDataTable div div').text()).toEqual('No rows found');
  });
});
