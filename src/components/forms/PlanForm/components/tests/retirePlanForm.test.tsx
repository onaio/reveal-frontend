import { mount, shallow } from 'enzyme';
import MockDate from 'mockdate';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { PlanDefinition } from '../../../../../configs/settings';
import * as errors from '../../../../../helpers/errors';
import { expectedPlanDefinition } from '../../tests/fixtures';
import { RetirePlanForm } from '../retirePlanForm';
import { retirePayload } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
MockDate.set('1/30/2000');
jest.mock('../../../../../configs/env');

const props = {
  cancelCallBack: jest.fn(),
  payload: expectedPlanDefinition as PlanDefinition,
  savePlan: jest.fn(),
  setSubmittingCallBack: jest.fn(),
};

describe('forms/PlanForm/components/retirePlanForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<RetirePlanForm {...props} />);
  });

  it('renders form correctly', async () => {
    const wrapper = mount(<RetirePlanForm {...props} />);

    // check cancel and submit buttons
    expect(wrapper.find('#retireform-submit-button button').prop('disabled')).toBeTruthy();
    expect(wrapper.find('#retireform-cancel-button button').length).toEqual(1);

    // click cancel button
    wrapper.find('#retireform-cancel-button button').simulate('click');
    expect(wrapper.props().cancelCallBack).toBeCalledTimes(1);
    expect(wrapper.props().setSubmittingCallBack).toBeCalledTimes(1);
    expect(wrapper.find('#otherReason').length).toEqual(0);

    // fill form
    jest.resetAllMocks();
    wrapper
      .find('select[name="retireReason"]')
      .simulate('change', { target: { name: 'retireReason', value: 'DUPLICATE' } });

    expect(wrapper.find('#retireform-submit-button button').prop('disabled')).toBeFalsy();
    expect(wrapper.find('#otherReason').length).toEqual(0);

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    expect(wrapper.props().cancelCallBack).toBeCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://test.smartregister.org/opensrp/rest/event', {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      body: JSON.stringify(retirePayload),
      headers: {
        accept: 'application/json',
        authorization: 'Bearer null',
        'content-type': 'application/json;charset=UTF-8',
      },
      method: 'POST',
    });
  });

  it('User can type reason', async () => {
    const otherReason = 'test other reason';
    const payloadCopy = { ...retirePayload };
    payloadCopy.obs[0].values = [otherReason];
    payloadCopy.formSubmissionId = '0122e50c-df02-5f11-90c5-e2593b6530ce';
    const wrapper = mount(<RetirePlanForm {...props} />);

    // check cancel and submit buttons
    expect(wrapper.find('#retireform-submit-button button').prop('disabled')).toBeTruthy();
    // other reason form field is hidden
    expect(wrapper.find('#otherReason').length).toBeFalsy();

    // select other reason
    wrapper
      .find('select[name="retireReason"]')
      .simulate('change', { target: { name: 'retireReason', value: 'OTHER' } });

    // it is possible  to type a reason
    expect(wrapper.find('#otherReason').length).toBeTruthy();
    wrapper
      .find('input[name="otherReason"]')
      .simulate('change', { target: { name: 'otherReason', value: otherReason } });

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    expect(wrapper.props().cancelCallBack).toBeCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://test.smartregister.org/opensrp/rest/event', {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      body: JSON.stringify(payloadCopy),
      headers: {
        accept: 'application/json',
        authorization: 'Bearer null',
        'content-type': 'application/json;charset=UTF-8',
      },
      method: 'POST',
    });
  });

  it('renders form correctly', async () => {
    const error = 'API is down';
    fetch.mockReject(() => Promise.reject(error));
    const spyDisplayError = jest.spyOn(errors, 'displayError');
    const wrapper = mount(<RetirePlanForm {...props} />);

    // fill and submit form
    wrapper
      .find('select[name="retireReason"]')
      .simulate('change', { target: { name: 'retireReason', value: 'DUPLICATE' } });

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });

    // submit button enables after error
    expect(wrapper.find('#retireform-submit-button button').prop('disabled')).toBeFalsy();
    // was display error called
    expect(spyDisplayError).toHaveBeenCalledTimes(1);
    expect(spyDisplayError).toHaveBeenCalledWith(error, 'An Error Ocurred', false);
  });
});
