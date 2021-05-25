import { SupersetFormData } from '@onaio/superset-connector';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import flushPromises from 'flush-promises';
import React from 'react';
import { ChildSupersetDataTable } from '..';

const supersetFetchParams = {
  adhoc_filters: [
    {
      clause: 'WHERE',
      comparator: '99642369-fec4-4cb2-99c6-c901228b3adf',
      expressionType: 'SIMPLE',
      operator: '==',
      subject: 'jurisdiction_id',
    },
    {
      clause: 'WHERE',
      comparator: 'eb601285-d5c2-55c3-bcd5-c29ae71a6236',
      expressionType: 'SIMPLE',
      operator: '==',
      subject: 'plan_id',
    },
  ],
  row_limit: 150,
} as SupersetFormData;

const props = {
  data: [
    ['test', 9, 6, 3],
    ['user', 6, 0, 0],
  ],
  fetchItems: jest.fn(),
  headerItems: ['name', 'col-1', 'col-2', 'col-3'],
  service: jest.fn(),
  supersetFetchParams,
  supersetSliceId: '1',
};

describe('components/ChildSupersetDataTable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<ChildSupersetDataTable {...props} />);
  });

  it('should render list correctly', async () => {
    const wrapper = mount(<ChildSupersetDataTable {...props} />);

    await flushPromises();
    expect(props.service).toBeCalledWith(props.supersetSliceId, props.supersetFetchParams);

    expect(wrapper.find('ListView').length).toEqual(1);
    expect(toJson(wrapper.find('ListView table'))).toMatchSnapshot('table with data');
    // two reports rendered
    expect(wrapper.find('.listview-tbody tr').length).toEqual(2);
  });

  it('should render headers when there is no data correctly', () => {
    props.data = [];
    const wrapper = mount(<ChildSupersetDataTable {...props} />);

    expect(wrapper.find('.listview-tbody tr').length).toEqual(0);
    expect(wrapper.find('ChildSupersetDataTable div div').text()).toEqual('No rows found');
  });
});
