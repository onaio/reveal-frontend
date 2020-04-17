import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Router } from 'react-router';
import { JurisdictionReport } from '../';
import {
  indicatorThresholdsIRS,
  indicatorThresholdsLookUpIRS,
} from '../../../../../configs/settings';
import { REPORT_IRS_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  getGenericJurisdictionsArray,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import * as fixtures from '../../JurisdictionsReport/fixtures';
import { IRSTableColumns } from '../helpers';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
(global as any).mapboxgl = {};

jest.mock('../../../../../configs/env', () => ({
  SUPERSET_IRS_REPORTING_FOCUS_AREAS_COLUMNS: 'namibia2019',
  SUPERSET_IRS_REPORTING_INDICATOR_ROWS: 'namibia2019',
  SUPERSET_IRS_REPORTING_INDICATOR_STOPS: 'namibia2019',
  SUPERSET_IRS_REPORTING_JURISDICTIONS_COLUMNS: 'namibia2019',
  SUPERSET_IRS_REPORTING_JURISDICTIONS_DATA_SLICES: '11,12',
}));

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('nm-jurisdictions', jurisdictionData));
store.dispatch(fetchGenericJurisdictions('nm-focusAreas', focusAreaData));

const history = createBrowserHistory();

describe('components/IRS Reports/JurisdictionReport', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    let jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'nm-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'nm-focusAreas',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      )
    );

    const props = {
      history,
      jurisdictions,
      location: mock,
      match: {
        isExact: true,
        params: {
          planId: (plans[0] as IRSPlan).plan_id,
        },
        path: `${REPORT_IRS_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_PLAN_URL}/${(plans[0] as IRSPlan).plan_id}`,
      },
      plan: plans[0] as IRSPlan,
      service: supersetServiceMock,
    };

    const wrapper = mount(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );
    const helmet = Helmet.peek();
    await flushPromises();
    expect(toJson(wrapper.find('BreadcrumbItem li'))).toMatchSnapshot('breadcrumbs');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('page title');
    expect(helmet.title).toEqual('IRS Reporting: IRS 2019-09-05 TEST');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot({
      columns: expect.any(Object) /** just for purposes of making snapshot smaller */,
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect((wrapper.find('DrillDownTable').props() as any).columns).toEqual(
      IRSTableColumns.namibia2019
    );
    expect(wrapper.find('IRSIndicatorLegend').length).toEqual(1);
    expect(wrapper.find('IRSIndicatorLegend').props()).toEqual({
      indicatorRows: 'namibia2019',
      indicatorThresholds: indicatorThresholdsIRS,
      indicatorThresholdsLookUp: indicatorThresholdsLookUpIRS,
    });
    expect(supersetServiceMock).toHaveBeenCalledTimes(3);
    wrapper.unmount();
  });
});
