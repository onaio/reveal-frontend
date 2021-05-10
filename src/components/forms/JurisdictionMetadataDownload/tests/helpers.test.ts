import { MetadataOptions } from '../../../../helpers/utils';
import {
  getAllowedMetaDataIdentifiers,
  JurisdictionsMetaDataIdentifierParams,
  StructuresMetaDataIdentifierParams,
} from '../helpers';

describe('helperes', () => {
  it('getAllowedMetaDataIdentifiers works correctly', () => {
    expect(getAllowedMetaDataIdentifiers([])).toEqual([]);

    expect(getAllowedMetaDataIdentifiers(['COVERAGE', 'POPULATION', 'RISK'])).toEqual([
      JurisdictionsMetaDataIdentifierParams.COVERAGE,
      JurisdictionsMetaDataIdentifierParams.POPULATION,
      JurisdictionsMetaDataIdentifierParams.RISK,
    ]);

    expect(
      getAllowedMetaDataIdentifiers(
        ['COVERAGE', 'POPULATION', 'RISK'],
        MetadataOptions.StructureMetadata
      )
    ).toEqual([StructuresMetaDataIdentifierParams.POPULATION]);
  });
});
