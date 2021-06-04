import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedUpdatePlan, { UpdatePlan } from '..';
import { PlanFormProps } from '../../../../../components/forms/PlanForm';
import {
  generatePlanDefinition,
  getPlanFormValues,
} from '../../../../../components/forms/PlanForm/helpers';
import {
  CaseTriggeredDynamicFIPlan,
  DynamicFIPlan,
  fiReasonTestPlan,
} from '../../../../../components/forms/PlanForm/tests/fixtures';
import { COULD_NOT_LOAD_PLAN } from '../../../../../configs/lang';
import { PlanDefinition } from '../../../../../configs/settings';
import { PLAN_UPDATE_URL } from '../../../../../constants';
import store from '../../../../../store';
import planDefinitionReducer, {
  reducerName as planDefinitionReducerName,
} from '../../../../../store/ducks/opensrp/PlanDefinition';
import { removePlanDefinitions } from '../../../../../store/ducks/opensrp/PlanDefinition';
import * as fixtures from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import {
  planDefinition1,
  planDefinition2,
  retirePlan1Payload,
  updatePlanFormProps,
} from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../../configs/env');

/** register the plan definitions reducer */
reducerRegistry.register(planDefinitionReducerName, planDefinitionReducer);

const history = createBrowserHistory();

jest.mock('../PlanLocationNames', () => {
  const PlanLocationNamesMock = () => <div id="Helmuth"> No plan survives enemy contact. </div>;

  return PlanLocationNamesMock;
});

const hiddenFields = [
  'interventionType',
  'fiReason',
  'activityActionTitle',
  'ainterventionType',
  'fiReason',
  'activityActionTitle',
  'activityActionReason',
  'activityTimingPeriodStart',
  'activityTimingPeriodEnd',
  'activityGoalPriority',
  'triggersAndConditionsctivityActionReason',
  'activityTimingPeriodStart',
  'activityTimingPeriodEnd',
  'activityGoalPriority',
  'triggersAndConditions',
];
describe('components/InterventionPlan/UpdatePlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
    jest.clearAllMocks();
    store.dispatch(removePlanDefinitions());
  });

  function getProps() {
    const mock: any = jest.fn();
    return {
      fetchPlan: mock,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: fixtures.plans[1].identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${fixtures.plans[1].identifier}`,
      },
      plan: fixtures.plans[1] as PlanDefinition,
    };
  }

  it('renders without crashing', () => {
    fetch.mockResponseOnce(JSON.stringify(fixtures.plans[1]));
    shallow(
      <Router history={history}>
        <UpdatePlan {...getProps()} />
      </Router>
    );
  });

  it('renders plan definition list correctly', () => {
    fetch.mockResponseOnce(JSON.stringify(fixtures.plans[1]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...getProps()} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper.find('Breadcrumb'))).toMatchSnapshot('Breadcrumb');
    expect(toJson(wrapper.find('h3.page-title'))).toMatchSnapshot('Page title');

    expect(wrapper.find('PlanForm').props()).toEqual({
      ...updatePlanFormProps,
      addPlan: expect.any(Function),
      beforeSubmit: expect.any(Function),
      renderLocationNames: expect.any(Function),
    });
    wrapper.unmount();
  });

  it('has the correct value of fiReason if plan is Reactive', () => {
    let plan = cloneDeep(fixtures.plans[0]);
    plan = {
      ...plan,
      useContext: [
        { code: 'interventionType', valueCodableConcept: 'FI' },
        { code: 'fiStatus', valueCodableConcept: 'A1' },
        { code: 'fiReason', valueCodableConcept: 'Case Triggered' },
        { code: 'taskGenerationStatus', valueCodableConcept: 'False' },
      ],
    };
    const props = { ...getProps(), plan };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...props} />
        </Router>
      </Provider>
    );
    // see what fiReason initialValue is passed.
    expect((wrapper.find('PlanForm').props() as PlanFormProps).initialValues.fiReason).toEqual(
      'Case Triggered'
    );
  });

  it('deduces the fiReason field value correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify(fiReasonTestPlan));
    const mock: any = jest.fn();
    const thisPlansId = fiReasonTestPlan.identifier;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: thisPlansId },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${thisPlansId}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // see what fiReason initialValue is passed. -> this means a plan without an Fi reason
    // will be set to routine
    expect((wrapper.find('PlanForm').props() as PlanFormProps).initialValues.fiReason).toEqual(
      'Routine'
    );
    expect(toJson(wrapper.find('#fiReason select'))).toMatchSnapshot('fiReason field');

    wrapper.unmount();
  });

  it('renders plan Location names component', () => {
    fetch.mockResponseOnce(JSON.stringify(fixtures.plans[1]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...getProps()} />
        </Router>
      </Provider>
    );
    expect(toJson(wrapper.find('#Helmuth'))).toMatchSnapshot('Renders PlanLocation Mock');
  });

  it('pass correct data to store: API responds with array', async () => {
    fetch.mockResponseOnce(JSON.stringify([fixtures.plans[1]]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...getProps()} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    const FetchPlanSpy = jest.spyOn(wrapper.props().children.props.children.props, 'fetchPlan');
    expect(FetchPlanSpy).toHaveBeenCalledWith(fixtures.plans[1]);
    wrapper.unmount();
  });

  it('pass correct data to store: API responds with object', async () => {
    // fetch with an object response
    fetch.mockResponseOnce(JSON.stringify(fixtures.plans[1]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...getProps()} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    const FetchPlanSpy = jest.spyOn(wrapper.props().children.props.children.props, 'fetchPlan');
    expect(FetchPlanSpy).toHaveBeenCalledWith(fixtures.plans[1]);
  });

  it('renders case details when plan is reactive', async () => {
    fetch.once(JSON.stringify(planDefinition1));
    const props = {
      history,
      location: jest.fn(),
      match: {
        isExact: true,
        params: { id: planDefinition1.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${planDefinition1.identifier}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );
    // resolve promise to get plan into UpdatePlan state.
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    wrapper.update();

    // planDefinition1 is reactive thus we expect CaseDetails is rendered
    const caseDetailsIsRendered = wrapper.find('CaseDetails').length > 0;
    expect(caseDetailsIsRendered).toBeTruthy();
    wrapper.unmount();
  });

  it('Does not render case details when plan isnt reactive', async () => {
    fetch.once(JSON.stringify(planDefinition2));
    const props = {
      history,
      location: jest.fn(),
      match: {
        isExact: true,
        params: { id: planDefinition2.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${planDefinition2.identifier}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );
    // resolve promise to get plan into UpdatePlan state.
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    wrapper.update();

    // planDefinition2 is not reactive thus we don't expect CaseDetails to be rendered
    const caseDetailsIsntRendered = wrapper.find('CaseDetails').length === 0;
    expect(caseDetailsIsntRendered).toBeTruthy();
    wrapper.unmount();
  });

  it('Updated plan is added to store if call to API is 200', async () => {
    const plan = fixtures.plans[1];
    fetch.mockResponseOnce(JSON.stringify(plan));

    const props = {
      history,
      location: jest.fn(),
      match: {
        isExact: true,
        params: { id: plan.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${plan.identifier}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    wrapper.update();

    /**@todo Simulate input change did not work. So the workaround was to clear the store of
     * plan definitions before submit. The best implementation is to simulate input change
     * and assert that the store gets updated with that change
     */
    store.dispatch(removePlanDefinitions());
    expect(store.getState().PlanDefinition).toEqual({
      planDefinitionsById: {},
    });

    expect(wrapper.find('Form').length).toMatchInlineSnapshot(`1`);
    await act(async () => {
      wrapper.find('Form').simulate('submit');
      await new Promise<any>(resolve => setImmediate(resolve));
    });
    wrapper.update();

    const payload = {
      ...generatePlanDefinition(getPlanFormValues(plan)),
      version: 2,
    };

    expect(store.getState().PlanDefinition).toEqual({
      planDefinitionsById: {
        [plan.identifier]: payload,
      },
    });
  });

  it('Updated plan is NOT added to store if call to API is NOT 200', async () => {
    const plan = fixtures.plans[1];
    fetch.once(JSON.stringify(plan));
    fetch.mockRejectOnce(() => Promise.reject('API is down'));

    const props = {
      history,
      location: jest.fn(),
      match: {
        isExact: true,
        params: { id: plan.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${plan.identifier}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
    });
    wrapper.update();

    /**@todo Simulate input change did not work. So the workaround was to clear the store of
     * plan definitions before submit. The best implementation is to simulate input change
     * and assert that the store gets updated with that change
     */
    store.dispatch(removePlanDefinitions());
    expect(store.getState().PlanDefinition).toEqual({
      planDefinitionsById: {},
    });

    await act(async () => {
      wrapper.find('Form').simulate('submit');
      await new Promise<any>(resolve => setImmediate(resolve));
    });
    wrapper.update();

    expect(store.getState().PlanDefinition).toEqual({
      planDefinitionsById: {},
    });
  });

  it('shows error when plan was not found', async () => {
    fetch.mockResponseOnce(JSON.stringify([]));
    const mock: any = jest.fn();
    const thisPlansId = fiReasonTestPlan.identifier;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: thisPlansId },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${thisPlansId}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/plans/311d4728-8e88-575d-8189-e88d9a4ae3b6',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer null',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ]);
    // shows error message
    expect(wrapper.text().includes(COULD_NOT_LOAD_PLAN)).toBeTruthy();
  });

  it('edit plans created with old templates', async () => {
    // create divs for condition and triggers toggles - should equal number of activities
    [0, 1, 2, 3, 4, 5].forEach(id => {
      const div = document.createElement('div');
      div.setAttribute('id', `plan-trigger-conditions-${id}`);
      document.body.appendChild(div);
    });

    // mock window confirmation dialogue and simulate true click
    const confirmSpy = jest.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(jest.fn(() => true));

    // create a mismatch of dynamicFI plan to edit and the default template plan
    const planCopy = { ...DynamicFIPlan };
    const newCondition = {
      expression: {
        description: 'Register structure event submitted for a residential structure',
        expression:
          "$this.is(FHIR.Location)  or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Residential Structure')",
      },
      kind: 'applicability',
    };
    planCopy.action[0].condition = [...planCopy.action[0].condition, newCondition];

    // store.dispatch(addPlanDefinition(planCopy as PlanDefinition));
    fetch.mockResponse(JSON.stringify(planCopy));

    const mock: any = jest.fn();
    const thisPlansId = planCopy.identifier;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: thisPlansId },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${thisPlansId}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    wrapper
      .find('select[name="status"]')
      .simulate('change', { target: { name: 'status', value: 'complete' } });

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    expect(confirmSpy).toBeCalledTimes(1);
    expect(confirmSpy).toBeCalledWith('You are about to complete a plan, click ok to proceed');

    expect(fetch.mock.calls[1][0]).toEqual('https://test.smartregister.org/opensrp/rest/plans');
    expect(fetch.mock.calls[1][1].method).toEqual('PUT');
  });

  it('Test retiring plans', async () => {
    fetch.mockResponseOnce(JSON.stringify([fixtures.plans[1]]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...getProps()} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    // retire modal not available
    expect(wrapper.find('.retire-plans-modal').length).toBeFalsy();
    // update status to retired
    wrapper
      .find('select[name="status"]')
      .simulate('change', { target: { name: 'status', value: 'retired' } });
    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    wrapper.update();

    // retire plan modal is active
    expect(wrapper.find('.retire-plans-modal').length).toBeTruthy();
    expect(wrapper.find('RetirePlanForm').length).toBeTruthy();

    // modal cancel button works
    wrapper.find('#retireform-cancel-button button').simulate('click');
    expect(wrapper.find('.retire-plans-modal').length).toBeFalsy();
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toBeFalsy();

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });
    wrapper.update();

    // retire plan modal is active again
    expect(wrapper.find('.retire-plans-modal').length).toBeTruthy();
    expect(wrapper.find('RetirePlanForm').length).toBeTruthy();
    // Select retire reason
    wrapper
      .find('select[name="retireReason"]')
      .simulate('change', { target: { name: 'retireReason', value: 'DUPLICATE' } });

    await act(async () => {
      wrapper.find('RetirePlanForm form').simulate('submit');
    });

    expect(fetch).toHaveBeenCalledTimes(3);
    // get the plan to be edited
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://test.smartregister.org/opensrp/rest/plans/8fa7eb32-99d7-4b49-8332-9ecedd6d51ae'
    );
    // post retire reasons
    expect(fetch.mock.calls[1]).toEqual([
      'https://test.smartregister.org/opensrp/rest/event',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        body: retirePlan1Payload,
        headers: {
          accept: 'application/json',
          authorization: 'Bearer null',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'POST',
      },
    ]);
    // update plans
    const payload = {
      ...generatePlanDefinition(getPlanFormValues(fixtures.plans[1])),
      name: 'IRS-2019-07-10',
      status: 'retired',
      version: 2,
    };
    expect(fetch.mock.calls[2]).toEqual([
      'https://test.smartregister.org/opensrp/rest/plans',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        body: JSON.stringify(payload),
        headers: {
          accept: 'application/json',
          authorization: 'Bearer null',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'PUT',
      },
    ]);
  });

  it('edit Dynamic FI plans with case confirmation action', async () => {
    // create divs for condition and triggers toggles
    CaseTriggeredDynamicFIPlan.action.forEach((_, id) => {
      const div = document.createElement('div');
      div.setAttribute('id', `plan-trigger-conditions-${id}`);
      document.body.appendChild(div);
    });

    fetch.mockResponse(JSON.stringify(CaseTriggeredDynamicFIPlan));

    const mock: any = jest.fn();
    const thisPlansId = CaseTriggeredDynamicFIPlan.identifier;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: thisPlansId },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${thisPlansId}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // submit button is disabled
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toBeTruthy();

    // activate the plan and save
    wrapper
      .find('select[name="status"]')
      .simulate('change', { target: { name: 'status', value: 'active' } });
    // submit button is disabled
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toBeFalsy();

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    // check the data submitted - should include case confirmation
    const submitedData: PlanDefinition = JSON.parse(fetch.mock.calls[3][1].body);
    const submitedActionCodes = submitedData.action.map(e => e.code);
    const submitedGoals = submitedData.goal.map(e => e.id);
    expect(submitedActionCodes).toEqual([
      'Case Confirmation',
      'RACD Register Family',
      'Blood Screening',
      'Bednet Distribution',
      'Larval Dipping',
      'Mosquito Collection',
      'BCC',
    ]);
    expect(submitedGoals).toEqual([
      'Case_Confirmation',
      'RACD_register_families',
      'RACD_Blood_Screening',
      'RACD_bednet_distribution',
      'Larval_Dipping',
      'Mosquito_Collection',
      'BCC_Focus',
    ]);
    expect(fetch.mock.calls[3][0]).toEqual('https://test.smartregister.org/opensrp/rest/plans');
    expect(fetch.mock.calls[3][1].method).toEqual('PUT');
    wrapper.unmount();
  });

  it('editing plans with doe not change name', async () => {
    const planCopy = {
      ...CaseTriggeredDynamicFIPlan,
      name: 'A2 ตะฝั่งสูง (6302010701) 2021-06-04',
    };
    // create divs for condition and triggers toggles
    planCopy.action.forEach((_, id) => {
      const div = document.createElement('div');
      div.setAttribute('id', `plan-trigger-conditions-${id}`);
      document.body.appendChild(div);
    });

    fetch.mockResponse(JSON.stringify(planCopy));

    const mock: any = jest.fn();
    const thisPlansId = planCopy.identifier;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: thisPlansId },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${thisPlansId}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedUpdatePlan {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // submit button is disabled
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toBeTruthy();

    // activate the plan and save
    wrapper
      .find('select[name="status"]')
      .simulate('change', { target: { name: 'status', value: 'active' } });
    // submit button is enabled
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toBeFalsy();

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    // check the data submitted - should include case confirmation
    const submitedData: PlanDefinition = JSON.parse(fetch.mock.calls[3][1].body);
    expect(submitedData.name).toEqual(planCopy.name);
    expect(submitedData.title).toEqual(planCopy.title);
    expect(submitedData.status).toEqual('active');
    wrapper.unmount();
  });

  it('hides expected columns', async () => {
    // create divs for condition and triggers - should equal number of activities
    [0, 1, 2, 3, 4, 5].forEach(id => {
      const div = document.createElement('div');
      div.setAttribute('id', `plan-trigger-conditions-${id}`);
      document.body.appendChild(div);
    });

    const envModule = require('../../../../../configs/env');
    envModule.HIDE_PLAN_FORM_FIELDS_ON_EDIT = hiddenFields;

    const DynamicFIPlanCopy = {
      ...DynamicFIPlan,
      status: 'draft',
    };

    const mock = jest.fn();
    const props = {
      fetchPlan: mock,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: DynamicFIPlanCopy.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${DynamicFIPlanCopy.identifier}`,
      },
      plan: DynamicFIPlanCopy as PlanDefinition,
    };
    fetch.mockResponseOnce(JSON.stringify([DynamicFIPlanCopy]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    // intervention type hidded
    expect(
      wrapper
        .find('select[name="interventionType"]')
        .closest('div')
        .prop('hidden')
    ).toBeTruthy();
    // Fi reason hidded
    expect(
      wrapper
        .find('select[name="fiReason"]')
        .closest('div')
        .prop('hidden')
    ).toBeTruthy();
    // hidden fields on activities
    DynamicFIPlanCopy.action.forEach((_, i) => {
      // actionReason hidded
      expect(
        wrapper
          .find(`select[name="activities[${i}].actionReason"]`)
          .closest('div')
          .prop('hidden')
      ).toBeTruthy();
      // actionTitle hidded
      expect(
        wrapper
          .find(`input[name="activities[${i}].actionTitle"]`)
          .closest('div')
          .prop('hidden')
      ).toBeTruthy();
      // goalPriority hidden
      expect(
        wrapper
          .find(`select[name="activities[${i}].goalPriority"]`)
          .closest('div')
          .prop('hidden')
      ).toBeTruthy();
      // timingPeriodStart hidded
      expect(
        wrapper
          .find({ for: `activities-${0}-timingPeriodStart` })
          .closest('div')
          .closest('div')
          .prop('hidden')
      ).toBeTruthy();
      // timingPeriodEnd hiden
      expect(
        wrapper
          .find({ for: `activities-${0}-timingPeriodEnd` })
          .closest('div')
          .closest('div')
          .prop('hidden')
      ).toBeTruthy();
      // triggers and conditions toggle buttons hidden
      expect(wrapper.find(`#plan-trigger-conditions-div-${i} button`).prop('hidden')).toBeTruthy();
    });
  });

  it('on case triggered activities can be added', async () => {
    const envModule = require('../../../../../configs/env');
    envModule.HIDE_PLAN_FORM_FIELDS_ON_EDIT = hiddenFields;
    envModule.CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES = true;
    // create divs for condition and triggers - should equal number of activities
    [0, 1, 2, 3, 4, 5].forEach(id => {
      const div = document.createElement('div');
      div.setAttribute('id', `plan-trigger-conditions-${id}`);
      document.body.appendChild(div);
    });

    //  change
    const useContext = DynamicFIPlan.useContext.map(context => {
      return context.code === 'fiReason'
        ? { ...context, valueCodableConcept: 'Case Triggered' }
        : context;
    });

    const DynamicFIPlanCopy = {
      ...DynamicFIPlan,
      status: 'draft',
      useContext,
    };
    const mock = jest.fn();
    const props = {
      fetchPlan: mock,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: DynamicFIPlanCopy.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${DynamicFIPlanCopy.identifier}`,
      },
      plan: DynamicFIPlanCopy as PlanDefinition,
    };
    fetch.mockResponseOnce(JSON.stringify([DynamicFIPlanCopy]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    // have buttons for removing activities
    expect(wrapper.find('.removeActivity').length).toEqual(DynamicFIPlanCopy.action.length);
    expect(wrapper.find('.add-more-activities').length).toEqual(0);
    // remove last activity
    wrapper
      .find('.removeActivity')
      .at(5)
      .simulate('click');
    expect(wrapper.find('.removeActivity').length).toEqual(DynamicFIPlanCopy.action.length - 1);
    expect(wrapper.find('Button .add-more-activities').length).toEqual(1);
    // add removed activity
    wrapper.find('Button .add-more-activities').simulate('click');
    expect(wrapper.find('.addActivity').length).toEqual(1);
    expect(wrapper.find('.addActivity').text()).toEqual('Add BCC Activity');
    wrapper.find('.addActivity').simulate('click');
    expect(wrapper.find('.removeActivity').length).toEqual(DynamicFIPlanCopy.action.length);
    expect(wrapper.find('.add-more-activities').length).toEqual(0);

    // default disabled activity (Action reason and goal priority) fields are not disabled
    DynamicFIPlanCopy.action.forEach((_, i) => {
      // actionReason not disabled
      expect(
        wrapper.find(`select[name="activities[${i}].actionReason"]`).prop('disabled')
      ).toBeFalsy();
      // goalPriority not diabled
      expect(
        wrapper.find(`select[name="activities[${i}].goalPriority"]`).prop('disabled')
      ).toBeFalsy();
    });
  });

  it('on case triggered activities adding activity should enable save button', async () => {
    const envModule = require('../../../../../configs/env');
    envModule.HIDE_PLAN_FORM_FIELDS_ON_EDIT = hiddenFields;
    envModule.CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES = true;
    // create divs for condition and triggers - should equal number of activities
    [0, 1, 2, 3, 4, 5].forEach(id => {
      const div = document.createElement('div');
      div.setAttribute('id', `plan-trigger-conditions-${id}`);
      document.body.appendChild(div);
    });

    //  change
    const useContext = DynamicFIPlan.useContext.map(context => {
      return context.code === 'fiReason'
        ? { ...context, valueCodableConcept: 'Case Triggered' }
        : context;
    });

    const DynamicFIPlanCopy = {
      ...DynamicFIPlan,
      action: [DynamicFIPlan.action[0]],
      goal: [DynamicFIPlan.goal[0]],
      status: 'draft',
      useContext,
    };
    const mock = jest.fn();
    const props = {
      fetchPlan: mock,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: DynamicFIPlanCopy.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${DynamicFIPlanCopy.identifier}`,
      },
      plan: DynamicFIPlanCopy as PlanDefinition,
    };
    fetch.mockResponseOnce(JSON.stringify([DynamicFIPlanCopy]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    // check submit button
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toEqual(true);

    // check buttons removing and adding activities
    expect(wrapper.find('.removeActivity').length).toEqual(0);
    expect(wrapper.find('Button .add-more-activities').length).toEqual(1);

    // add another activity
    wrapper.find('Button .add-more-activities').simulate('click');
    expect(wrapper.find('.addActivity').length).toEqual(5);
    expect(wrapper.find('.addActivity').map(activity => activity.text())).toEqual([
      'Add Blood Screening Activity',
      'Add Bednet Distribution Activity',
      'Add Larval Dipping Activity',
      'Add Mosquito Collection Activity',
      'Add BCC Activity',
    ]);
    wrapper
      .find('.addActivity')
      .at(0)
      .simulate('click');
    expect(wrapper.find('.removeActivity').length).toEqual(2);
    // check submit button - should not be disabled
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toEqual(false);
  });

  it('should pass correct array to hide fields for case triggered draft plans', async () => {
    const envModule = require('../../../../../configs/env');
    envModule.HIDE_PLAN_FORM_FIELDS_ON_EDIT = hiddenFields;
    envModule.CASE_TRIGGERED_DRAFT_EDIT_ADD_ACTIVITIES = true;
    // create divs for condition and triggers - should equal number of activities
    [0, 1, 2, 3, 4, 5].forEach(id => {
      const div = document.createElement('div');
      div.setAttribute('id', `plan-trigger-conditions-${id}`);
      document.body.appendChild(div);
    });

    //  change
    const useContext = DynamicFIPlan.useContext.map(context => {
      return context.code === 'fiReason'
        ? { ...context, valueCodableConcept: 'Case Triggered' }
        : context;
    });

    const DynamicFIPlanCopy = {
      ...DynamicFIPlan,
      status: 'draft',
      useContext,
    };
    const mock = jest.fn();
    const props = {
      fetchPlan: mock,
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: DynamicFIPlanCopy.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${DynamicFIPlanCopy.identifier}`,
      },
      plan: DynamicFIPlanCopy as PlanDefinition,
    };
    fetch.mockResponseOnce(JSON.stringify([DynamicFIPlanCopy]));
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <UpdatePlan {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    // have buttons for removing activities
    expect((wrapper.find('PlanForm').props() as PlanFormProps).addAndRemoveActivities).toBeTruthy();
    // have hidden fields data
    expect((wrapper.find('PlanForm').props() as PlanFormProps).hiddenFields).toEqual(hiddenFields);
    // check some fields if they are hidden
    // intervention type hidded
    expect(
      wrapper
        .find('select[name="interventionType"]')
        .closest('div')
        .prop('hidden')
    ).toBeTruthy();
    // Fi reason hidded
    expect(
      wrapper
        .find('select[name="fiReason"]')
        .closest('div')
        .prop('hidden')
    ).toBeTruthy();
  });
});
