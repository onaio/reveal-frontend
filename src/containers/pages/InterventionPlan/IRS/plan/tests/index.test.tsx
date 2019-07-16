import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { FI_SINGLE_URL } from '../../../../../../constants';
import { IRS_PLAN_TITLE } from '../../../../../../constants';
import store from '../../../../../../store';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';

import ConnectedIrsPlan, { IrsPlan } from './..';

jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();

describe('containers/pages/IRS/plan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '1234' },
        path: `${FI_SINGLE_URL}/plan/:id`,
        url: `${FI_SINGLE_URL}/plan/1234`,
      },
      planId: '1234',
    };
    shallow(
      <Router history={history}>
        <IrsPlan {...props} />
      </Router>
    );
  });

  it('renders IRS Plan page correctly', () => {
    const mock: any = jest.fn();
    const { id } = fixtures.plan1;
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id },
        path: `${FI_SINGLE_URL}/plan/:id`,
        url: `${FI_SINGLE_URL}/plan/${id}`,
      },
    };
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedIrsPlan {...props} />
        </Router>
      </Provider>
    );
    // check that the page title is rendered correctly
    const helmet = Helmet.peek();
    expect(helmet.title).toEqual(IRS_PLAN_TITLE);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
