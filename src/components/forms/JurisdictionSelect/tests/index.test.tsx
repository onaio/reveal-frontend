import { mount, shallow } from 'enzyme';
import React from 'react';
import JurisdictionSelect, { defaultProps } from '..';
// tslint:disable-next-line:no-var-requires
const fetch = require('jest-fetch-mock');
jest.mock('../../../../helpers/errors');

describe('components/forms/JurisdictionSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    shallow(<JurisdictionSelect />);
    mount(<JurisdictionSelect {...defaultProps} />);
  });
  it('displays errors ', async () => {
    fetch.mockReject(new Error('Request failed'));
    mount(<JurisdictionSelect />);
    await new Promise(resolve => setImmediate(resolve));
  });
});
