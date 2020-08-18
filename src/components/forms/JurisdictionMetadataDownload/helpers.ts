import { COVERAGE_LABEL, POPULATION_LABEL, RISK_TEXT, TARGET_LABEL } from '../../../configs/lang';

import {
  JURISDICTION_METADATA_COVERAGE,
  JURISDICTION_METADATA_POPULATION,
  JURISDICTION_METADATA_RISK,
  JURISDICTION_METADATA_TARGET,
} from '../../../constants';

/** select Option */
export interface SelectOption {
  label: string;
  value: string;
}

/** assign all jurisdiction metadata identifiers to a c */
export const MetaDataIdentifierParams = {
  COVERAGE: { value: JURISDICTION_METADATA_COVERAGE, label: COVERAGE_LABEL },
  POPULATION: { value: JURISDICTION_METADATA_POPULATION, label: POPULATION_LABEL },
  RISK: { value: JURISDICTION_METADATA_RISK, label: RISK_TEXT },
  TARGET: { value: JURISDICTION_METADATA_TARGET, label: TARGET_LABEL },
} as const;

export type MetaDataIdentifierParams = keyof typeof MetaDataIdentifierParams;

export const getAllowedMetaDataIdentifiers = (allowedIdentifiers: MetaDataIdentifierParams[]) => {
  const allowedOptions: SelectOption[] = [];
  Object.entries(MetaDataIdentifierParams).forEach(([key, value]) => {
    if (allowedIdentifiers.includes(key as MetaDataIdentifierParams)) {
      allowedOptions.push(value);
    }
  });
  return allowedOptions;
};
