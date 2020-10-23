import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedJurisdictionReportLite, { JurisdictionReport } from '../';
import { REPORT_IRS_LITE_PLAN_URL } from '../../../../../constants';
import store from '../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  getGenericJurisdictionsArray,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  GenericPlan,
  reducerName as IRSPlansReducerName,
} from '../../../../../store/ducks/generic/plans';
import { plans } from '../../../../../store/ducks/generic/tests/fixtures';
import * as fixtures from '../../JurisdictionsReportLite/fixtures';

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

describe('components/IRS Reports/JurisdictionReportLite', () => {
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
          planId: (plans[0] as GenericPlan).plan_id,
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/${(plans[0] as GenericPlan).plan_id}`,
      },
      plan: plans[0] as GenericPlan,
    };
    shallow(
      <Router history={history}>
        <JurisdictionReport {...props} />
      </Router>
    );
  });

  it('display correct headers when provinces are loaded', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);
    store.dispatch(fetchGenericJurisdictions('11', jurisdictionData));
    store.dispatch(fetchGenericJurisdictions('12', focusAreaData));
    const props = {
      history,
      location: {
        hash: '',
        pathname: REPORT_IRS_LITE_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {
          jurisdictionId: '22bc44dd-752d-4c20-8761-617361b4f1e7', // Zambia jurisdiction Id
          planId: '9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d',
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/9f1e0cfa-5313-49ff-af2c-f7dbf4fbdb9d`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionReportLite {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper
      .find('.thead .th')
      .map((node, i) => expect(node.text()).toMatchSnapshot(`header on provinces display ${i}`));
    expect(wrapper.find('.thead .th').length).toEqual(12);
  });

  it('display correct headers when Spray Areas are loaded', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);
    store.dispatch(fetchGenericJurisdictions('11', jurisdictionData));
    store.dispatch(fetchGenericJurisdictions('12', focusAreaData));
    const props = {
      history,
      location: {
        hash: '',
        pathname: REPORT_IRS_LITE_PLAN_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {
          jurisdictionId: '03557b7e-0ddf-41f7-93c8-155669757a16', // Lusaka HFC jurisdiction Id (spray area parent)
          planId: '17f89152-51a6-476c-9246-8fee6f9e6ebf',
        },
        path: `${REPORT_IRS_LITE_PLAN_URL}/:planId`,
        url: `${REPORT_IRS_LITE_PLAN_URL}/17f89152-51a6-476c-9246-8fee6f9e6ebf`,
      },
      service: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedJurisdictionReportLite {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper
      .find('.thead .th')
      .map((node, i) => expect(node.text()).toMatchSnapshot(`header on Spray Areas display ${i}`));
    expect(wrapper.find('.thead .th').length).toEqual(12);
  });
});
