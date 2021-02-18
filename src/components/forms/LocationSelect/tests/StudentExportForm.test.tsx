import { getOpenSRPUserInfo } from '@onaio/gatekeeper';
import { authenticateUser } from '@onaio/session-reducer';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { OpenSRPAPIResponse } from '../../../../services/opensrp/tests/fixtures/session';
import store from '../../../../store';
import * as fixtures from '../../PlanForm/tests/fixtures';
import StudentExportForm from '../StudentExportForm';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

jest.mock('../../../../configs/env');

describe('components/forms/ExportForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<StudentExportForm />);
  });

  it('renders jurisdictions fields correctly', () => {
    fetch.mockResponseOnce(fixtures.jurisdictionLevel0JSON);
    const wrapper = mount(<StudentExportForm />);

    expect(toJson(wrapper.find(`#jurisdictions-id input`))).toMatchSnapshot(
      `jurisdictions.id field`
    );
    expect(wrapper.find({ for: `jurisdictions-1-name` }).length).toEqual(0);
    expect(toJson(wrapper.find(`#jurisdictions-name input`))).toMatchSnapshot(
      `jurisdictions.name field`
    );
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
    wrapper.find('Form').simulate('submit');

    await new Promise<any>(resolve => setImmediate(resolve));
    wrapper.update();

    // we now have some errors
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({
      id: 'Required',
    });
  });
  it('Export Form submission works', async () => {
    // ensure that we are logged in so that we can get the OpenSRP token from Redux
    const { authenticated, user, extraData } = getOpenSRPUserInfo(OpenSRPAPIResponse);
    store.dispatch(authenticateUser(authenticated, user, extraData));

    fetch.mockResponseOnce(JSON.stringify({}), { status: 201 });
    // const spyHandleDownload = jest.spyOn(formDownLoad, 'handleDownload');

    const wrapper = mount(<StudentExportForm />);

    // set jurisdiction id
    (wrapper
      .find('FieldInner')
      .first()
      .props() as any).formik.setFieldValue('id', '1337');
    // set jurisdiction name
    wrapper
      .find('input[name="name"]')
      .simulate('change', { target: { name: 'name', value: 'Onyx' } });

    wrapper.find('form').simulate('submit');
    await act(async () => {
      await new Promise<any>(resolve => setImmediate(resolve));
    });
    wrapper.update();

    // no errors are initially shown
    expect(
      (wrapper
        .find('FieldInner')
        .first()
        .props() as any).formik.errors
    ).toEqual({});
    expect(fetch.mock.calls).toEqual([
      [
        'https://test.smartregister.org/opensrp/rest/upload/template?event_name=Child Registration&location_id=1337',
        {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer hunter2',
            'content-type': 'application/json;charset=UTF-8',
          },
          method: 'GET',
        },
      ],
    ]);
  });
});
