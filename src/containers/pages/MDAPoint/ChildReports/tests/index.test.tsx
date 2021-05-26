import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedChildReports, { ChildReportList, extractChildData, getSACsColumnsValues } from '..';
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
      ['annonymous user', '2345', 'No', 'Yes', 'No', 'Yes', 'No', 0, 0],
      ['known man', '843', 'No', 'No', 'Yes', 'No', 'No', 0, 0],
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

  it('should render correct data when child list is passed', () => {
    const childData = [
      {
        client_age_category: '11 - 15',
        client_first_name: 'test',
        client_last_name: 'user',
        jurisdiction_depth: 2,
        jurisdiction_id: '3951',
        jurisdiction_id_path: ['2942', '3019', '3951'],
        jurisdiction_name_path: ['Lusaka', 'Mtendere', 'Akros_1'],
        mmaadr: 0,
        mmaalbgiven: 0,
        mmanodrugadminreason: null,
        mmapzqdosagegiven: 'test',
        plan_id: '40357eff-81b6-4e32-bd3d-484019689f7c',
        sactacurrenroll: 1,
        sactanationalid: '2345',
        school_location_id: '154153',
      },
    ];
    const tableData = [['test user', '2345', 'Yes', '', '', '', 'No', 'test', 0]];
    expect(extractChildData(childData)).toEqual(tableData);
  });

  it('evaluates SACs columns correctly', () => {
    // null values
    expect(getSACsColumnsValues(null, true)).toEqual('');
    expect(getSACsColumnsValues(null, false)).toEqual('');
    // pregnant value
    expect(getSACsColumnsValues('pregnant', true)).toEqual('No');
    expect(getSACsColumnsValues('pregnant', false)).toEqual('Yes');
    // sick value
    expect(getSACsColumnsValues('sick', true)).toEqual('No');
    expect(getSACsColumnsValues('sick', false)).toEqual('Yes');
    // contraindicated value
    expect(getSACsColumnsValues('contraindicated', true)).toEqual('No');
    expect(getSACsColumnsValues('contraindicated', false)).toEqual('Yes');
    // refused value
    expect(getSACsColumnsValues('refused', true)).toEqual('Yes');
    expect(getSACsColumnsValues('refused', false)).toEqual('No');
  });
});
