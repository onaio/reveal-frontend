import * as helpers from '../helpers';
import * as fixtures from './fixtures';

describe('NamibiaColumns', () => {
  it('should return the correct columns', () => {
    expect(JSON.stringify(helpers.NamibiaColumns)).toEqual(JSON.stringify(fixtures.NamibiaColumns));
  });
});

describe('ZambiaFocusAreasColumns', () => {
  it('should return the correct columns', () => {
    expect(JSON.stringify(helpers.ZambiaFocusAreasColumns)).toEqual(
      JSON.stringify(fixtures.ZambiaFocusAreasColumns)
    );
  });
});

describe('ZambiaJurisdictionsColumns', () => {
  it('should return the correct columns', () => {
    expect(JSON.stringify(helpers.ZambiaJurisdictionsColumns)).toEqual(
      JSON.stringify(fixtures.ZambiaJurisdictionsColumns)
    );
  });
});

describe('IRSTableColumns', () => {
  it('should return the correct keys', () => {
    expect(Object.keys(helpers.IRSTableColumns)).toEqual([
      'namibia2019',
      'zambiaFocusArea2019',
      'zambiaJurisdictions2019',
    ]);
  });
  it('it should return the correct table columns for namibia2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.namibia2019)).toEqual(
      JSON.stringify(fixtures.NamibiaColumns)
    );
  });

  it('should return the correct table columns for zambiaFocusArea2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.zambiaFocusArea2019)).toEqual(
      JSON.stringify(fixtures.ZambiaFocusAreasColumns)
    );
  });

  it('should return the correct columns for zambiaJurisdictions2019', () => {
    expect(JSON.stringify(helpers.IRSTableColumns.zambiaJurisdictions2019)).toEqual(
      JSON.stringify(fixtures.ZambiaJurisdictionsColumns)
    );
  });
});
