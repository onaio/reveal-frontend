import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import { act } from '@testing-library/react';
import { mount, ReactWrapper, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import { cloneDeep } from 'lodash';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import PlanForm, { defaultInitialValues, propsForUpdatingPlans } from '..';
import { AN_ERROR_OCCURRED } from '../../../../configs/lang';
import * as helperErrors from '../../../../helpers/errors';
import { OpenSRPAPIResponse } from '../../../../services/opensrp/tests/fixtures/session';
import store from '../../../../store';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { InterventionType, PlanStatus } from '../../../../store/ducks/plans';
import { generatePlanDefinition, getPlanFormValues, planActivitiesMap } from '../helpers';
import * as fixtures from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env');

fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);

/** place to mount the application/component to the JSDOM document during testing.
 * https://github.com/reactstrap/reactstrap/issues/773#issuecomment-373451256
 */
const div = document.createElement('div');
document.body.appendChild(div);

describe('containers/forms/PlanForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );
  });

  it('renders correctly', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );
    expect(toJson(wrapper.find('#interventionType select'))).toMatchSnapshot(
      'interventionType field'
    );
    expect(toJson(wrapper.find('#fiStatus select'))).toMatchSnapshot('fiStatus field');
    expect(toJson(wrapper.find('#fiReason select'))).toMatchSnapshot('fiReason field');
    // caseNum and opensrpEventId are not rendered by default
    expect(wrapper.find('#caseNum').length).toEqual(0);
    expect(wrapper.find('#opensrpEventId').length).toEqual(0);
    expect(toJson(wrapper.find({ for: 'title' }))).toMatchSnapshot('title label');
    expect(toJson(wrapper.find('#title input'))).toMatchSnapshot('title field');
    expect(wrapper.find({ for: 'name' }).length).toEqual(0);
    expect(toJson(wrapper.find('#name input'))).toMatchSnapshot('name field');
    expect(wrapper.find({ for: 'identifier' }).length).toEqual(0);
    expect(toJson(wrapper.find('#identifier input'))).toMatchSnapshot('identifier field');
    expect(wrapper.find({ for: 'version' }).length).toEqual(0);
    expect(toJson(wrapper.find('#version input'))).toMatchSnapshot('version field');
    expect(wrapper.find({ for: 'taskGenerationStatus' }).length).toEqual(0);
    expect(toJson(wrapper.find('#taskGenerationStatus input'))).toMatchSnapshot(
      'taskGenerationStatus field'
    );
    expect(toJson(wrapper.find({ for: 'status' }))).toMatchSnapshot('status label');
    expect(toJson(wrapper.find('#status select'))).toMatchSnapshot('status field');
    expect(toJson(wrapper.find({ for: 'start' }))).toMatchSnapshot('start label');
    expect(toJson(wrapper.find('#start input'))).toMatchSnapshot('start field');
    expect(toJson(wrapper.find({ for: 'end' }))).toMatchSnapshot('end label');
    expect(toJson(wrapper.find('#end input'))).toMatchSnapshot('end field');
    expect(wrapper.find({ for: 'date' }).length).toEqual(0);
    expect(toJson(wrapper.find('#date input'))).toMatchSnapshot('date field');
    expect(toJson(wrapper.find('#planform-submit-button button'))).toMatchSnapshot('submit button');
    expect(wrapper.find('#jurisdictions-select-container').length).toEqual(1);
    expect(wrapper.find('#jurisdictions-display-container').length).toEqual(0);

    // should not have triggers or conditions
    expect(wrapper.find('.triggers-fieldset').length).toEqual(0);
    expect(wrapper.find('.conditions-fieldset').length).toEqual(0);

    // if you set fiReason to case triggered then caseNum and opensrpEventId are now rendered
    wrapper
      .find('#fiReason select')
      .simulate('change', { target: { value: 'Case Triggered', name: 'fiReason' } });
    expect(toJson(wrapper.find({ for: 'caseNum' }))).toMatchSnapshot('caseNum label');
    expect(toJson(wrapper.find('#caseNum input'))).toMatchSnapshot('caseNum field');
    expect(wrapper.find({ for: 'opensrpEventId' }).length).toEqual(0);
    expect(toJson(wrapper.find('#opensrpEventId input'))).toMatchSnapshot('opensrpEventId field');

    // set it back
    wrapper
      .find('#fiReason select')
      .simulate('change', { target: { value: 'Routine', name: 'fiReason' } });
    expect(wrapper.find('#caseNum').length).toEqual(0);
    expect(wrapper.find('#opensrpEventId').length).toEqual(0);

    wrapper.unmount();
  });

  it('renders dynamic plans correctly', () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>,
      { attachTo: div }
    );
    wrapper
      .find('#interventionType select')
      .simulate('change', { target: { value: 'Dynamic-IRS', name: 'interventionType' } });

    expect(toJson(wrapper.find('.triggers-fieldset legend'))).toMatchSnapshot('triggers legends');
    expect(toJson(wrapper.find('.trigger-group label'))).toMatchSnapshot('triggers labels');
    expect(toJson(wrapper.find('.triggers-fieldset input'))).toMatchSnapshot('triggers inputs');
    expect(toJson(wrapper.find('.triggers-fieldset textarea'))).toMatchSnapshot(
      'triggers textareas'
    );

    expect(toJson(wrapper.find('.conditions-fieldset legend'))).toMatchSnapshot(
      'conditions legends'
    );
    expect(toJson(wrapper.find('.condition-group label'))).toMatchSnapshot('conditions labels');
    expect(toJson(wrapper.find('.conditions-fieldset input'))).toMatchSnapshot('conditions inputs');
    expect(toJson(wrapper.find('.conditions-fieldset textarea'))).toMatchSnapshot(
      'conditions textareas'
    );

    // Show FI Reason and FI status fields when Dynamic FI is selected
    wrapper
      .find('#interventionType select')
      .simulate('change', { target: { value: 'Dynamic-FI', name: 'interventionType' } });
    expect(wrapper.find('#fiStatus select').length).toBeTruthy();
    expect(wrapper.find('#fiReason select').length).toBeTruthy();
    // Show case number field when Case Triggered option is selected for Dynamic FI
    wrapper
      .find('#fiReason select')
      .simulate('change', { target: { value: 'Case Triggered', name: 'fiReason' } });
    expect(wrapper.find('#caseNum input').length).toBeTruthy();

    wrapper.unmount();
  });

  it('renders activity fields correctly', () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );

    function checkActivities(num: number, name: string = 'FI') {
      // FI activities by default
      for (let i = 0; i <= num; i++) {
        expect(toJson(wrapper.find({ for: `activities-${i}-actionTitle` }))).toMatchSnapshot(
          `${name} activities[${i}].actionTitle label`
        );
        expect(toJson(wrapper.find(`#activities-${i}-actionTitle input`))).toMatchSnapshot(
          `${name} activities[${i}].actionTitle field`
        );
        expect(wrapper.find({ for: `activities-${i}-actionCode` }).length).toEqual(0);
        expect(toJson(wrapper.find(`#activities-${i}-actionCode input`))).toMatchSnapshot(
          `${name} activities[${i}].actionCode field`
        );
        expect(wrapper.find({ for: `activities-${i}-actionIdentifier` }).length).toEqual(0);
        expect(toJson(wrapper.find(`#activities-${i}-actionIdentifier input`))).toMatchSnapshot(
          `${name} activities[${i}].actionIdentifier field`
        );
        expect(toJson(wrapper.find({ for: `activities-${i}-actionDescription` }))).toMatchSnapshot(
          `${name} activities[${i}].actionDescription label`
        );
        expect(toJson(wrapper.find(`#activities-${i}-actionDescription textarea`))).toMatchSnapshot(
          `${name} activities[${i}].actionDescription field`
        );
        expect(wrapper.find({ for: `activities-${i}-goalDescription` }).length).toEqual(0);
        expect(toJson(wrapper.find(`#activities-${i}-goalDescription input`))).toMatchSnapshot(
          `${name} activities[${i}].goalDescription field`
        );
        expect(toJson(wrapper.find({ for: `activities-${i}-goalValue` }))).toMatchSnapshot(
          `${name} activities[${i}].goalValue label`
        );
        expect(toJson(wrapper.find(`#activities-${i}-goalValue input`))).toMatchSnapshot(
          `${name} activities[${i}].goalValue field`
        );
        expect(
          toJson(wrapper.find(`#activities-${i}-goalValue-input-group InputGroupText span`))
        ).toMatchSnapshot(`${name} activities[${i}].goalValue unit`);
        expect(toJson(wrapper.find({ for: `activities-${i}-timingPeriodStart` }))).toMatchSnapshot(
          `${name} activities[${i}].timingPeriodStart label`
        );
        expect(toJson(wrapper.find(`#activities-${i}-timingPeriodStart input`))).toMatchSnapshot(
          `${name} activities[${i}].timingPeriodStart field`
        );
        expect(toJson(wrapper.find({ for: `activities-${i}-timingPeriodEnd` }))).toMatchSnapshot(
          `${name} activities[${i}].timingPeriodEnd label`
        );
        expect(toJson(wrapper.find(`#activities-${i}-timingPeriodEnd input`))).toMatchSnapshot(
          `${name} activities[${i}].timingPeriodEnd field`
        );
        expect(wrapper.find({ for: `activities-${i}-goalDue` }).length).toEqual(0);
        expect(toJson(wrapper.find(`#activities-${i}-goalDue input`))).toMatchSnapshot(
          `${name} activities[${i}].goalDue field`
        );
        expect(toJson(wrapper.find({ for: `activities-${i}-actionReason` }))).toMatchSnapshot(
          `${name} activities[${i}].actionReason label`
        );
        expect(toJson(wrapper.find(`#activities-${i}-actionReason select`))).toMatchSnapshot(
          `${name} activities[${i}].actionReason field`
        );
        expect(toJson(wrapper.find({ for: `activities-${i}-goalPriority` }))).toMatchSnapshot(
          `${name} activities[${i}].goalPriority label`
        );
        expect(toJson(wrapper.find(`#activities-${i}-goalPriority select`))).toMatchSnapshot(
          `${name} activities[${i}].goalPriority field`
        );
      }
    }

    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);

    // activities are 6 and of type FI by default
    checkActivities(6, 'FI');
    // ensure there are only 6 options so far
    expect(wrapper.find(`#activities-7-actionTitle input`).length).toEqual(0);

    // should get IRS activities if interventionType is IRS
    wrapper
      .find('#interventionType select')
      .simulate('change', { target: { value: 'IRS', name: 'interventionType' } });
    checkActivities(0, 'IRS');

    // ensure there is only one options right now
    expect(wrapper.find(`#activities-1-actionTitle input`).length).toEqual(0);

    // set it back
    wrapper
      .find('#interventionType select')
      .simulate('change', { target: { value: 'FI', name: 'interventionType' } });
    for (let i = 0; i <= 6; i++) {
      expect(wrapper.find(`#activities-${i}-actionTitle input`).length).toEqual(1);
    }
    // ensure there are only 6 options so far
    expect(wrapper.find(`#activities-7-actionTitle input`).length).toEqual(0);

    wrapper.unmount();
  });

  it('renders jurisdictions fields correctly', () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>,
      { attachTo: div }
    );

    function checkJurisdtictions(num: number) {
      // FI activities by default
      for (let i = 0; i <= num; i++) {
        expect(toJson(wrapper.find({ for: `jurisdictions-${i}-id` }))).toMatchSnapshot(
          `jurisdictions[${i}].id label`
        );
        expect(toJson(wrapper.find(`#jurisdictions-${i}-id input`))).toMatchSnapshot(
          `jurisdictions[${i}].id field`
        );
        expect(wrapper.find({ for: `jurisdictions-${i}-name` }).length).toEqual(0);
        expect(toJson(wrapper.find(`#jurisdictions-${i}-name input`))).toMatchSnapshot(
          `jurisdictions[${i}].name field`
        );
      }
    }

    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);

    checkJurisdtictions(0);
    // ensure there is only one options so far
    expect(wrapper.find(`#jurisdictions-1-id input`).length).toEqual(0);
    // there is no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);
    // there is no button to add more jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(0);

    // change interventionType to IRS
    wrapper
      .find('#interventionType select')
      .simulate('change', { target: { value: 'IRS', name: 'interventionType' } });

    // there is now a button to add jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(1);
    expect(toJson(wrapper.find('.addJurisdiction'))).toMatchSnapshot('addJurisdiction button');
    // there is still no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);

    // there is no button to remove activities
    expect(wrapper.find(`.removeActivity`).length).toEqual(0);
    // there is no modal to add more activities
    expect(wrapper.find(`.add-more-activities`).length).toEqual(0);

    // add one jurisdiction
    wrapper.find(`.addJurisdiction`).simulate('click');
    // there are now two buttons to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(2);

    // change interventionType to Dynamic-IRS
    wrapper.find('#interventionType select').simulate('change', {
      target: { value: InterventionType.DynamicIRS, name: 'interventionType' },
    });

    // there is now a button to add jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(1);
    expect(toJson(wrapper.find('.addJurisdiction'))).toMatchSnapshot(
      'Dynamic-irs addJurisdiction button'
    );
    // there is still no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);

    // there is no button to remove activities
    expect(wrapper.find(`.removeActivity`).length).toEqual(0);
    // there is no modal to add more activities
    expect(wrapper.find(`.add-more-activities`).length).toEqual(0);

    // add one jurisdiction
    wrapper.find(`.addJurisdiction`).simulate('click');
    // there are now two buttons to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(2);
    expect(toJson(wrapper.find('.removeJurisdiction'))).toMatchSnapshot(
      'Dynamic-irs removeJurisdiction buttons'
    );

    // change interventionType to Dynamic-MDA
    wrapper.find('#interventionType select').simulate('change', {
      target: { value: InterventionType.DynamicMDA, name: 'interventionType' },
    });

    // there is now a button to add jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(1);
    expect(toJson(wrapper.find('.addJurisdiction'))).toMatchSnapshot(
      'Dynamic-MDA addJurisdiction button'
    );
    // there is still no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);

    // add one jurisdiction
    wrapper.find(`.addJurisdiction`).simulate('click');
    // there are now two buttons to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(2);
    expect(toJson(wrapper.find('.removeJurisdiction'))).toMatchSnapshot(
      'Dynamic-MDA removeJurisdiction buttons'
    );

    // remove one jurisdiction
    wrapper
      .find(`.removeJurisdiction`)
      .first()
      .simulate('click');
    // there is now no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);

    // change interventionType to FI
    wrapper
      .find('#interventionType select')
      .simulate('change', { target: { value: 'FI', name: 'interventionType' } });

    // there is no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);
    // there is no button to add more jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(0);

    // there are now 7 buttons to remove activities
    expect(wrapper.find(`.removeActivity`).length).toEqual(7);
    // there is no modal to add more activities
    expect(wrapper.find(`.add-more-activities`).length).toEqual(0);

    // remove one jurisdiction
    wrapper
      .find(`.removeActivity`)
      .first()
      .simulate('click');
    // there are now 6 buttons to remove activities
    expect(wrapper.find(`.removeActivity`).length).toEqual(6);
    // there is now a modal to add more activities
    expect(wrapper.find(`Button .add-more-activities`).length).toEqual(1);

    wrapper.unmount();
  });
});

describe('containers/forms/PlanForm - Edit', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const picture = (wrapper: ReactWrapper, message: string) => {
    expect(toJson(wrapper.find('#interventionType select'))).toMatchSnapshot(
      `${message} : interventionType field`
    );
    expect(toJson(wrapper.find('#fiStatus select'))).toMatchSnapshot(`${message} fiStatus field`);
    expect(toJson(wrapper.find('#fiReason select'))).toMatchSnapshot(`${message} fiReason field`);
    // caseNum and opensrpEventId are not present in this plan object
    expect(wrapper.find('#caseNum').length).toEqual(0);
    expect(wrapper.find('#opensrpEventId').length).toEqual(0);
    expect(toJson(wrapper.find('#title input'))).toMatchSnapshot(`${message} title field`);
    expect(toJson(wrapper.find('#name input'))).toMatchSnapshot(`${message} name field`);
    expect(toJson(wrapper.find('#identifier input'))).toMatchSnapshot(
      `${message} identifier field`
    );
    expect(toJson(wrapper.find('#version input'))).toMatchSnapshot(`${message} version field`);
    expect(toJson(wrapper.find('#taskGenerationStatus input'))).toMatchSnapshot(
      `${message} taskGenerationStatus field`
    );
    expect(toJson(wrapper.find('#status select'))).toMatchSnapshot(`${message} status field`);
    expect(toJson(wrapper.find('#start input'))).toMatchSnapshot(`${message} start field`);
    expect(toJson(wrapper.find('#end input'))).toMatchSnapshot(`${message} end field`);
    expect(toJson(wrapper.find('#date input'))).toMatchSnapshot(`${message} date field`);
    expect(wrapper.find('#jurisdictions-select-container').length).toEqual(0);
    expect(wrapper.find('#jurisdictions-display-container').length).toEqual(1);

    // there are no buttons to remove activities
    expect(wrapper.find(`.removeActivity`).length).toEqual(0);
    // there is no modal to add more activities
    expect(wrapper.find(`.add-more-activities`).length).toEqual(0);
  };

  it('ACTIVE renders all fields correctly in edit mode', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const props = {
      ...propsForUpdatingPlans(plans[0].status),
      initialValues: getPlanFormValues(plans[0]),
    };
    const wrapper = mount(<PlanForm {...props} />);
    picture(wrapper, 'Active Plan');
  });

  it('DRAFT renders all fields correctly in edit mode', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const plan = cloneDeep(plans[0]);
    plan.status = PlanStatus.DRAFT;
    const props = {
      ...propsForUpdatingPlans(plan.status),
      initialValues: getPlanFormValues(plan),
    };
    const wrapper = mount(<PlanForm {...props} />);
    picture(wrapper, 'DRAFT Plan');
  });

  it('COMPLETE renders all fields correctly in edit mode', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const plan = cloneDeep(plans[0]);
    plan.status = PlanStatus.COMPLETE;
    const props = {
      ...propsForUpdatingPlans(plan.status),
      initialValues: getPlanFormValues(plan),
    };
    const wrapper = mount(<PlanForm {...props} />);
    picture(wrapper, 'COMPLETE Plan');
  });

  it('renders conditional fields correctly in edit mode', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const props = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[2]),
    };
    const wrapper = mount(<PlanForm {...props} />);

    expect(toJson(wrapper.find('#caseNum input'))).toMatchSnapshot(
      'caseNum field present in editMode'
    );
    expect(toJson(wrapper.find('#opensrpEventId input'))).toMatchSnapshot(
      'opensrpEventId field present in editMode'
    );
    expect(toJson(wrapper.find('#taskGenerationStatus input'))).toMatchSnapshot(
      'taskGenerationStatus field present in editMode'
    );
  });

  it('Uses Custom component for rendering locationNames', () => {
    const MockComponent = () => (
      <div id="mock-component"> This Component renders jurisdictions</div>
    );
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const props = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[1]),
      renderLocationNames: () => <MockComponent />,
    };

    const wrapper = mount(<PlanForm {...props} />);

    expect(toJson(wrapper.find('#mock-component'))).toMatchSnapshot('Render Location Names');

    // there is no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);
    // there is no button to add more jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(0);

    wrapper.unmount();
  });

  it('renders activity fields correctly', () => {
    const props = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[1]),
    };

    const wrapper = mount(<PlanForm {...props} />);

    function checkActivities(num: number) {
      // FI activities by default
      for (let i = 0; i <= num; i++) {
        expect(toJson(wrapper.find(`#activities-${i}-actionTitle input`))).toMatchSnapshot(
          `activities[${i}].actionTitle field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-actionCode input`))).toMatchSnapshot(
          `activities[${i}].actionCode field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-actionIdentifier input`))).toMatchSnapshot(
          `activities[${i}].actionIdentifier field`
        );

        expect(toJson(wrapper.find(`#activities-${i}-actionDescription textarea`))).toMatchSnapshot(
          `activities[${i}].actionDescription field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-goalDescription input`))).toMatchSnapshot(
          `activities[${i}].goalDescription field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-goalValue input`))).toMatchSnapshot(
          `activities[${i}].goalValue field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-timingPeriodStart input`))).toMatchSnapshot(
          `activities[${i}].timingPeriodStart field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-timingPeriodEnd input`))).toMatchSnapshot(
          `activities[${i}].timingPeriodEnd field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-goalDue input`))).toMatchSnapshot(
          `activities[${i}].goalDue field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-actionReason select`))).toMatchSnapshot(
          `activities[${i}].actionReason field`
        );
        expect(toJson(wrapper.find(`#activities-${i}-goalPriority select`))).toMatchSnapshot(
          `activities[${i}].goalPriority field`
        );
      }
    }

    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);

    checkActivities(plans[1].action.length);

    wrapper.unmount();
  });
});

describe('containers/forms/PlanForm - Submission', () => {
  it('Form validation works', async () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // we now have some errors
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({
      jurisdictions: [
        {
          id: 'Required',
        },
      ],
      name: 'Name is Required',
      title: 'Required',
    });

    // name is required
    expect(wrapper.find('.non-field-errors p.name-error').text()).toEqual('Name is Required');
    // title is required
    expect(wrapper.find('small.title-error').text()).toEqual('Required');
    // jurisdiction is required
    expect(wrapper.find('small.jurisdictions-error').text()).toEqual('An Error Ocurred');

    // let us cause errors for other required fields and ascertain that they are indeed validated

    // Remove the date field value
    wrapper.find('input[name="date"]').simulate('change', { target: { name: 'date', value: '' } });
    // Remove the end field value
    wrapper.find('input[id="end"]').simulate('change', { target: { name: 'end', value: '' } });
    // Remove the interventionType field value
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: '' } });
    // Remove the start field value
    wrapper.find('input[id="start"]').simulate('change', { target: { name: 'start', value: '' } });
    // Remove the status field value
    wrapper
      .find('select[name="status"]')
      .simulate('change', { target: { name: 'status', value: '' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // date is required
    expect(wrapper.find('.non-field-errors p.date-error').text()).toEqual('Date is Required');
    // interventionType is required
    expect(wrapper.find('small.interventionType-error').text()).toEqual('Required');
    // status is required
    expect(wrapper.find('small.status-error').text()).toEqual('Required');
    // start is required
    expect(wrapper.find('small.start-error').text()).toEqual(
      'start must be a `date` type, but the final value was: `Invalid Date`.'
    );
    // end is required
    expect(wrapper.find('small.end-error').text()).toEqual(
      'end must be a `date` type, but the final value was: `Invalid Date`.'
    );

    // next we set wrong values for fields that expect specific values

    // Set wrong interventionType field value
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'oOv' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // interventionType should be as expected
    expect(wrapper.find('small.interventionType-error').text()).toEqual(
      'interventionType must be one of the following values: Dynamic-FI, Dynamic-IRS, Dynamic-MDA, FI, IRS, IRS-Lite, MDA, MDA-Lite, MDA-Point'
    );

    // Set FI for interventionType field value so that we can test the other fields
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'FI' } });

    // Set wrong fiStatus field value
    wrapper
      .find('select[name="fiStatus"]')
      .simulate('change', { target: { name: 'fiStatus', value: 'mosh' } });
    // Set wrong status field value
    wrapper
      .find('select[name="status"]')
      .simulate('change', { target: { name: 'status', value: 'Ona' } });

    wrapper.find('form').simulate('submit');

    await act(async () => {
      await new Promise<any>(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // there is no FIReason error due to default value
    expect(wrapper.find('small.fiReason-error').length).toEqual(0);

    // Set wrong fiReason field value
    wrapper
      .find('select[name="fiReason"]')
      .simulate('change', { target: { name: 'fiReason', value: 'justin' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // fiReason should be as expected
    expect(wrapper.find('small.fiReason-error').text()).toEqual(
      'fiReason must be one of the following values: Routine, Case Triggered'
    );
    // fiStatus should be as expected
    expect(wrapper.find('small.fiStatus-error').text()).toEqual(
      'fiStatus must be one of the following values: A1, A2, B1, B2'
    );
    // status should be as expected
    expect(wrapper.find('small.status-error').text()).toEqual(
      'status must be one of the following values: active, complete, draft, retired'
    );

    // now lets look at the entire error object once again
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({
      date: 'Date is Required',
      end: 'end must be a `date` type, but the final value was: `Invalid Date`.',
      fiReason: 'fiReason must be one of the following values: Routine, Case Triggered',
      fiStatus: 'fiStatus must be one of the following values: A1, A2, B1, B2',
      jurisdictions: [
        {
          id: 'Required',
        },
      ],
      start: 'start must be a `date` type, but the final value was: `Invalid Date`.',
      status: 'status must be one of the following values: active, complete, draft, retired',
    });
    // nice, eh?
  });

  it('Location and title fields does not fires errors all time', async () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );
    // no location error when other fields change
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'MDA-Point' } });
    wrapper.update();
    // fields don't have errors
    expect(wrapper.find('small.jurisdictions-error').length).toBeFalsy();
    expect(wrapper.find('input[name="title"]').hasClass('is-invalid')).toBeFalsy();
    // simulate touch on title field
    wrapper
      .find('input[name="title"]')
      .simulate('change', { target: { name: 'title', value: '' } });

    // error on submit when field not filled
    wrapper.find('form').simulate('submit');
    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();
    expect(wrapper.find('input[name="title"]').hasClass('is-invalid')).toBeTruthy();
    expect(wrapper.find('small.jurisdictions-error').text()).toEqual('An Error Ocurred');
  });

  it('Form validation works for activity fields', async () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );

    // no errors are initially present
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // lets mess with the activity fields :)

    // Remove all the values for the first activity
    wrapper
      .find('input[name="activities[0].actionCode"]')
      .simulate('change', { target: { name: 'activities[0].actionCode', value: '' } });
    wrapper
      .find('textarea[name="activities[0].actionDescription"]')
      .simulate('change', { target: { name: 'activities[0].actionDescription', value: '' } });
    wrapper
      .find('select[name="activities[0].actionReason"]')
      .simulate('change', { target: { name: 'activities[0].actionReason', value: '' } });
    wrapper
      .find('input[name="activities[0].actionTitle"]')
      .simulate('change', { target: { name: 'activities[0].actionTitle', value: '' } });
    wrapper
      .find('input[name="activities[0].goalDescription"]')
      .simulate('change', { target: { name: 'activities[0].goalDescription', value: '' } });
    wrapper
      .find('input[name="activities[0].goalDue"]')
      .simulate('change', { target: { name: 'activities[0].goalDue', value: '' } });
    wrapper
      .find('select[name="activities[0].goalPriority"]')
      .simulate('change', { target: { name: 'activities[0].goalPriority', value: '' } });
    wrapper
      .find('input[name="activities[0].goalValue"]')
      .simulate('change', { target: { name: 'activities[0].goalValue', value: '' } });
    wrapper
      .find('input[id="activities-0-timingPeriodEnd"]')
      .simulate('change', { target: { name: 'activities[0].timingPeriodEnd', value: '' } });
    wrapper
      .find('input[id="activities-0-timingPeriodStart"]')
      .simulate('change', { target: { name: 'activities[0].timingPeriodStart', value: '' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // activity errors display nicely, as expected
    expect(toJson(wrapper.find(`.activities-0-errors ul`))).toMatchSnapshot(`activities-0 errors`);

    // set wrong values for some fields

    // set wrong actionReason
    wrapper
      .find('select[name="activities[0].actionReason"]')
      .simulate('change', { target: { name: 'activities[0].actionReason', value: 'ILoveOov' } });
    // set wrong goalValue
    wrapper
      .find('input[name="activities[0].goalValue"]')
      .simulate('change', { target: { name: 'activities[0].goalValue', value: '0' } });

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // actionReason should be as expected
    expect(wrapper.find('li#actionReason-0-error').text()).toEqual(
      'actionReason: activities[0].actionReason must be one of the following values: Investigation, Routine'
    );
    // goalValue should be as expected
    expect(wrapper.find('li#goalValue-0-error').text()).toEqual(
      'goalValue: activities[0].goalValue must be greater than or equal to 1'
    );
  });

  it('Auto-setting name and title field values works', async () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );
    // Set IRS for interventionType
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'IRS' } });

    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values.name
    ).toEqual('IRS-2017-07-13');
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values.title
    ).toEqual('IRS 2017-07-13');

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

    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values.name
    ).toEqual('A2-Onyx-2017-07-13');
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values.title
    ).toEqual('A2 Onyx 2017-07-13');
  });

  it('Form submission for new plans works', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );

    // submit button is disabled
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toBeTruthy();

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

    // submit button should not be disabled
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toBeFalsy();

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

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

    // the last request should be the one that is sent to OpenSRP
    expect(fetch.mock.calls.pop()).toEqual([
      'https://test.smartregister.org/opensrp/rest/plans',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        body: JSON.stringify(payload),
        headers: {
          accept: 'application/json',
          authorization: 'Bearer hunter2',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'POST',
      },
    ]);
  });

  it('Form submission for updating plans works', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}));

    const props = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[1]),
    };
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    const payload = {
      ...generatePlanDefinition(getPlanFormValues(plans[1])),
      version: 2,
    };

    // the last request should be the one that is sent to OpenSRP
    expect(fetch.mock.calls.pop()).toEqual([
      'https://test.smartregister.org/opensrp/rest/plans',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        body: JSON.stringify(payload),
        headers: {
          accept: 'application/json',
          authorization: 'Bearer hunter2',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'PUT',
      },
    ]);
  });

  it('Form submission for dynamic plans works', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}));

    const props = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[5]),
    };
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...props} />
      </MemoryRouter>,
      { attachTo: div }
    );

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    const payload = {
      ...generatePlanDefinition(getPlanFormValues(plans[5])),
      version: 2,
    };

    // the last request should be the one that is sent to OpenSRP
    expect(fetch.mock.calls.pop()).toEqual([
      'https://test.smartregister.org/opensrp/rest/plans',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        body: JSON.stringify(payload),
        headers: {
          accept: 'application/json',
          authorization: 'Bearer hunter2',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'PUT',
      },
    ]);
  });

  it('renders correctly if initial FI reason is missing or invalid', () => {
    const [interventionType, fiStatus] = plans[0].useContext;
    const planMissingFIReason = {
      ...plans[0],
      useContext: [interventionType, fiStatus],
    };
    const propsMissingFiReason = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(planMissingFIReason),
    };
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...propsMissingFiReason} />
      </MemoryRouter>
    );
    expect(wrapper.find('Formik').prop('initialValues')).toEqual({
      ...propsMissingFiReason.initialValues,
      fiReason: 'Routine',
    });

    wrapper.unmount();
  });

  it('renders correctly if initial FI reason is invalid', () => {
    const [interventionType, fiStatus] = plans[0].useContext;
    const planInvalidFiReason = {
      ...plans[0],
      useContext: [
        interventionType,
        fiStatus,
        {
          code: 'fiReason',
          valueCodableConcept: 'InvalidFIReason',
        },
      ],
    };
    const propsInvalidFiReason = {
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(planInvalidFiReason),
    };
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...propsInvalidFiReason} />
      </MemoryRouter>
    );
    expect(wrapper.find('Formik').prop('initialValues')).toEqual({
      ...propsInvalidFiReason.initialValues,
      fiReason: 'Routine',
    });

    wrapper.unmount();
  });

  it('Updated plan is added to store if addPlan prop is available and call to api is 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}));

    const addPlanMock = jest.fn();

    const props = {
      addPlan: addPlanMock,
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[1]),
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...props} />
      </MemoryRouter>
    );

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    const payload = {
      ...generatePlanDefinition(getPlanFormValues(plans[1])),
      version: 2,
    };

    expect(addPlanMock).toHaveBeenCalledWith(payload);
  });

  it('Updated plan is not added to store if addPlan is available and status is not 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const displayErrorMock = jest.spyOn(helperErrors, 'displayError');
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockRejectOnce(() => Promise.reject('API is down'));

    const addPlanMock = jest.fn();

    const props = {
      addPlan: addPlanMock,
      ...propsForUpdatingPlans(),
      initialValues: getPlanFormValues(plans[1]),
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...props} />
      </MemoryRouter>
    );

    wrapper.find('form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    expect(addPlanMock.mock.calls.length).toEqual(0);
    expect(displayErrorMock).toHaveBeenCalledWith('API is down', AN_ERROR_OCCURRED, false);
  });

  it('before submit callback used correctly', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux

    const aDiv = document.createElement('div');
    document.body.appendChild(aDiv);

    const beforeSubmitSample = () => false;
    fetch.mockResponse(JSON.stringify({}));
    fetch.resetMocks();

    const initialValues = {
      ...getPlanFormValues(fixtures.DynamicFIPlan as any),
    };

    const props = {
      ...propsForUpdatingPlans(),
      beforeSubmit: beforeSubmitSample,
      initialValues,
    };

    const wrapper = mount(<PlanForm {...props} />, { attachTo: aDiv });

    wrapper.find('form').simulate('submit');

    await act(async () => {
      await new Promise<any>(resolve => setImmediate(resolve));
      wrapper.update();
    });
    // payload was not submitted
    expect(fetch).not.toHaveBeenCalled();
  });

  it('New plan is added to store if addPlan prop is available and status is 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });

    const addPlanMock = jest.fn();
    const props = {
      addPlan: addPlanMock,
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...props} />
      </MemoryRouter>
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

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

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

    expect(addPlanMock).toHaveBeenCalledWith(payload);
  });

  it('New plan is NOT added to store if addPlan prop is available and status is NOT 200', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const displayErrorMock = jest.spyOn(helperErrors, 'displayError');
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockReject(() => Promise.reject('API is down'));

    const addPlanMock = jest.fn();
    const props = {
      addPlan: addPlanMock,
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm {...props} />
      </MemoryRouter>
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

    expect(addPlanMock.mock.calls.length).toEqual(0);
    expect(displayErrorMock).toHaveBeenCalledWith('API is down', AN_ERROR_OCCURRED, false);

    // submit button is enabled after an error
    wrapper.update();
    expect(wrapper.find('#planform-submit-button button').prop('disabled')).toEqual(false);
    expect(wrapper.find('#planform-submit-button button').text()).toEqual('Save Plan');
  });
});

describe('containers/forms/PlanForm - Dynamic Form Activities', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
  });

  it('removing dynamic activities works correctly', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const defaults = {
      ...defaultInitialValues,
      activities: planActivitiesMap[InterventionType.DynamicFI],
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm initialValues={defaults} />
      </MemoryRouter>,
      { attachTo: container }
    );

    // change interventionType to Dynamic-FI
    await act(async () => {
      wrapper
        .find('#interventionType select')
        .simulate('change', { target: { value: 'Dynamic-FI', name: 'interventionType' } });
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    // there are initially 6 activities
    expect(wrapper.find(`.removeActivity`).length).toEqual(6);
    // lets get the form input values of the triggers
    const expectedTriggerInputValues = wrapper
      .find('.triggers-fieldset input')
      .map(e => e.props().value);
    const expectedTriggerTextValues = wrapper
      .find('.triggers-fieldset textarea')
      .map(e => e.props().value);
    const expectedConditionInputValues = wrapper
      .find('.conditions-fieldset input')
      .map(e => e.props().value);
    const expectedConditionTextValues = wrapper
      .find('.conditions-fieldset textarea')
      .map(e => e.props().value);
    // the names of the input fields should be indexed from zero (0)
    expect(wrapper.find(`.triggers-fieldset input`).map(e => e.props().name)).toMatchSnapshot(
      'Original activity trigger text input names'
    );
    expect(wrapper.find(`.triggers-fieldset textarea`).map(e => e.props().name)).toMatchSnapshot(
      'Original activity trigger text textarea names'
    );
    expect(wrapper.find(`.conditions-fieldset textarea`).map(e => e.props().name)).toMatchSnapshot(
      'Original activity conditions text textarea names'
    );
    expect(wrapper.find(`.conditions-fieldset input`).map(e => e.props().name)).toMatchSnapshot(
      'Original activity conditions text input names'
    );
    // lets remove one activity
    await act(async () => {
      wrapper
        .find(`.removeActivity`)
        .first()
        .simulate('click');
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    // 1 less activity
    expect(wrapper.find(`.removeActivity`).length).toEqual(5);
    // the slice values are determined by the type of activity that was removed
    // the meaning is that we should be left with ALL the triggers excluding the ones removed
    expect(wrapper.find(`.triggers-fieldset input`).map(e => e.props().value)).toEqual(
      expectedTriggerInputValues.slice(2)
    );
    expect(wrapper.find(`.triggers-fieldset textarea`).map(e => e.props().value)).toEqual(
      expectedTriggerTextValues.slice(2)
    );
    expect(wrapper.find(`.conditions-fieldset textarea`).map(e => e.props().value)).toEqual(
      expectedConditionTextValues.slice(5)
    );
    // this one does not change because currently there are no conditions with an input field
    expect(wrapper.find(`.conditions-fieldset input`).map(e => e.props().value)).toEqual(
      expectedConditionInputValues
    );
    // the names of the input fields should STILL be indexed from zero (0)
    expect(wrapper.find(`.triggers-fieldset input`).map(e => e.props().name)).toMatchSnapshot(
      'Changed activity trigger text input names'
    );
    expect(wrapper.find(`.triggers-fieldset textarea`).map(e => e.props().name)).toMatchSnapshot(
      'Changed activity trigger text textarea names'
    );
    expect(wrapper.find(`.conditions-fieldset textarea`).map(e => e.props().name)).toMatchSnapshot(
      'Changed activity conditions text textarea names'
    );
    expect(wrapper.find(`.conditions-fieldset input`).map(e => e.props().name)).toMatchSnapshot(
      'Changed activity conditions text input names'
    );
    // there should now be one button to add activities
    expect(wrapper.find(`button.add-more-activities`).length).toEqual(1);
    // lets bring up the modal that allows us to add activities
    await act(async () => {
      wrapper
        .find(`button.add-more-activities`)
        .first()
        .simulate('click');
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    // there should be one activity that can be added back
    expect(wrapper.find(`button.addActivity`).length).toEqual(1);
    // lets click the button in the modal and add back the activity we had removed
    await act(async () => {
      wrapper
        .find(`button.addActivity`)
        .first()
        .simulate('click');
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    // we should have 6 activities again
    expect(wrapper.find(`.removeActivity`).length).toEqual(6);
    // and now we come full circle.  The inputs should be what we had on initial load,
    // with those of the first activity moved to the end of the arrays
    expect(wrapper.find(`.triggers-fieldset input`).map(e => e.props().value)).toEqual(
      expectedTriggerInputValues.slice(2).concat(expectedTriggerInputValues.slice(0, 2))
    );
    expect(wrapper.find(`.triggers-fieldset textarea`).map(e => e.props().value)).toEqual(
      expectedTriggerTextValues.slice(2).concat(expectedTriggerTextValues.slice(0, 2))
    );
    expect(wrapper.find(`.conditions-fieldset textarea`).map(e => e.props().value)).toEqual(
      expectedConditionTextValues.slice(5).concat(expectedConditionTextValues.slice(0, 5))
    );
    expect(wrapper.find(`.conditions-fieldset input`).map(e => e.props().value)).toEqual(
      expectedConditionInputValues
    );
    // the names of the input fields should STILL STILL! be indexed from zero (0)
    expect(wrapper.find(`.triggers-fieldset input`).map(e => e.props().name)).toMatchSnapshot(
      'Final activity trigger text input names'
    );
    expect(wrapper.find(`.triggers-fieldset textarea`).map(e => e.props().name)).toMatchSnapshot(
      'Final activity trigger text textarea names'
    );
    expect(wrapper.find(`.conditions-fieldset textarea`).map(e => e.props().name)).toMatchSnapshot(
      'Final activity conditions text textarea names'
    );
    expect(wrapper.find(`.conditions-fieldset input`).map(e => e.props().name)).toMatchSnapshot(
      'Final activity conditions text input names'
    );
    // there should not be any button to add activities
    expect(wrapper.find(`button.add-more-activities`).length).toEqual(0);
    wrapper.unmount();
  });

  it('Plan title is set correctly for dynamic FI plans', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const defaults = {
      ...defaultInitialValues,
      activities: planActivitiesMap[InterventionType.DynamicFI],
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm initialValues={defaults} />
      </MemoryRouter>,
      { attachTo: container }
    );

    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'Dynamic-FI' } });
    // set jurisdiction id
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Nevada' } });
    // Set fiReason field value
    wrapper
      .find('select[name="fiReason"]')
      .simulate('change', { target: { name: 'fiReason', value: 'Routine' } });
    // Set fiStatus field value
    wrapper
      .find('select[name="fiStatus"]')
      .simulate('change', { target: { name: 'fiStatus', value: 'B2' } });

    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values.name
    ).toEqual('B2-Nevada-2017-07-13');
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.values.title
    ).toEqual('B2 Nevada 2017-07-13');
  });

  it('triggers and conditions are set correctly for dynamic FI plans', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const defaults = {
      ...defaultInitialValues,
      activities: planActivitiesMap[InterventionType.DynamicFI],
    };

    const wrapper = mount(
      <MemoryRouter>
        <PlanForm initialValues={defaults} />
      </MemoryRouter>,
      { attachTo: container }
    );

    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'Dynamic-FI' } });

    wrapper.update();

    // dynamic fi conditions
    const conditions = wrapper.find('.conditions-fieldset');
    expect(conditions.length).toEqual(6);
    expect(conditions.at(0).text()).toMatchInlineSnapshot(
      `"ConditionsExpression$this.is(FHIR.QuestionnaireResponse) or (($this.type.where(id='locationType').exists().not() or $this.type.where(id='locationType').text = 'Residential Structure') and $this.contained.exists().not())DescriptionStructure is residential or type does not existFamilyExpression$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Residential Structure')DescriptionApply to residential structures in Register_Structure questionnaires"`
    );
    expect(conditions.at(1).text()).toMatchInlineSnapshot(
      `"ConditionsExpression($this.is(FHIR.Patient) and $this.birthDate <= today() - 5 'years') or ($this.contained.where(Patient.birthDate <= today() - 5 'years').exists())DescriptionPerson is older than 5 years or person associated with questionnaire response if older than 5 years"`
    );
    expect(conditions.at(2).text()).toMatchInlineSnapshot(
      `"ConditionsExpression$this.is(FHIR.QuestionnaireResponse) or (($this.type.where(id='locationType').exists().not() or $this.type.where(id='locationType').text = 'Residential Structure') and $this.contained.exists())DescriptionStructure is residential or type does not existFamily"`
    );
    expect(conditions.at(3).text()).toMatchInlineSnapshot(
      `"ConditionsExpression$this.is(FHIR.QuestionnaireResponse) or $this.type.where(id='locationType').text = 'Larval Breeding Site'DescriptionStructure is a larval breeding siteExpression$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Larval Breeding Site')DescriptionApply to larval breeding sites in Register_Structure questionnaires"`
    );
    expect(conditions.at(4).text()).toMatchInlineSnapshot(
      `"ConditionsExpression$this.is(FHIR.QuestionnaireResponse) or $this.type.where(id='locationType').text = 'Mosquito Collection Point'DescriptionStructure is a mosquito collection pointExpression$this.is(FHIR.Location) or (questionnaire = 'Register_Structure' and $this.item.where(linkId='structureType').answer.value ='Mosquito Collection Point')DescriptionApply to mosquito collection point in Register_Structure questionnaires"`
    );
    expect(conditions.at(5).text()).toMatchInlineSnapshot(
      `"ConditionsExpressionLocation.physicalType.text = 'jdn'DescriptionJurisdiction type location"`
    );

    // dynamic fi trigers
    const trigers = wrapper.find('.triggers-fieldset');
    expect(trigers.length).toEqual(6);
    expect(trigers.at(0).text()).toMatchInlineSnapshot(
      `"TriggersNameNameExpressionquestionnaire = 'Register_Structure' or questionnaire = 'Archive_Family'DescriptionTrigger when a Register_Structure event is submitted"`
    );
    expect(trigers.at(1).text()).toMatchInlineSnapshot(
      `"TriggersNameNameExpressionquestionnaire = 'Family_Member_Registration'DescriptionTrigger when a Family Member Registration event is submitted"`
    );
    expect(trigers.at(2).text()).toMatchInlineSnapshot(
      `"TriggersNameNameExpressionquestionnaire = 'Family_Registration'DescriptionTrigger when a Family Registration event is submitted"`
    );
    expect(trigers.at(3).text()).toMatchInlineSnapshot(
      `"TriggersNameNameExpressionquestionnaire = 'Register_Structure'DescriptionTrigger when a Register_Structure event is submitted"`
    );
    expect(trigers.at(4).text()).toMatchInlineSnapshot(
      `"TriggersNameNameExpressionquestionnaire = 'Register_Structure'DescriptionTrigger when a Register_Structure event is submitted"`
    );
    expect(trigers.at(5).text()).toMatchInlineSnapshot(`"TriggersName"`);
  });

  it('works with MDA-lite plan', async () => {
    const wrapper = mount(
      <MemoryRouter>
        <PlanForm />
      </MemoryRouter>
    );
    wrapper.update();
    // select mda-lite plan
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'MDA-Lite' } });
    // set the first jurisdiction details
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[0].id', '1337');
    wrapper
      .find('input[name="jurisdictions[0].name"]')
      .simulate('change', { target: { name: 'jurisdictions[0].name', value: 'Onyx' } });
    wrapper.update();

    // has button for add jurisdiction but no remove focus area button
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(1);
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);
    // before clicking add button
    expect(wrapper.find('input[name="jurisdictions[1].name"]').length).toEqual(0);
    // click add button
    wrapper.find(`.addJurisdiction`).simulate('click');
    wrapper.update();
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(2); // each focus area has a remove button
    expect(wrapper.find('input[name="jurisdictions[1].name"]').length).toEqual(1); // possible to select another jurisdiction

    // set the second jurisdiction details
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions[1].id', '1234');
    wrapper
      .find('input[name="jurisdictions[1].name"]')
      .simulate('change', { target: { name: 'jurisdictions[1].name', value: 'Onyx two' } });
    wrapper.update();

    // add a third jurisdiction column
    expect(wrapper.find('input[name="jurisdictions[2].name"]').length).toEqual(0);
    // click add button
    wrapper.find(`.addJurisdiction`).simulate('click');
    wrapper.update();
    expect(wrapper.find('input[name="jurisdictions[2].name"]').length).toEqual(1);
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(3);
    // remove this jurisdiction
    wrapper
      .find(`.removeJurisdiction`)
      .at(2)
      .simulate('click');
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(2);
    expect(wrapper.find('input[name="jurisdictions[2].name"]').length).toEqual(0);

    // submit form
    await act(async () => {
      wrapper.find('form').simulate('submit');
    });
    wrapper.update();
    await new Promise<any>(resolve => setImmediate(resolve));

    // jurisdictions calls
    const jurisdictionCalls = [
      'https://test.smartregister.org/opensrp/rest/location/findByProperties?is_jurisdiction=true&return_geometry=false&properties_filter=status:Active,geographicLevel:0',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer hunter2',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ];
    expect(fetch.mock.calls[0]).toEqual(jurisdictionCalls);
    expect(fetch.mock.calls[1]).toEqual(jurisdictionCalls);
    expect(fetch.mock.calls[2]).toEqual(jurisdictionCalls);
    // check what is submited
    expect(fetch.mock.calls[3]).toEqual([
      'https://test.smartregister.org/opensrp/rest/plans',
      {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        // we have not changed anything on the plan template so incase the template is changed body should fail
        body: JSON.stringify(fixtures.MDALitePlanPayload),
        headers: {
          accept: 'application/json',
          authorization: 'Bearer hunter2',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'POST',
      },
    ]);
  });
});
