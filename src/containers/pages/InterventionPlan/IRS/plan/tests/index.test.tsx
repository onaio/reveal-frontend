import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { INTERVENTION_IRS_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import * as fixtures from '../../../../../../store/ducks/tests/fixtures';
import ConnectedIrsPlan, { IrsPlan } from './..';

// const fetch = require('jest-fetch-mock');

jest.mock('../../../../../../configs/env');
const history = createBrowserHistory();

describe('containers/pages/IRS/plan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // fetch.resetMocks();
  });

  it('renders without crashing', () => {
    const mock: any = jest.fn();
    const props = {
      history,
      location: mock,
      match: {
        isExact: true,
        params: { id: '1234' },
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/1234`,
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
        path: `${INTERVENTION_IRS_URL}/plan/:id`,
        url: `${INTERVENTION_IRS_URL}/plan/${id}`,
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
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  // it('loads planById from Plans store', () => {});
  // it('loads entire location tree', () => {});
  // it('fetches jurisdiction geojson when necessary', () => {});
  // it('defines child jursidictions of all parent jurisdictions', () => {});
  // it('renders a gisida Map with correct layers', () => {});
  // it('renders a drilldown table with correct hierarchy', () => {});
});

// describe('containers/pages/IRS/plan - load draft plan', () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//     fetch.resetMocks();
//   });
//   it ('uses tilesets as gisida layer sources', () => {});
//   it('fetches the correct level 0 jurisdiction from opensrp', () => {});
//   it('determines which jurisdictions are selected in the plan', () => {});
// });

// describe('containers/pages/IRS/plan - jurisdiction hierarchy', () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//     fetch.resetMocks();
//   });
//   it('gets correct descendant jurisdictions', () => {});
//   it('gets correct ancestor jurisdictions', () => {});
//   it('correctly toggles jurisdiction selection', () => {});
// });
