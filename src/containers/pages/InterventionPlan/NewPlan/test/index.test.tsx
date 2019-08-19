import { mount, shallow } from 'enzyme';
import React from 'react';
import NewPlan from '../index';

describe('containers/pages/NewPlan', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<NewPlan />);
  });
});
