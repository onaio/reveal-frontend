import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import MockDate from 'mockdate';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { raZambiaNode } from '../../../../../../components/TreeWalker/tests/fixtures';
import { plans } from '../../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';
import { JurisdictionAssignmentForm } from '../index';
import { apiCall, submitCallbackPayload } from './fixtures';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../../configs/env');

describe('PlanAssignment/JurisdictionAssignmentForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    MockDate.set('12/30/2019', 0);
  });

  it('renders without crashing', () => {
    if (!raZambiaNode) {
      fail();
    }

    const props = {
      defaultValue: [{ label: 'Team X', value: 'x' }],
      jurisdiction: raZambiaNode,
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
      plan: plans[1],
    };

    const wrapper = mount(<JurisdictionAssignmentForm {...props} />);

    expect(wrapper.find('Form').length).toEqual(1);
    expect(wrapper.find('SelectField').props() as any).toMatchSnapshot({
      form: expect.any(Object),
    });
    expect(toJson(wrapper.find('button'))).toMatchSnapshot('Submit buttons');
    wrapper.unmount();
  });

  it('shows error if no plan or jurisdiction', () => {
    const props = {
      defaultValue: [{ label: 'Team X', value: 'x' }],
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
    };

    const wrapper = mount(<JurisdictionAssignmentForm {...props} />);

    expect(toJson(wrapper.find('span'))).toMatchSnapshot('no plan or jurisdiction');
    wrapper.unmount();
  });

  it('form works as expected', async () => {
    if (!raZambiaNode) {
      fail();
    }

    fetch.mockResponseOnce(JSON.stringify({}), { status: 200 });

    const cancelMock: any = jest.fn();
    const submitMock: any = jest.fn();
    const growlMock: any = jest.fn();

    const props = {
      cancelCallBackFunc: cancelMock,
      defaultValue: [{ label: 'Team X', value: 'x' }],
      jurisdiction: raZambiaNode,
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
      plan: plans[1],
      submitCallBackFunc: submitMock,
      successNotifierBackFunc: growlMock,
    };

    const wrapper = mount(<JurisdictionAssignmentForm {...props} />);

    await act(async () => {
      wrapper.find('button.cancel').simulate('click');
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(cancelMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetch.mock.calls).toEqual(apiCall);
    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock.mock.calls).toEqual(submitCallbackPayload);
    expect(growlMock.mock.calls).toEqual([['Team(s) assignment updated successfully']]);

    wrapper.unmount();
  });

  it('form errors as expected', async () => {
    if (!raZambiaNode) {
      fail();
    }

    fetch.mockResponseOnce(JSON.stringify({}), { status: 400 });

    const submitMock: any = jest.fn();

    const props = {
      defaultValue: [{ label: 'Team X', value: 'x' }],
      jurisdiction: raZambiaNode,
      options: [
        { label: 'Team X', value: 'x' },
        { label: 'Team Y', value: 'y' },
      ],
      plan: plans[1],
      submitCallBackFunc: submitMock,
    };

    const wrapper = mount(<JurisdictionAssignmentForm {...props} />);

    await act(async () => {
      wrapper.find('form').simulate('submit');
    });
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(submitMock).toHaveBeenCalledTimes(0);
    expect(toJson(wrapper.find('p.assignments-error'))).toMatchSnapshot('Form error');

    wrapper.unmount();
  });
});
