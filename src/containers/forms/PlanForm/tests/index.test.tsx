import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import PlanForm, { propsForUpdatingPlans } from '..';
import { OpenSRPAPIResponse } from '../../../../services/opensrp/tests/fixtures/session';
import store from '../../../../store';
import { plans } from '../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { generatePlanDefinition, getPlanFormValues } from '../helpers';
import * as fixtures from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env');

describe('containers/forms/PlanForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<PlanForm />);
  });

  it('renders correctly', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const wrapper = mount(<PlanForm />);
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

  it('renders activity fields correctly', () => {
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
    const wrapper = mount(<PlanForm />);

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
    const wrapper = mount(<PlanForm />);

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
    expect(toJson(wrapper.find('.removeJurisdiction'))).toMatchSnapshot(
      'removeJurisdiction buttons'
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

  it('renders all fields correctly in edit mode', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const props = {
      ...propsForUpdatingPlans,
      initialValues: getPlanFormValues(plans[0]),
    };
    const wrapper = mount(<PlanForm {...props} />);
    expect(toJson(wrapper.find('#interventionType select'))).toMatchSnapshot(
      'interventionType field'
    );
    expect(toJson(wrapper.find('#fiStatus select'))).toMatchSnapshot('fiStatus field');
    expect(toJson(wrapper.find('#fiReason select'))).toMatchSnapshot('fiReason field');
    // caseNum and opensrpEventId are not present in this plan object
    expect(wrapper.find('#caseNum').length).toEqual(0);
    expect(wrapper.find('#opensrpEventId').length).toEqual(0);
    expect(toJson(wrapper.find('#title input'))).toMatchSnapshot('title field');
    expect(toJson(wrapper.find('#name input'))).toMatchSnapshot('name field');
    expect(toJson(wrapper.find('#identifier input'))).toMatchSnapshot('identifier field');
    expect(toJson(wrapper.find('#version input'))).toMatchSnapshot('version field');
    expect(toJson(wrapper.find('#taskGenerationStatus input'))).toMatchSnapshot(
      'taskGenerationStatus field'
    );
    expect(toJson(wrapper.find('#status select'))).toMatchSnapshot('status field');
    expect(toJson(wrapper.find('#start input'))).toMatchSnapshot('start field');
    expect(toJson(wrapper.find('#end input'))).toMatchSnapshot('end field');
    expect(toJson(wrapper.find('#date input'))).toMatchSnapshot('date field');
    expect(wrapper.find('#jurisdictions-select-container').length).toEqual(0);
    expect(wrapper.find('#jurisdictions-display-container').length).toEqual(1);

    // there are no buttons to remove activities
    expect(wrapper.find(`.removeActivity`).length).toEqual(0);
    // there is no modal to add more activities
    expect(wrapper.find(`.add-more-activities`).length).toEqual(0);
  });

  it('renders conditional fields correctly in edit mode', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const props = {
      ...propsForUpdatingPlans,
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

  it('renders jurisdictions fields correctly', () => {
    function checkJurisdtictions(num: number) {
      for (let i = 0; i <= num; i++) {
        expect(toJson(wrapper.find(`#jurisdictions-${i}-id input`))).toMatchSnapshot(
          `jurisdictions[${i}].id field`
        );
        expect(toJson(wrapper.find(`#jurisdictions-${i}-name input`))).toMatchSnapshot(
          `jurisdictions[${i}].name field`
        );
      }
    }

    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const props = {
      ...propsForUpdatingPlans,
      initialValues: getPlanFormValues(plans[1]),
    };
    const wrapper = mount(<PlanForm {...props} />);

    checkJurisdtictions(plans[1].jurisdiction.length);

    expect(toJson(wrapper.find('#selected-jurisdiction-list li span'))).toMatchSnapshot(
      'selected jurisdictions'
    );

    // there is no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);
    // there is no button to add more jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(0);

    wrapper.unmount();
  });

  it('renders activity fields correctly', () => {
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
    const props = {
      ...propsForUpdatingPlans,
      initialValues: getPlanFormValues(plans[1]),
    };
    const wrapper = mount(<PlanForm {...props} />);

    checkActivities(plans[1].action.length);

    wrapper.unmount();
  });
});

describe('containers/forms/PlanForm - Submission', () => {
  it('Form validation works', async () => {
    const wrapper = mount(<PlanForm />);

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    wrapper.find('form').simulate('submit');
    await new Promise(resolve => setImmediate(resolve));
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
    await new Promise(resolve => setImmediate(resolve));
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
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

    // interventionType should be as expected
    expect(wrapper.find('small.interventionType-error').text()).toEqual(
      'interventionType must be one of the following values: FI, IRS'
    );

    // Set FI for interventionType field value so that we can test the other fields
    wrapper
      .find('select[name="interventionType"]')
      .simulate('change', { target: { name: 'interventionType', value: 'FI' } });

    // Set wrong fiReason field value
    wrapper
      .find('select[name="fiReason"]')
      .simulate('change', { target: { name: 'fiReason', value: 'justin' } });
    // Set wrong fiStatus field value
    wrapper
      .find('select[name="fiStatus"]')
      .simulate('change', { target: { name: 'fiStatus', value: 'mosh' } });
    // Set wrong status field value
    wrapper
      .find('select[name="status"]')
      .simulate('change', { target: { name: 'status', value: 'Ona' } });

    wrapper.find('form').simulate('submit');
    await new Promise(resolve => setImmediate(resolve));
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

  it('Form validation works for activity fields', async () => {
    const wrapper = mount(<PlanForm />);

    // no errors are initially present
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});

    wrapper.find('form').simulate('submit');
    await new Promise(resolve => setImmediate(resolve));
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
    await new Promise(resolve => setImmediate(resolve));
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
    await new Promise(resolve => setImmediate(resolve));
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
    const wrapper = mount(<PlanForm />);
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
    await store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });

    const wrapper = mount(<PlanForm />);

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
    await new Promise(resolve => setImmediate(resolve));
    wrapper.update();

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
    await store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}));

    const props = {
      ...propsForUpdatingPlans,
      initialValues: getPlanFormValues(plans[1]),
    };
    const wrapper = mount(<PlanForm {...props} />);

    wrapper.find('form').simulate('submit');
    await new Promise(resolve => setImmediate(resolve));
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
});
