import { mount, ReactWrapper } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { ConnectedJurisdictionTable } from '..';
import store from '../../../../../store';
import { sampleHierarchy } from '../../../../../store/ducks/opensrp/hierarchies/tests/fixtures';
import { plans } from '../../../../../store/ducks/opensrp/PlanDefinition/tests/fixtures';

// tslint:disable-next-line: no-var-requires
const fetch = require('jest-fetch-mock');

/** will use this to render table rows */
const renderTable = (wrapper: ReactWrapper, message: string) => {
  const trs = wrapper.find('table tr');
  trs.forEach(tr => {
    expect(tr.text()).toMatchSnapshot(message);
  });
};

describe('src/containers/pages/jurisdictionView/jurisdictionTable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    fetch.resetMocks();
  });

  it('works correctly through a full render cycle', async () => {
    fetch.once(JSON.stringify(sampleHierarchy), { status: 200 });
    const plan = plans[0];
    const props = {
      plan,
      rootJurisdictionId: '2942',
    };
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedJurisdictionTable {...props} />
      </Provider>
    );

    // first flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    renderTable(wrapper, 'should have single node(parent node)');
    const tbodyRow = wrapper.find('tbody tr');
    expect(tbodyRow.length).toEqual(1);
    expect(
      tbodyRow
        .at(0)
        .text()
        .includes('Lusaka')
    ).toBeTruthy();

    // test drilldown
    tbodyRow
      .at(0)
      .find('NodeCell span')
      .simulate('click');

    wrapper.update();
    renderTable(wrapper, 'after first click');

    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
        .includes('Mtendere')
    ).toBeTruthy();

    wrapper
      .find('tbody tr')
      .at(0)
      .find('NodeCell span')
      .simulate('click');

    wrapper.update();
    renderTable(wrapper, 'after second click');
    expect(
      wrapper
        .find('tbody tr')
        .at(0)
        .text()
        .includes('Akros_1')
    ).toBeTruthy();

    // akros is the last child it should not be clickable
    expect(toJson(wrapper.find('tbody tr NodeCell span'))).toMatchSnapshot(
      'should not have btn-link or onClick handler'
    );
  });

  it('selects and deselect nodes', async () => {
    fetch.once(JSON.stringify(sampleHierarchy), { status: 200 });
    const plan = plans[0];
    const props = {
      plan,
      rootJurisdictionId: '2942',
    };
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedJurisdictionTable {...props} />
      </Provider>
    );

    // first flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    const parentNodeRow = wrapper.find('tbody tr').at(0);
    // create snapshot of checkbox before getting checked
    expect(toJson(parentNodeRow.find('input'))).toMatchSnapshot('should be unchecked');

    // simulate click on checkbox to check
    parentNodeRow.find('input').simulate('change', { target: { name: '', checked: true } });
    wrapper.update();
    expect(
      toJson(
        wrapper
          .find('tbody tr')
          .at(0)
          .find('input')
      )
    ).toMatchSnapshot('should be now checked');

    // simulate click on checkbox to unchecked
    wrapper
      .find('tbody tr')
      .at(0)
      .find('input')
      .simulate('change', { target: { name: '', checked: false } });
    wrapper.update();

    // checkbox is now deselected again
    expect(
      toJson(
        wrapper
          .find('tbody tr')
          .at(0)
          .find('input')
      )
    ).toMatchSnapshot('should be now deselected');
  });

  it('shows loader', async () => {
    fetch.once(JSON.stringify(sampleHierarchy), { status: 200 });
    const plan = plans[0];
    const props = {
      plan,
      rootJurisdictionId: '2942',
    };
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedJurisdictionTable {...props} />
      </Provider>
    );

    // first flush promises
    await act(async () => {
      wrapper.update();
    });

    expect(wrapper.find('Ripple').length).toEqual(1);
  });

  it('shows errorMessage', async () => {
    fetch.once(JSON.stringify({}), { status: 500 });
    const plan = plans[0];
    const props = {
      plan,
      rootJurisdictionId: '2942',
    };
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedJurisdictionTable {...props} />
      </Provider>
    );

    // first flush promises
    await act(async () => {
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

    // here we see the error message in snapshot
    expect(wrapper.find('ErrorPage').text()).toMatchSnapshot(
      'should have jurisdiction hierarchy error message'
    );
  });
});
