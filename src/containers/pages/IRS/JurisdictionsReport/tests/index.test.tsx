import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Router } from 'react-router';
import { JurisdictionReport } from '../';
import { INTERVENTION_IRS_URL, IRS_REPORTING_TITLE, MAP } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  getGenericJurisdictionByJurisdictionId,
  getGenericJurisdictionsArray,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  fetchIRSPlans,
  getIRSPlanById,
  IRSPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import genericStructuresReducer, {
  fetchGenericStructures,
  GenericStructure,
  getGenericStructures,
  reducerName as genericStructuresReducerName,
  StructureFeatureCollection,
} from '../../../../../store/ducks/generic/structures';
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import jurisdictionReducer, {
  fetchJurisdictions,
  getJurisdictionById,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../../../../store/ducks/jurisdictions';
import * as fixtures from '../../JurisdictionsReport/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** set up data in the store needed for this view */
const focusAreaData = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
const jurisdictionData = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];

store.dispatch(fetchGenericJurisdictions('zm-jurisdictions', jurisdictionData));
store.dispatch(fetchGenericJurisdictions('zm-focusAreas', focusAreaData));

const history = createBrowserHistory();

describe('components/IRS Reports/JurisdictionReport', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    let jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-focusAreas',
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
        path: `${INTERVENTION_IRS_URL}/:planId`,
        url: `${INTERVENTION_IRS_URL}/${(plans[0] as IRSPlan).plan_id}`,
      },
      plan: plans[0] as IRSPlan,
    };
    shallow(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );
  });

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    let jurisdictions =
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-jurisdictions',
        '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d'
      ) || [];
    jurisdictions = jurisdictions.concat(
      getGenericJurisdictionsArray(
        store.getState(),
        'zm-focusAreas',
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
        path: `${INTERVENTION_IRS_URL}/:planId`,
        url: `${INTERVENTION_IRS_URL}/${(plans[0] as IRSPlan).plan_id}`,
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
      data: expect.any(Object) /** just for purposes of making snapshot smaller */,
    });
    expect(wrapper.find('DrillDownTable').props().data).toEqual(jurisdictions);
    expect(supersetServiceMock.mock.calls).toEqual([
      [
        '13',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '727c3d40-e118-564a-b231-aac633e6abce',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          row_limit: 1,
        },
      ],
      [
        '11',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '727c3d40-e118-564a-b231-aac633e6abce',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          order_by_cols: ['["jurisdiction_depth",+true]'],
          row_limit: 3000,
        },
      ],
      [
        '12',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '727c3d40-e118-564a-b231-aac633e6abce',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'plan_id',
            },
          ],
          order_by_cols: ['["jurisdiction_depth",+true]'],
          row_limit: 3000,
        },
      ],
    ]);
    expect(supersetServiceMock).toHaveBeenCalledTimes(3);
    wrapper.unmount();
  });
});
