import superset from '@onaio/superset-connector';
import { MDAJurisdictionsJSON } from '../../DynamicMDA/JurisdictionsReport/tests/fixtures';
import * as fixtures from '../../IRS/JurisdictionsReport/fixtures';
import * as helpers from '../helpers';
import { getColumnsToUse } from '../helpers';

describe('containers/pages/IRS/JurisdictionsReport/helpers', () => {
  it('should return the correct columns for Namibia', () => {
    expect(JSON.stringify(helpers.NamibiaColumns)).toEqual(JSON.stringify(fixtures.NamibiaColumns));
  });

  it('should return the correct columns for Zambia focus areas', () => {
    expect(JSON.stringify(helpers.ZambiaFocusAreasColumns)).toEqual(
      JSON.stringify(fixtures.ZambiaFocusAreasColumns)
    );
  });

  it('should return the correct columns for Zambia jurisdiction', () => {
    expect(JSON.stringify(helpers.ZambiaJurisdictionsColumns)).toEqual(
      JSON.stringify(fixtures.ZambiaJurisdictionsColumns)
    );
  });

  it('should return the correct keys for plansTableColumns', () => {
    expect(Object.keys(helpers.plansTableColumns)).toEqual([
      'mdaJurisdictionsColumns',
      'namibia2019',
      'zambiaFocusArea2019',
      'zambiaJurisdictions2019',
      'zambiaMDALower2020',
      'zambiaMDAUpper2020',
    ]);
  });
  it('it should return the correct table columns for plansTableColumns namibia2019', () => {
    expect(JSON.stringify(helpers.plansTableColumns.namibia2019)).toEqual(
      JSON.stringify(fixtures.NamibiaColumns)
    );
  });

  it('should return the correct table columns for plansTableColumns zambiaFocusArea2019', () => {
    expect(JSON.stringify(helpers.plansTableColumns.zambiaFocusArea2019)).toEqual(
      JSON.stringify(fixtures.ZambiaFocusAreasColumns)
    );
  });

  it('should return the correct columns for plansTableColumns zambiaJurisdictions2019', () => {
    expect(JSON.stringify(helpers.plansTableColumns.zambiaJurisdictions2019)).toEqual(
      JSON.stringify(fixtures.ZambiaJurisdictionsColumns)
    );
  });

  it('should return the correct columns for MDA point', () => {
    expect(JSON.stringify(helpers.mdaJurisdictionsColumns)).toEqual(
      JSON.stringify(fixtures.mdaPointColumns)
    );
  });

  it('getColumnsToUse: should return correct columns', () => {
    const jurisdiction = superset.processData(MDAJurisdictionsJSON) || [];
    const jurisdictionColumn = 'zambiaMDAUpper2020';
    const focusAreaColumn = 'zambiaMDALower2020';
    const focusAreaLevel = '2';
    let jurisdictionId = '4669b841-5f06-47bc-ac87-4282ca21ae6a';
    // jurisdiction_depth of 2
    expect(
      getColumnsToUse(
        jurisdiction,
        jurisdictionColumn,
        focusAreaColumn,
        focusAreaLevel,
        jurisdictionId
      )
    ).toEqual(helpers.zambiaMDALowerJurisdictions);

    // jurisdiction_depth of 1
    jurisdictionId = 'ecfbf048-fb7a-47d8-a12b-61bf5d2a6e7b';
    expect(
      getColumnsToUse(
        jurisdiction,
        jurisdictionColumn,
        focusAreaColumn,
        focusAreaLevel,
        jurisdictionId
      )
    ).toEqual(helpers.zambiaMDAUpperJurisdictions);
  });
});
