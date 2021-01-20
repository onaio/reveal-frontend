import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import { cloneDeep } from 'lodash';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Router } from 'react-router';
import { UpdatePlan } from '..';
import { DynamicFIPlan } from '../../../../../components/forms/PlanForm/tests/fixtures';
import { PlanDefinition } from '../../../../../configs/settings';
import { PLAN_UPDATE_URL } from '../../../../../constants';
import store from '../../../../../store';
import { removePlanDefinitions } from '../../../../../store/ducks/opensrp/PlanDefinition';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../configs/env');

const div = document.createElement('div');
document.body.appendChild(div);

const history = createBrowserHistory();

jest.mock('../PlanLocationNames', () => {
  const PlanLocationNamesMock = () => <div id="Helmuth"> No plan survives enemy contact. </div>;

  return PlanLocationNamesMock;
});

describe('components/InterventionPlan/UpdatePlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
    jest.clearAllMocks();
    store.dispatch(removePlanDefinitions());
  });

  it('checking taskGeneration status is correct for dynamic-fI plans when one is given', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));

    const plan = cloneDeep(DynamicFIPlan) as PlanDefinition;
    fetch.mockResponseOnce(JSON.stringify({}));
    const genericMock: any = jest.fn();

    const props = {
      history,
      location: genericMock,
      match: {
        isExact: true,
        params: { id: plan.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${plan.identifier}`,
      },
      plan,
    };
    const wrapper = mount(
      <Router history={history}>
        <UpdatePlan {...props} />
      </Router>,
      { attachTo: div }
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
      wrapper.update();
    });

    wrapper.find('form').simulate('submit');

    await act(async () => {
      await new Promise<any>(resolve => setImmediate(resolve));
      wrapper.update();
    });

    const createdPayload = fetch.mock.calls[1][1].body;
    const createdContext = JSON.parse(createdPayload).useContext;

    expect(createdContext).toEqual([
      { code: 'interventionType', valueCodableConcept: 'Dynamic-FI' },
      { code: 'fiStatus', valueCodableConcept: 'A1' },
      { code: 'fiReason', valueCodableConcept: 'Routine' },
      { code: 'taskGenerationStatus', valueCodableConcept: 'True' },
      { code: 'teamAssignmentStatus', valueCodableConcept: 'False' },
    ]);
  });

  it('checking taskGeneration status is correct for dynamic-fI plans where one is not defined', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const otherDiv = document.createElement('div');
    document.body.appendChild(otherDiv);

    const plan = cloneDeep(DynamicFIPlan) as PlanDefinition;
    plan.useContext = [
      { code: 'interventionType', valueCodableConcept: 'Dynamic-FI' },
      { code: 'fiStatus', valueCodableConcept: 'A1' },
      { code: 'fiReason', valueCodableConcept: 'Routine' },
    ];
    fetch.mockResponseOnce(JSON.stringify({}));
    const genericMock: any = jest.fn();

    const props = {
      history,
      location: genericMock,
      match: {
        isExact: true,
        params: { id: plan.identifier },
        path: `${PLAN_UPDATE_URL}/:id`,
        url: `${PLAN_UPDATE_URL}/${plan.identifier}`,
      },
      plan,
    };
    const wrapper = mount(
      <Router history={history}>
        <UpdatePlan {...props} />
      </Router>,
      { attachTo: otherDiv }
    );
    await act(async () => {
      await new Promise<unknown>(resolve => setImmediate(resolve));
      wrapper.update();
    });

    wrapper.find('form').simulate('submit');

    await act(async () => {
      await new Promise<any>(resolve => setImmediate(resolve));
      wrapper.update();
    });

    const createdPayload = fetch.mock.calls[1][1].body;
    const createdContext = JSON.parse(createdPayload).useContext;

    expect(createdContext).toEqual([
      { code: 'interventionType', valueCodableConcept: 'Dynamic-FI' },
      { code: 'fiStatus', valueCodableConcept: 'A1' },
      { code: 'fiReason', valueCodableConcept: 'Routine' },
    ]);
  });
});
