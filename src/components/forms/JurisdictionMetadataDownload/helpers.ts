import {
  COVERAGE_LABEL,
  OTHER_POPULATION_LABEL,
  POPULATION_LABEL,
  RISK_TEXT,
  STRUCTURE_LABEL,
  TARGET_LABEL,
} from '../../../configs/lang';
import {
  JURISDICTION_METADATA_COVERAGE,
  JURISDICTION_METADATA_OTHER_POPULATION,
  JURISDICTION_METADATA_POPULATION,
  JURISDICTION_METADATA_RISK,
  JURISDICTION_METADATA_STUCTURES,
  JURISDICTION_METADATA_TARGET,
  STRUCTURE_METADATA_OTHER_POPULATION,
  STRUCTURE_METADATA_POPULATION,
} from '../../../constants';
import { MetadataOptions } from '../../../helpers/utils';

/** select Option */
export interface SelectOption {
  label: string;
  value: string;
}

/** assign all jurisdiction metadata identifiers to a constant */
export const JurisdictionsMetaDataIdentifierParams = {
  COVERAGE: { value: JURISDICTION_METADATA_COVERAGE, label: COVERAGE_LABEL },
  OTHER_POPULATION: {
    label: OTHER_POPULATION_LABEL,
    value: JURISDICTION_METADATA_OTHER_POPULATION,
  },
  POPULATION: { value: JURISDICTION_METADATA_POPULATION, label: POPULATION_LABEL },
  RISK: { value: JURISDICTION_METADATA_RISK, label: RISK_TEXT },
  STRUCTURE: { value: JURISDICTION_METADATA_STUCTURES, label: STRUCTURE_LABEL },
  TARGET: { value: JURISDICTION_METADATA_TARGET, label: TARGET_LABEL },
} as const;
export type JurisdictionsMetaDataIdentifierParams = keyof typeof JurisdictionsMetaDataIdentifierParams;

/** assign all jurisdiction metadata identifiers to a constant */
export const StructuresMetaDataIdentifierParams = {
  OTHER_POPULATION: {
    label: OTHER_POPULATION_LABEL,
    value: STRUCTURE_METADATA_OTHER_POPULATION,
  },
  POPULATION: { value: STRUCTURE_METADATA_POPULATION, label: POPULATION_LABEL },
} as const;
export type StructuresMetaDataIdentifierParams = keyof typeof StructuresMetaDataIdentifierParams;

/** group all metadata options */
export const allSettingsMetadata = {
  [MetadataOptions.JurisdictionMetadata]: JurisdictionsMetaDataIdentifierParams,
  [MetadataOptions.StructureMetadata]: StructuresMetaDataIdentifierParams,
};

/**
 * filter allowed identifier options
 * @param {JurisdictionsMetaDataIdentifierParams[]} allowedIdentifiers - allowed options keys list
 */
export const getAllowedMetaDataIdentifiers = (
  allowedIdentifiers: JurisdictionsMetaDataIdentifierParams[],
  metadataOption: MetadataOptions = MetadataOptions.JurisdictionMetadata,
  allMetadataObj: typeof allSettingsMetadata = allSettingsMetadata
) => {
  const metadataIdentifierParams = allMetadataObj[metadataOption];
  const allowedOptions: SelectOption[] = [];
  Object.entries(metadataIdentifierParams).forEach(([key, value]) => {
    if (
      allowedIdentifiers.includes(
        key as JurisdictionsMetaDataIdentifierParams | StructuresMetaDataIdentifierParams
      )
    ) {
      allowedOptions.push(value);
    }
  });
  return allowedOptions;
};
