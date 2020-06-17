import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import { GenericSupersetDataTable } from '..';

const props = {
  data: [
    ['11 - 15', 9, 6, 3],
    ['< 6', 6, 0, 0],
  ],
  fetchItems: jest.fn(),
  headerItems: ['Age', 'col-1', 'col-2', 'col-3'],
  service: jest.fn(),
  supersetSliceId: '1',
};

describe('components/GenericSupersetDataTable', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<GenericSupersetDataTable {...props} />);
  });

  it('should render list correctly', () => {
    const wrapper = mount(<GenericSupersetDataTable {...props} />);

    expect(wrapper.find('ListView').length).toEqual(1);
    expect(toJson(wrapper.find('ListView table'))).toMatchSnapshot('table with data');
    // two reports rendered
    expect(wrapper.find('.listview-tbody tr').length).toEqual(2);
  });

  it('should render headers when there is no data correctly', () => {
    props.data = [];
    const wrapper = mount(<GenericSupersetDataTable {...props} />);

    expect(wrapper.find('.listview-tbody tr').length).toEqual(0);
    expect(wrapper.find('GenericSupersetDataTable div div').text()).toEqual('No rows found');
  });
});
