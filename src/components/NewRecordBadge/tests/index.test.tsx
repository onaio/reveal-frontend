import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import moment from 'moment';
import React from 'react';
import NewRecordBadge from '..';

describe('components/NewRecordBadge', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<NewRecordBadge />);
  });

  it('renders badge correctly', () => {
    const wrapper = mount(<NewRecordBadge />);
    // badge not rendered if recordDate not supplied
    expect(wrapper.find('Badge').length).toEqual(0);

    // renders okay for a date within threshold
    const wrapper2 = mount(
      <NewRecordBadge
        recordDate={moment()
          .subtract(1, 'hour')
          .toDate()}
      />
    );
    expect(wrapper2.find('Badge').length).toEqual(1);
    expect(toJson(wrapper2.find('Badge'))).toMatchSnapshot('badge');

    // does not render badhe for a far past date
    const wrapper3 = mount(
      <NewRecordBadge
        recordDate={moment()
          .subtract(10, 'days')
          .toDate()}
      />
    );
    expect(wrapper3.find('Badge').length).toEqual(0);
  });

  it('renders okay with custom props', () => {
    // renders okay for a date within threshold
    const wrapper = mount(
      <NewRecordBadge
        className="mosh"
        color="danger"
        numDays={2}
        pill={false}
        recordDate={moment()
          .subtract(26, 'hours')
          .toDate()}
        text="Cool"
      />
    );
    expect(wrapper.find('Badge').length).toEqual(1);
    expect(toJson(wrapper.find('Badge'))).toMatchSnapshot('badge');
  });
});
