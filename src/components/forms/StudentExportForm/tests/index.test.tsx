import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import StudentExportForm from '..';
import { OpenSRPAPIResponse } from '../../../../services/opensrp/tests/fixtures/session';
import store from '../../../../store';
import * as fixtures from '../../PlanForm/tests/fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env');

describe('components/forms/StudentExportForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<StudentExportForm />);
  });

  it('renders correctly', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const wrapper = mount(<StudentExportForm />);

    expect(toJson(wrapper.find('Label'))).toMatchSnapshot('jurisdiction-select form label');
    expect(toJson(wrapper.find('#studentexportform-submit-button button'))).toMatchSnapshot(
      'submit button'
    );
    expect(wrapper.find('#jurisdictions-select-container')).toEqual({});
    expect(wrapper.find('#jurisdictions-display-container').length).toEqual(0);
    wrapper.unmount();
  });
  it('renders jurisdictions fields correctly', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const wrapper = mount(<StudentExportForm />);

    expect(toJson(wrapper.find({ for: `jurisdictions-1-id` }))).toMatchSnapshot(
      `jurisdictions.id label`
    );
    expect(toJson(wrapper.find(`#jurisdictions-1-id input`))).toMatchSnapshot(
      `jurisdictions.id field`
    );
    expect(wrapper.find({ for: `jurisdictions-1-name` }).length).toEqual(0);
    expect(toJson(wrapper.find(`#jurisdictions-name input`))).toMatchSnapshot(
      `jurisdictions.name field`
    );
    // ensure there is only one options so far
    expect(wrapper.find(`#jurisdictions-1-id input`).length).toEqual(0);
    // there is no button to remove jurisdictions
    expect(wrapper.find(`.removeJurisdiction`).length).toEqual(0);
    // there is no button to add more jurisdictions
    expect(wrapper.find(`.addJurisdiction`).length).toEqual(0);
    wrapper.unmount();
  });
  it('Form validation works', async () => {
    const wrapper = mount(<StudentExportForm />);

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
      jurisdictions: {
        id: 'Required',
      },
    });
    expect(wrapper.find('small.jurisdictions-error').text()).toEqual('Please select location');
  });
  it('Export Form submission works', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });

    const wrapper = mount(<StudentExportForm />);

    // set jurisdiction id
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('jurisdictions.id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="jurisdictions.name"]')
      .simulate('change', { target: { name: 'jurisdictions.name', value: 'Onyx' } });

    wrapper.find('form').simulate('submit');
    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});
    // Todo test the api get once form is submitted
  });
});
