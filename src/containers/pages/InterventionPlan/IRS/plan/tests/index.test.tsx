import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { INTERVENTION_IRS_URL } from '../../../../../../constants';
import * as utils from '../../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../../services/opensrp';
import store from '../../../../../../store';
import jurisdictionReducer, {
  reducerName as jurisdictionReducerName,
} from '../../../../../../store/ducks/jurisdictions';
import { fetchAssignments } from '../../../../../../store/ducks/opensrp/assignments';
import plansReducer, {
  fetchPlanRecords,
  PlanRecordResponse,
  reducerName as plansReducerName,
} from '../../../../../../store/ducks/plans';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import { irsPlanRecordResponse1, jurisdictionsById } from '../../tests/fixtures';
import ConnectedIrsPlan, { IrsPlan } from './..';
import * as serviceCalls from './../serviceCalls';
import {
  assignments,
  divDocumentCreator,
  irsPlanRecordActive,
  irsPlanRecordActiveResponse,
  irsPlanRecordDraft,
  irsPlanRecordDraftResponse,
  jurisdictionGeo,
  jurisidictionResults,
  locationResults,
} from './fixtures';

reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);
reducerRegistry.register(plansReducerName, plansReducer);

jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('containers/pages/IRS/plan', () => {
  beforeEach(() => {
    // There will be only one call to get organizations
    // so we can be sure to mock once for each
    const mockList = jest.fn();
    OpenSRPService.prototype.list = mockList;
    mockList.mockReturnValueOnce(Promise.resolve([fixtures.organization1, fixtures.organization2]));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '1234' },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/1234`,
      },
      planId: '1234',
    };
    shallow(
      <Router history={history}>
        <IrsPlan {...props} />
      </Router>
    );
  });

  it('renders IRS Plan page correctly', () => {
    const mock: any = jest.fn();
    const { id } = fixtures.plan1;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/${id}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    // check that the page title is rendered correctly
    expect(toJson(wrapper.find('IrsPlan'))).toMatchSnapshot();
  });

  it('renders without crashing when loading plans with invlaid jurisdiction ids', () => {
    store.dispatch(fetchPlanRecords([irsPlanRecordResponse1 as PlanRecordResponse]));

    fetch.mockResponseOnce(JSON.stringify({}));
    const mock: any = jest.fn();
    const { identifier: id } = irsPlanRecordResponse1;

    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => [
      jurisdictionsById['0'],
      jurisdictionsById['1A'],
      jurisdictionsById['1B'],
      jurisdictionsById['1Aa'],
      jurisdictionsById['1Ab'],
      jurisdictionsById['1Ba'],
      jurisdictionsById['1Bb'],
    ]);

    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/${id}`,
      },
    };

    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );

    wrapper.unmount();
  });

  it('renders correctly if props.planById.plan_status is draft', async () => {
    store.dispatch(fetchPlanRecords([irsPlanRecordDraftResponse as PlanRecordResponse]));
    const supersetServiceMock: any = jest.fn(() => Promise.resolve(jurisidictionResults));
    const loadPlanMock: any = jest.spyOn(serviceCalls, 'loadPlan');
    const mockRead = jest.fn();
    mockRead
      .mockReturnValueOnce(Promise.resolve([fixtures.assignment1])) // First organization
      .mockReturnValueOnce(Promise.resolve([fixtures.assignment2])) // Second organization
      .mockReturnValueOnce(Promise.resolve(locationResults))
      .mockReturnValueOnce(Promise.resolve(jurisdictionGeo));
    OpenSRPService.prototype.read = mockRead;

    const { id } = irsPlanRecordDraft;
    const props = {
      history,
      location: jest.fn(),
      match: {
        isExact: true,
        params: { id },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/${id}`,
      },
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();

    expect(wrapper.find('.page-title').text()).toEqual('IRS: IRS 2019-08-09 (draft)');
    expect(wrapper.props()).toMatchSnapshot('component props');
    expect(wrapper.find('GisidaWrapper').props()).toMatchSnapshot('GisidaWrapper props');
    expect(wrapper.find('DrillDownTable').props()).toMatchSnapshot('DrillDownTable props');
    expect(wrapper.find('GisidaWrapper').length).toEqual(1);
    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    expect(wrapper.find('.table-title').text()).toEqual('Select Jurisdictions');
    // location selectors
    expect(wrapper.find('.table-bread-crumbs').length).toEqual(1);
    expect(wrapper.find('.table-bread-crumbs li').text()).toEqual('Lusaka');

    expect(loadPlanMock).not.toBeCalled();
    expect(mockRead.mock.calls.length).toBe(4);
    expect(supersetServiceMock.mock.calls.length).toBe(1);
    wrapper.unmount();
  });

  it('renders correctly if props.planById.plan_status is active', async () => {
    divDocumentCreator(['0', '1B', '2942']);
    store.dispatch(fetchPlanRecords([irsPlanRecordActiveResponse as PlanRecordResponse]));
    store.dispatch(fetchAssignments(assignments));
    const supersetServiceMock: any = jest.fn(() => Promise.resolve(jurisidictionResults));
    const loadPlanMock: any = jest.spyOn(serviceCalls, 'loadPlan');

    const mockRead = jest.fn();
    mockRead
      .mockReturnValueOnce(Promise.resolve([fixtures.assignment1])) // First organization
      .mockReturnValueOnce(Promise.resolve([fixtures.assignment2])) // Second organization
      .mockReturnValueOnce(Promise.resolve(locationResults))
      .mockReturnValueOnce(Promise.resolve(jurisdictionGeo));
    OpenSRPService.prototype.read = mockRead;

    const { id } = irsPlanRecordActive;
    const props = {
      history,
      location: jest.fn(),
      match: {
        isExact: true,
        params: { id },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/${id}`,
      },
      supersetService: supersetServiceMock,
    };

    const getFeatureByPropertySpy = jest.spyOn(utils, 'getFeatureByProperty');
    const getGisidaMapByIdSpy = jest.spyOn(utils, 'getGisidaMapById');
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    await flushPromises();
    wrapper.update();

    expect(wrapper.find('GisidaWrapper').length).toEqual(1);
    expect(wrapper.find('DrillDownTable').length).toEqual(1);
    expect(wrapper.find('.page-title').text()).toEqual('IRS: IRS 2019-08-09');
    expect(wrapper.find('.save-as-finalized-plan-btn').length).toEqual(2);
    // location selectors
    expect(wrapper.find('.table-bread-crumbs li').text()).toEqual('Lusaka');
    // level 1 locations

    await new Promise(resolve => setImmediate(resolve));
    expect(wrapper.text()).toMatchInlineSnapshot(
      `"HomeIRSIRS 2019-08-09IRS: IRS 2019-08-09Save AssignmentsAssign JurisdictionsLusakaNameTypeTeam AssignmentNo Data Found"`
    );
    expect(wrapper.find('DrillDownTable').props()).toMatchInlineSnapshot(`
      Object {
        "CellComponent": [Function],
        "columns": Array [
          Object {
            "Header": "Name",
            "accessor": [Function],
            "id": "name",
          },
          Object {
            "Header": "Type",
            "accessor": [Function],
            "id": "jurisdiction-type",
          },
          Object {
            "Header": "Team Assignment",
            "accessor": [Function],
            "id": "teams_assigned",
          },
        ],
        "data": Array [
          Object {
            "assignedTeams": Array [
              "fcc19470-d599-11e9-bb65-2a2ae2dbcce4",
            ],
            "geographic_level": 2,
            "geojson": Object {
              "geometry": Object {
                "coordinates": Array [
                  Array [
                    Array [
                      101.188427209854,
                      15.0909179029537,
                    ],
                    Array [
                      101.18852108717,
                      15.0909179029537,
                    ],
                    Array [
                      101.18852108717,
                      15.0910085427885,
                    ],
                    Array [
                      101.188427209854,
                      15.0910085427885,
                    ],
                    Array [
                      101.188427209854,
                      15.0909179029537,
                    ],
                  ],
                ],
                "type": "Polygon",
              },
              "id": "2942",
            },
            "id": "2942",
            "isChildless": true,
            "isPartiallySelected": false,
            "jurisdiction_id": "2942",
            "name": "1B - 2942",
            "parent_id": "1B",
            "planId": "0230f9e8-1f30-5e91-8693-4c993661785e",
          },
          Object {
            "assignedTeams": Array [
              "fcc19470-d599-11e9-bb65-2a2ae2dbcce4",
            ],
            "geographic_level": 1,
            "id": "1B",
            "isChildless": false,
            "isPartiallySelected": Array [
              "1B",
            ],
            "jurisdiction_id": "1B",
            "name": "1B",
            "parent_id": "0",
            "planId": "0230f9e8-1f30-5e91-8693-4c993661785e",
          },
          Object {
            "assignedTeams": Array [],
            "geographic_level": 0,
            "id": "0",
            "isChildless": false,
            "isPartiallySelected": Array [
              "0",
            ],
            "jurisdiction_id": "0",
            "name": "0",
            "parent_id": null,
            "planId": "0230f9e8-1f30-5e91-8693-4c993661785e",
          },
        ],
        "hasChildren": [Function],
        "identifierField": "jurisdiction_id",
        "linkerField": "name",
        "loading": false,
        "loadingComponent": [Function],
        "nullDataComponent": [Function],
        "paginate": false,
        "parentIdentifierField": "parent_id",
        "resize": true,
        "rootParentId": "2942",
        "showPagination": false,
        "useDrillDown": true,
      }
    `);

    expect(wrapper.find('Table').props()).toMatchInlineSnapshot(`
      Object {
        "CellComponent": [Function],
        "columns": Array [
          Object {
            "Header": "Name",
            "accessor": [Function],
            "id": "name",
          },
          Object {
            "Header": "Type",
            "accessor": [Function],
            "id": "jurisdiction-type",
          },
          Object {
            "Header": "Team Assignment",
            "accessor": [Function],
            "id": "teams_assigned",
          },
        ],
        "data": Array [],
        "fetchData": [Function],
        "hasChildren": [Function],
        "identifierField": "jurisdiction_id",
        "linkerField": "name",
        "loading": false,
        "loadingComponent": [Function],
        "nullDataComponent": [Function],
        "paginate": false,
        "parentIdentifierField": "parent_id",
        "parentNodes": Array [
          "1B",
          "0",
          null,
        ],
        "resize": true,
        "rootParentId": "2942",
        "showPagination": false,
        "useDrillDown": true,
      }
    `);

    // expect(wrapper.find('.plan-jurisdiction-name').length).toEqual(3);
    // expect(
    //   wrapper
    //     .find('.plan-jurisdiction-name')
    //     .at(0)
    //     .text()
    // ).toEqual('1B - 2942');
    // expect(
    //   wrapper
    //     .find('.plan-jurisdiction-name')
    //     .at(1)
    //     .text()
    // ).toEqual('1B');
    // expect(
    //   wrapper
    //     .find('.plan-jurisdiction-name')
    //     .at(2)
    //     .text()
    // ).toEqual('0');
    // // drill to locations level 2
    // wrapper
    //   .find('.plan-jurisdiction-name')
    //   .at(1)
    //   .simulate('click');
    // wrapper.update();
    // expect(wrapper.find('.table-bread-crumbs li').length).toEqual(2);
    // expect(
    //   wrapper
    //     .find('.table-bread-crumbs li')
    //     .at(0)
    //     .text()
    // ).toEqual('Lusaka');
    // expect(
    //   wrapper
    //     .find('.table-bread-crumbs li')
    //     .at(1)
    //     .text()
    // ).toEqual('1B');
    // expect(getFeatureByPropertySpy).toHaveBeenCalledWith('jurisdictionId', '1B');
    // expect(wrapper.find('AssignTeamButton Button').length).toBe(1);
    // expect(wrapper.find('.assignment-label').text()).toEqual('The Luang');
    // go back to level 1
    // wrapper
    //   .find('.table-bread-crumb-link')
    //   .at(0)
    //   .simulate('click');
    // wrapper.update();
    // expect(wrapper.find('.table-bread-crumbs li').length).toEqual(1);
    expect(wrapper.find('.table-bread-crumbs li').text()).toEqual('Lusaka');
    /**
     * to do
     * find a way to mock mapbox Map and
     * mock getGisidaMapById function from utils to return the mocked Map
     */
    // expect(getGisidaMapByIdSpy).toHaveBeenCalledWith('map-1');

    expect(loadPlanMock).not.toBeCalled();
    expect(mockRead.mock.calls.length).toBe(4);
    expect(supersetServiceMock.mock.calls.length).toBe(1);
  });
});
