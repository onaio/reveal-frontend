import * as helpers from '../helpers';
import * as fixtures from './fixtures';

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

  it('should return the correct keys for IRSTableColumns', () => {
    expect(Object.keys(helpers.IRSTableColumns)).toEqual([
      'mdaJurisdictionsColumns',
      'namibia2019',
      'zambiaFocusArea2019',
      'zambiaJurisdictions2019',
    ]);
  });
  it('it should return the correct table columns for IRSTableColumns namibia2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.namibia2019)).toEqual(
      JSON.stringify(fixtures.NamibiaColumns)
    );
  });

  it('should return the correct table columns for IRSTableColumns zambiaFocusArea2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.zambiaFocusArea2019)).toEqual(
      JSON.stringify(fixtures.ZambiaFocusAreasColumns)
    );
  });

  it('should return the correct columns for IRSTableColumns zambiaJurisdictions2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.zambiaJurisdictions2019)).toEqual(
      JSON.stringify(fixtures.ZambiaJurisdictionsColumns)
    );
  });
});
