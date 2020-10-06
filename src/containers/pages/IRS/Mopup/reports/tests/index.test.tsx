import reducerRegistry from '@onaio/redux-reducer-registry';
import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { createBrowserHistory } from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import ConnectedMopup, { Mopup } from '..';
import { IRS_MOP_UP_REPORT_URL } from '../../../../../../constants';
import store from '../../../../../../store';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../../../../store/ducks/generic/jurisdictions';
import IRSPlansReducer, {
  genericFetchPlans,
  reducerName as IRSPlansReducerName,
} from '../../../../../../store/ducks/generic/plans';
import { mopupFocusAreas, mopupIRSJurisdictions, mopupPlans } from './fixtures/fixtures';

jest.mock('../../../../../../configs/env');

/** register the reducers */
reducerRegistry.register(IRSPlansReducerName, IRSPlansReducer);
/** register the reducers */
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

const mock: any = jest.fn();
const history = createBrowserHistory();

const props = {
  history,
  location: mock,
  match: {
    isExact: true,
    params: {
      planId: '7e4aba56-d5cc-5b3c-9e01-966e757c389e',
    },
    path: `${IRS_MOP_UP_REPORT_URL}/:planId`,
    url: `${IRS_MOP_UP_REPORT_URL}/7e4aba56-d5cc-5b3c-9e01-966e757c389e`,
  },
};

describe('containers/pages/IRS/Mopup/reports/', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(
      <Router history={history}>
        <Mopup {...props} />
      </Router>
    );
  });

  it('works with store', async () => {
    // populate the store
    store.dispatch(genericFetchPlans(mopupPlans));
    store.dispatch(fetchGenericJurisdictions('200', mopupIRSJurisdictions));
    store.dispatch(fetchGenericJurisdictions('201', mopupFocusAreas));

    const supersetServiceMock: any = jest.fn(async () => []);
    (props as any).service = supersetServiceMock;
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <ConnectedMopup {...props} />
        </Router>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
    });
    wrapper.update();

    expect(wrapper.find('.page-title').text()).toEqual(
      'IRS Mop-up Reporting: VL Zambia 2020 Traning Plan'
    );
    wrapper.find('.breadcrumb li').forEach((list, index) => {
      expect(list.text()).toMatchSnapshot(` ${index + 1}`);
    });
    wrapper.find('.th').forEach((header, index) => {
      expect(header.text()).toMatchSnapshot(` table headers${index + 1}`);
    });
    wrapper.find('.tr .td').forEach((data, index) => {
      expect(data.text()).toMatchSnapshot(` ${index + 1}`);
    });

    // drill down to district level.
    expect(
      wrapper
        .find('.tbody .tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Zambia(vl 2020)7629230071521"`);

    wrapper
      .find('.tbody .tr')
      .at(0)
      .find('.td')
      .at(0)
      .simulate('click', { button: 0 });

    wrapper.update();
    expect(
      wrapper
        .find('.tbody .tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Eastern Prov (2020)2844076270"`);

    wrapper
      .find('.tbody .tr')
      .at(0)
      .find('.td')
      .at(0)
      .simulate('click', { button: 0 });

    wrapper.update();
    expect(
      wrapper
        .find('.tbody .tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Chadiza District (2020)2844076270"`);

    wrapper
      .find('.tbody .tr')
      .at(0)
      .find('.td')
      .at(0)
      .simulate('click', { button: 0 });

    wrapper.update();
    expect(
      wrapper
        .find('.tbody .tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Chadiza(2020)1693522233"`);
    wrapper.find('.tr').forEach(data => {
      expect(data.text()).toMatchSnapshot(``);
    });

    wrapper
      .find('.tbody .tr')
      .at(0)
      .find('.td')
      .at(0)
      .simulate('click', { button: 0 });

    wrapper.update();
    expect(
      wrapper
        .find('.tbody .tr')
        .at(0)
        .text()
    ).toMatchInlineSnapshot(`"Chadiza(2020) (other)0000"`);

    wrapper.find('.tr').forEach(data => {
      expect(data.text()).toMatchSnapshot(`at District level`);
    });

    wrapper
      .find('.tbody .tr')
      .at(1)
      .find('.td')
      .at(0)
      .simulate('click', { button: 0 });

    wrapper.update();
    expect(
      wrapper
        .find('.tbody .tr')
        .at(1)
        .text()
    ).toMatchInlineSnapshot(
      `"CDZ_18(2020)Chadiza(2020)4103730.00%0.00%0.00%Not visitedNo decision form"`
    );

    wrapper.find('.tr').forEach(data => {
      expect(data.text()).toMatchSnapshot(`at focus Area level`);
    });
  });
});
