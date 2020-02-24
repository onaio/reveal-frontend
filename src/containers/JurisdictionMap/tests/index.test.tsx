import { shallow } from 'enzyme';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { jurisdiction1 } from '../../../store/ducks/tests/fixtures';
import { defaultProps, JurisdictionMap, JurisdictionMapProps } from '../index';

describe('components/IRS Reports/IRSReportingMap', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const props: JurisdictionMapProps = {
      ...defaultProps,
      jurisdiction: jurisdiction1,
      jurisdictionId: jurisdiction1.jurisdiction_id,
    };
    shallow(
      <MemoryRouter>
        <JurisdictionMap {...props} />
      </MemoryRouter>
    );
  });
});
