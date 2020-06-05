import * as fixtures from '../../IRS/JurisdictionsReport/fixtures';
import * as helpers from '../helpers';

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
});
