import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import { Provider } from 'react-redux';
import ConnectedCaseDetails, { CaseDetails } from '..';
import { FAILED_TO_GET_EVENT_ID } from '../../../../../../configs/lang';
import * as utils from '../../../../../../helpers/errors';
import { OpenSRPService } from '../../../../../../services/opensrp';
import store from '../../../../../../store';
import { fetchEvents } from '../../../../../../store/ducks/opensrp/events';
import { rawEvent1 } from '../../../../../../store/ducks/opensrp/events/tests/fixtures';
import { extractEvent } from '../../../../../../store/ducks/opensrp/events/utils';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../../../configs/env');

const globalProps = {
  event: null,
  eventId: null,
  fetchEventsCreator: fetchEvents,
  service: OpenSRPService,
};

describe('src/containers/pages/interventionPlan/updateplan/caseDetials', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fetch.resetMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<CaseDetails {...globalProps} />);
  });

  it('renders correctly', async () => {
    const props = {
      ...globalProps,
      event: extractEvent(rawEvent1),
      eventId: '',
    };

    // still need to mock out service.list request
    fetch.once(JSON.stringify({}));
    const wrapper = mount(<CaseDetails {...props} />);

    // resolve promise to get event
    await flushPromises();
    await new Promise<unknown>(resolve => setImmediate(resolve));

    // rendered text
    expect(wrapper.find('Ripple').length).toEqual(0);
    expect(wrapper.text()).toMatchSnapshot(`Case Details`);
  });

  it('renders nothing when eventId is null', async () => {
    const props = {
      ...globalProps,
      event: extractEvent(rawEvent1),
    };

    const displayErrorMock: jest.Mock = jest.fn();
    (utils as any).displayError = displayErrorMock;

    // still need to mock out service.list request
    fetch.once(JSON.stringify({}));
    const wrapper = mount(<CaseDetails {...props} />);

    // resolve promise to get event
    await flushPromises();
    await new Promise<unknown>(resolve => setImmediate(resolve));

    // rendered text
    expect(wrapper.find('Ripple').length).toEqual(0);
    expect(wrapper.text()).toMatchInlineSnapshot(`""`);

    // expect display error was called with correct message
    expect(displayErrorMock).toHaveBeenCalledWith(new Error(FAILED_TO_GET_EVENT_ID));
  });

  it('works well with store', async () => {
    // still need to mock out service.list request
    fetch.once(JSON.stringify(rawEvent1));
    const props = {
      ...globalProps,
      eventId: rawEvent1._id,
    };
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedCaseDetails {...props} />
      </Provider>
    );

    // at this point event is null, thus should be loading
    expect(wrapper.find('Ripple').length).toEqual(1);

    // resolve promise to get event
    await flushPromises();
    await new Promise<unknown>(resolve => setImmediate(resolve));
    wrapper.update();

    // rendered text
    expect(wrapper.find('Ripple').length).toEqual(0);
    expect(wrapper.text()).toMatchSnapshot(`Case Details`);
  });

  it('Makes the correct api calls', async () => {
    fetch.once(JSON.stringify(rawEvent1));
    const props = {
      ...globalProps,
      eventId: rawEvent1.baseEntityId,
    };
    mount(
      <Provider store={store}>
        <ConnectedCaseDetails {...props} />
      </Provider>
    );

    await flushPromises();

    expect(fetch.mock.calls[0]).toEqual([
      'https://test.smartregister.org/opensrp/rest/event/findById?id=88684506-605d-41db-b904-efbaf9795d2a',
      {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer null',
          'content-type': 'application/json;charset=UTF-8',
        },
        method: 'GET',
      },
    ]);
  });
});
