import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';
import * as fixtures from '../../../../store/ducks/tests/fixtures';
import TableHeader from '../tableheaders';

describe('components/page/Header', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('renders without crashing', () => {
    const props = {
      plansArray: [fixtures.plan1],
    };
    shallow(<TableHeader {...props} />);
  });

  it('renders reactive headers correctly', () => {
    const props = {
      plansArray: [fixtures.plan2],
    };
    const wrapper = mount(<TableHeader {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });

  it('renders routine headers correctly', () => {
    const props = {
      plansArray: [fixtures.plan1],
    };
    const wrapper = mount(<TableHeader {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
