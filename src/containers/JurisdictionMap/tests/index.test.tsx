import { mount, shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { jurisdiction1 } from '../../../store/ducks/tests/fixtures';
import { defaultProps, JurisdictionMap, JurisdictionMapProps } from '../index';

/* tslint:disable-next-line no-var-requires */
const fetch = require('jest-fetch-mock');

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

  it('renders correctly', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));
    const callbackMock: any = jest.fn();
    const supersetServiceMock: any = jest.fn();
    supersetServiceMock.mockImplementation(async () => []);

    const props: JurisdictionMapProps = {
      ...defaultProps,
      callback: callbackMock,
      cssClass: 'super-custom',
      jurisdiction: jurisdiction1,
      jurisdictionId: jurisdiction1.jurisdiction_id,
      supersetService: supersetServiceMock,
    };
    const wrapper = mount(
      <MemoryRouter>
        <JurisdictionMap {...props} />
      </MemoryRouter>
    );

    await flushPromises();
    wrapper.update();

    expect(supersetServiceMock.mock.calls).toEqual([
      [
        '459',
        {
          adhoc_filters: [
            {
              clause: 'WHERE',
              comparator: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
              expressionType: 'SIMPLE',
              operator: '==',
              subject: 'jurisdiction_id',
            },
          ],
          row_limit: 1,
        },
      ],
    ]);
    expect(supersetServiceMock).toHaveBeenCalledTimes(1);

    expect(callbackMock.mock.calls).toEqual([[jurisdiction1]]);
    expect(callbackMock).toHaveBeenCalledTimes(1);

    expect(wrapper.find('GisidaWrapper').props()).toEqual({
      currentGoal: null,
      geoData: jurisdiction1,
      goal: null,
      handlers: [],
      minHeight: '200px',
      pointFeatureCollection: null,
      polygonFeatureCollection: null,
      structures: null,
    });
  });
});
