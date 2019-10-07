import { mount, shallow } from 'enzyme';
import React from 'react';
import { AssignPractitioner } from '..';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';

describe('src/pages/*/AssignPractitioners', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('render without crashing', () => {
    const props = {
      organization: fixtures.organization3,
    };
    shallow(<AssignPractitioner {...props} />);
  });
});
