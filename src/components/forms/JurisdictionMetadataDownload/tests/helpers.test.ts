import { getAllowedMetaDataIdentifiers, MetaDataIdentifierParams } from '../helpers';

describe('helperes', () => {
  it('getAllowedMetaDataIdentifiers works correctly', () => {
    expect(getAllowedMetaDataIdentifiers([])).toEqual([]);

    expect(getAllowedMetaDataIdentifiers(['COVERAGE', 'POPULATION', 'RISK'])).toEqual([
      MetaDataIdentifierParams.COVERAGE,
      MetaDataIdentifierParams.POPULATION,
      MetaDataIdentifierParams.RISK,
    ]);
  });
});
