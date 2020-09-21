import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import PlanForm from '..';
import * as fixtures from './fixtures';

jest.mock('../../../../configs/env', () => ({
  DATE_FORMAT: 'yyyy-MM-dd',
  ENABLED_FI_REASONS: ['Routine'],
  LANGUAGE: 'th',
  PLAN_TYPES_ALLOWED_TO_CREATE: ['FI'],
  PLAN_TYPES_WITH_MULTI_JURISDICTIONS: ['IRS', 'MDA-Point', 'Dynamic-IRS', 'Dynamic-MDA'],
}));
/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env');

describe('Thailand: containers/forms/PlanForm', () => {
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
    // only FI type is displayed
    expect(wrapper.find('#interventionType select option').length).toEqual(1);

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

    wrapper
      .find('#fiReason select')
      .simulate('change', { target: { value: 'Routine', name: 'fiReason' } });
    expect(wrapper.find('#caseNum').length).toEqual(0);
    expect(wrapper.find('#opensrpEventId').length).toEqual(0);

    wrapper.unmount();
  });
});
