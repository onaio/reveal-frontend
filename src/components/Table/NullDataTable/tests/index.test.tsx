import { mount, shallow } from 'enzyme';
import React from 'react';
import NullDataTable from '..';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

describe('components/Table/NullDateTable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders without crashing', () => {
    const props = {
      reasonType: 'Routine',
      tableProps: fixtures.CurrentRoutineTableProps,
    };
    shallow(<NullDataTable {...props} />);
  });

  it('renders currentRoutinePlans with no data correctly', () => {
    const props = {
      reasonType: 'Routine',
      tableProps: fixtures.CurrentRoutineTableProps,
    };
    const wrapper = mount(<NullDataTable {...props} />);
    expect(wrapper.text()).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders currentReactivePlans correctly', () => {
    const props = {
      reasonType: 'Reactive',
      tableProps: fixtures.CurrentReactiveTableProps,
    };
    const wrapper = mount(<NullDataTable {...props} />);
    expect(wrapper.text()).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders completeRoutinePlans with no data correctly', () => {
    const props = {
      reasonType: 'Routine',
      tableProps: fixtures.CompleteRoutineTableProps,
    };
    const wrapper = mount(<NullDataTable {...props} />);
    expect(wrapper.text()).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders completeReactivePlans correctly', () => {
    const props = {
      reasonType: 'Reactive',
      tableProps: fixtures.CompleteReactiveTableProps,
    };
    const wrapper = mount(<NullDataTable {...props} />);
    expect(wrapper.text()).toMatchSnapshot();
    wrapper.unmount();
  });
});
