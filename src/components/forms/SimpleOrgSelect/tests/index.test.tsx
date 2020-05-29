import { mount, shallow } from 'enzyme';
import React from 'react';
import SimpleOrgSelect from '..';
import defaultProps from '..';

describe('components/forms/SimpleOrgSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<SimpleOrgSelect />);
    mount(<SimpleOrgSelect {...defaultProps} />);
  });
});
