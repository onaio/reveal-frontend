import { getColumnsToUse, IRSPerfomanceColumns, supersetFilters } from '../helpers';

jest.mock('../../../../../../configs/env');

describe('IRS/performanceReport/reports/helpers', () => {
  it('getColumnsToUse works correctly', () => {
    expect(getColumnsToUse({ planId: '12345' })).toEqual(IRSPerfomanceColumns.districtColumns);
    expect(getColumnsToUse({ jurisdictionId: '123-345', planId: '12345' })).toEqual(
      IRSPerfomanceColumns.dataCollectorsColumns
    );
    expect(
      getColumnsToUse({ dataCollector: 'qwetdg', jurisdictionId: '123-345', planId: '12345' })
    ).toEqual(IRSPerfomanceColumns.sopColumns);
    expect(
      getColumnsToUse({
        dataCollector: 'qwetdg',
        jurisdictionId: '123-345',
        planId: '12345',
        sop: 'NL2:sop',
      })
    ).toEqual(IRSPerfomanceColumns.sopByDateColumns);
  });

  it('supersetFilters works correctly', () => {
    expect(supersetFilters({ planId: '12345' }, '12345')).toEqual({
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: '12345',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_id',
        },
      ],
      row_limit: 3000,
    });
    expect(supersetFilters({ planId: '12345' }, '12345')).toEqual({
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: '12345',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_id',
        },
      ],
      row_limit: 3000,
    });
    expect(supersetFilters({ jurisdictionId: '', planId: '12345', sop: '' }, '12345')).toEqual({
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: '12345',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_id',
        },
      ],
      row_limit: 3000,
    });
    expect(
      supersetFilters({ jurisdictionId: 'qwertdg', planId: '12345', sop: 'NL2:sop' }, 'NL2:sop')
    ).toEqual({
      adhoc_filters: [
        {
          clause: 'WHERE',
          comparator: 'qwertdg',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'district_id',
        },
        {
          clause: 'WHERE',
          comparator: '12345',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'plan_id',
        },
        {
          clause: 'WHERE',
          comparator: 'NL2:sop',
          expressionType: 'SIMPLE',
          operator: '==',
          subject: 'sop',
        },
      ],
      row_limit: 3000,
    });
  });
});
