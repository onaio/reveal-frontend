import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureMockStore from 'redux-mock-store';
import { defaultProps as defaultPlanFormProps } from '../../../../../../components/forms/PlanForm';
import { generatePlanDefinition } from '../../../../../../components/forms/PlanForm/helpers';
import HeaderBreadcrumb from '../../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { FOCUS_AREA_HEADER } from '../../../../../../configs/lang';
import store from '../../../../../../store';
import {
  addPlanDefinition,
  removePlanDefinitions,
} from '../../../../../../store/ducks/opensrp/PlanDefinition';
import ConnectedBaseNewPlan, { NewPlanForPlanning } from '../index';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

const history = createBrowserHistory();
const middlewares: any = [];
const mockStore = configureMockStore(middlewares);

jest.mock('../../../../../../configs/env');

describe('containers/pages/NewPlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
    jest.clearAllMocks();
    store.dispatch(removePlanDefinitions());
  });

  it('renders without crashing', () => {
    shallow(<ConnectedBaseNewPlan />);
  });

  it('renders correctly', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedBaseNewPlan />
        </Router>
      </Provider>
    );

    // check that page title is displayed
    expect(toJson(wrapper.find('h3.mb-3.page-title'))).toMatchSnapshot('page title');

    expect(wrapper.find('PlanForm').props()).toEqual({
      ...defaultPlanFormProps,
      addPlan: expect.any(Function),
      allowMoreJurisdictions: true,
      cascadingSelect: true,
      formHandler: expect.any(Function),
      jurisdictionLabel: FOCUS_AREA_HEADER,
    });

    // check that there's a Row that nests a Col that nests a PlanForm
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find('Row').find('Col')).toHaveLength(2);
    expect(
      wrapper
        .find('Row')
        .find('Col#planform-col-container')
        .find('PlanForm')
    ).toHaveLength(1);

    // FI intervention type is loaded
    expect(wrapper.find('#fiStatus').length).toBeTruthy();
    expect(wrapper.find('#fiReason').length).toBeTruthy();

    // test that JurisdictionDetails are shown
    // set jurisdiction id ==> we use Formik coz React-Select is acting weird
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Onyx' } });

    expect(wrapper.find('JurisdictionDetails').props()).toEqual({
      planFormJurisdiction: { id: '1337', name: 'Onyx' },
    });

    wrapper.update();

    // change to IRS
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'IRS' } });
    wrapper.update();
    expect(wrapper.find('JurisdictionDetails').length).toEqual(0);

    // change to Dynamic-FI
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'Dynamic-FI' } });
    wrapper.update();
    expect(wrapper.find('JurisdictionDetails').length).toEqual(0);

    wrapper.unmount();
  });

  it('renders text correctly for New Plan in planning tool ', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <NewPlanForPlanning />
        </Router>
      </Provider>
    );

    expect(wrapper.find('PlanForm').props()).toEqual({
      ...defaultPlanFormProps,
      addPlan: expect.any(Function),
      allowMoreJurisdictions: false,
      cascadingSelect: false,
      formHandler: expect.any(Function),
      jurisdictionLabel: 'Country',
      redirectAfterAction: '/plans/planning',
    });

    expect(wrapper.find(HeaderBreadcrumb).text()).toMatchInlineSnapshot(
      `"HomeDraft plansCreate New Plan"`
    );

    // does not show Jurisdiction Details
    expect(wrapper.find('JurisdictionDetails').length).toEqual(0);

    wrapper.unmount();
  });

  it('New plan is added to store if API status is 200', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });

    const initialState = {};
    const mockedStore = mockStore(initialState);
    mockedStore.dispatch = jest.fn();

    const wrapper = mount(
      <Provider store={mockedStore}>
        <Router history={history}>
          <ConnectedBaseNewPlan />
        </Router>
      </Provider>
    );
    // Set FI for interventionType
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'FI' } });
    // set jurisdiction id ==> we use Formik coz React-Select is acting weird
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Onyx' } });
    // Set fiReason field value
    wrapper
      .find('select[name="fiReason"]')
      .simulate('change', { target: { name: 'fiReason', value: 'Routine' } });
    // Set fiStatus field value
    wrapper
      .find('select[name="fiStatus"]')
      .simulate('change', { target: { name: 'fiStatus', value: 'A2' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    // the expected payload
    const payload = generatePlanDefinition(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values
    );

    expect(mockedStore.dispatch).toHaveBeenLastCalledWith(addPlanDefinition(payload));
  });

  it('New plan is NOT added to store if API status is NOT 200', async () => {
    fetch.mockReject(() => Promise.reject('API is down'));

    const initialState = {};
    const mockedStore = mockStore(initialState);
    mockedStore.dispatch = jest.fn();

    const wrapper = mount(
      <Provider store={mockedStore}>
        <Router history={history}>
          <ConnectedBaseNewPlan />
        </Router>
      </Provider>
    );
    // Set FI for interventionType
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'FI' } });
    // set jurisdiction id ==> we use Formik coz React-Select is acting weird
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Onyx' } });
    // Set fiReason field value
    wrapper
      .find('select[name="fiReason"]')
      .simulate('change', { target: { name: 'fiReason', value: 'Routine' } });
    // Set fiStatus field value
    wrapper
      .find('select[name="fiStatus"]')
      .simulate('change', { target: { name: 'fiStatus', value: 'A2' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    expect(mockedStore.dispatch).not.toHaveBeenCalled();
  });

  it('New plan in planning tool is added to store if API status is 200', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });

    const initialState = {};
    const mockedStore = mockStore(initialState);
    mockedStore.dispatch = jest.fn();

    const wrapper = mount(
      <Provider store={mockedStore}>
        <Router history={history}>
          <NewPlanForPlanning />
        </Router>
      </Provider>
    );
    // Set FI for interventionType
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'IRS' } });
    // set jurisdiction id ==> we use Formik coz React-Select is acting weird
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Onyx' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    // the expected payload
    const payload = generatePlanDefinition(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values
    );

    expect(mockedStore.dispatch).toHaveBeenLastCalledWith(addPlanDefinition(payload));
  });

  it('New plan in planning tool is NOT added to store if API status is NOT 200', async () => {
    fetch.mockReject(() => Promise.reject('API is down'));

    const initialState = {};
    const mockedStore = mockStore(initialState);
    mockedStore.dispatch = jest.fn();

    const wrapper = mount(
      <Provider store={mockedStore}>
        <Router history={history}>
          <NewPlanForPlanning />
        </Router>
      </Provider>
    );
    // Set FI for interventionType
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'FI' } });
    // set jurisdiction id ==> we use Formik coz React-Select is acting weird
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Onyx' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    expect(mockedStore.dispatch).not.toHaveBeenCalled();
  });
});
