import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import MockDate from 'mockdate';
import React from 'react';
import PlanForm from '..';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

describe('containers/forms/PlanForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<PlanForm />);
  });

  it('renders correctly', () => {
    MockDate.set('7-13-17 19:31', 3); // Mersenne primes :)
    fetch.mockResponseOnce(JSON.stringify([]));
    const wrapper = mount(<PlanForm />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.unmount();
  });
});
