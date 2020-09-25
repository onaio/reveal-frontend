import { mount, shallow } from 'enzyme';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { IRSMopUpReporting } from '..';
import { IRS_MOP_UP_REPORT_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import { GenericPlan } from '../../../../../../store/ducks/generic/plans';
import { mopupPlans } from '../../reports/tests/fixtures/fixtures';

jest.mock('../../../../../../configs/env');

const history = createBrowserHistory();

describe('IRS mop-up report', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      history,
      location: {
        hash: '',
        pathname: IRS_MOP_UP_REPORT_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${IRS_MOP_UP_REPORT_URL}/`,
        url: `${IRS_MOP_UP_REPORT_URL}/`,
      },
      plans: mopupPlans as GenericPlan[],
    };
    shallow(
      <Router history={history}>
        <IRSMopUpReporting {...props} />
      </Router>
    );
  });

  it('renders plans correctly when connected to store', async () => {
    const service = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(mopupPlans as GenericPlan[]));
    const props = {
      fetchPlans: jest.fn(),
      history,
      location: {
        hash: '',
        pathname: IRS_MOP_UP_REPORT_URL,
        search: '',
        state: undefined,
      },
      match: {
        isExact: true,
        params: {},
        path: `${IRS_MOP_UP_REPORT_URL}`,
        url: `${IRS_MOP_UP_REPORT_URL}`,
      },
      service,
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <IRSMopUpReporting {...props} />
        </Router>
      </Provider>
    );
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });
    expect(wrapper.find('h3.page-title').text()).toEqual('IRS Performance Reporting');

    expect(wrapper.find('.tbody .tr').length).toEqual(3);
    expect(wrapper.find('GenericPlansList').length).toBe(1);
    expect(wrapper.find('GenericPlansList').props()).toMatchSnapshot(
      'GenericPlansList props: connected to store'
    );
  });
});
