import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import ConnectedPlanForm, { ConnectedPlanFormProps } from '..';
import {
  defaultProps as defaultPlanFormProps,
  propsForUpdatingPlans,
} from '../../../../components/forms/PlanForm';
import {
  generatePlanDefinition,
  getPlanFormValues,
} from '../../../../components/forms/PlanForm/helpers';
import { OpenSRPAPIResponse } from '../../../../services/opensrp/tests/fixtures/session';
import { addPlanDefinition } from '../../../../store/ducks/opensrp/PlanDefinition';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env');

const middlewares: any = [];
const mockStore = configureMockStore(middlewares);
const initialState = {};
const store = mockStore(initialState);

describe('containers/forms/ConnectedPlanForm', () => {
  it('renders without crashing', () => {
    shallow(
      <Provider store={store}>
        <ConnectedPlanForm />
      </Provider>
    );
  });

  it('renders correctly', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlanForm />
      </Provider>
    );

    expect(wrapper.find('ConnectedPlanForm').props()).toEqual({
      ...defaultPlanFormProps,
      addPlan: expect.any(Function),
    });
    expect(wrapper.find('PlanForm').props()).toEqual({
      ...defaultPlanFormProps,
      addPlan: expect.any(Function),
    });
  });

  it('Updated plan is added to store if call to api is 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}));

    store.dispatch = jest.fn();

    const props = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[1]),
    };

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlanForm {...(props as ConnectedPlanFormProps)} />
      </Provider>
    );

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    const payload = {
      ...generatePlanDefinition(getPlanFormValues(plans[1])),
      version: 2,
    };

    expect(store.dispatch).toHaveBeenLastCalledWith(addPlanDefinition(payload));
  });

  it('Updated plan is not added to store, if call to API is NOT 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockRejectOnce(() => Promise.reject('API is down'));

    store.dispatch = jest.fn();

    const props = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[1]),
    };

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlanForm {...(props as ConnectedPlanFormProps)} />
      </Provider>
    );

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('New plan is added to store if API status is 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });

    store.dispatch = jest.fn();

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlanForm />
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

    expect(store.dispatch).toHaveBeenLastCalledWith(addPlanDefinition(payload));
  });

  it('New plan is NOT added to store if API status is NOT 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockReject(() => Promise.reject('APi is down'));

    store.dispatch = jest.fn();

    const wrapper = mount(
      <Provider store={store}>
        <ConnectedPlanForm />
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

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
