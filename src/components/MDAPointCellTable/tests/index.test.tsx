import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import MDAPointTableCell from '..';

describe('src/components/mdaPointCellTable', () => {
  it('renders correctly', () => {
    const cell = {
      row: {
        original: { plan_id: 'plan_id', jurisdiction_id: 'jurisdiction_id' },
      },
    };

    const props: any = {
      cell,
      cellValue: 'CellValue',
      hasChildren: true,
    };
    const wrapper = shallow(<MDAPointTableCell {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot('has children');

    wrapper.setProps({ hasChildren: false });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot('has not children');
  });

  it('renders correctly when is_virtual_jurisdiction and has not children', () => {
    const cell = {
      row: {
        original: {
          is_virtual_jurisdiction: true,
          jurisdiction_id: 'jurisdiction_id',
          plan_id: 'plan_id',
        },
      },
    };

    const props: any = {
      cell,
      cellValue: 'CellValue',
      hasChildren: false,
    };
    const wrapper = shallow(<MDAPointTableCell {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot('has children');
  });
});
