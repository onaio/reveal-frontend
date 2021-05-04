import { getAllowedMetaDataIdentifiers, JurisdictionsMetaDataIdentifierParams } from '../helpers';

describe('helperes', () => {
  it('getAllowedMetaDataIdentifiers works correctly', () => {
    expect(getAllowedMetaDataIdentifiers([])).toEqual([]);

    expect(getAllowedMetaDataIdentifiers(['COVERAGE', 'POPULATION', 'RISK'])).toEqual([
      JurisdictionsMetaDataIdentifierParams.COVERAGE,
      JurisdictionsMetaDataIdentifierParams.POPULATION,
      JurisdictionsMetaDataIdentifierParams.RISK,
    ]);
  });
});
