/** Structure Metadata page
 * Displays Structure Metadata import form
 */
import React from 'react';
import { submitStructureHierachyForm } from '../../../../components/forms/JurisdictionHierachyDownload/helpers';
import {
  getAllowedMetaDataIdentifiers,
  JurisdictionsMetaDataIdentifierParams,
} from '../../../../components/forms/JurisdictionMetadataDownload/helpers';
import { ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS } from '../../../../configs/env';
import {
  DOWNLOAD_STRUCTURE_METADATA,
  HOW_TO_UPDATE_STRUCTURE_METADATA,
  JURISDICTION_UPLOAD_STEP_1,
  JURISDICTION_UPLOAD_STEP_2,
  JURISDICTION_UPLOAD_STEP_3,
  JURISDICTION_UPLOAD_STEP_4,
  JURISDICTION_UPLOAD_STEP_5,
  STRUCTURE_METADATA,
  UPLOAD_STRUCTURE_METADATA,
} from '../../../../configs/lang';
import {
  OPENSRP_STRUCTURE_HIERARCHY_ENDPOINT,
  STRUCTURE_METADATA_URL,
} from '../../../../constants';
import { MetadataOptions } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import { GenericSettingsMetadata, GenericSettingsMetadataProps } from '../genericMetadata';

/** get enabled identifier options */
const enabledIdentifierOptions = getAllowedMetaDataIdentifiers(
  ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS as JurisdictionsMetaDataIdentifierParams[],
  MetadataOptions.StructureMetadata
);

/** StructureMetadataImportView component */
const StructureMetadataImportView = () => {
  const structureMetadataProps: GenericSettingsMetadataProps = {
    currentPageLabel: STRUCTURE_METADATA,
    currentPageUrl: STRUCTURE_METADATA_URL,
    hierachyDownloadSteps: [
      JURISDICTION_UPLOAD_STEP_1,
      JURISDICTION_UPLOAD_STEP_2,
      JURISDICTION_UPLOAD_STEP_3,
      JURISDICTION_UPLOAD_STEP_4,
      JURISDICTION_UPLOAD_STEP_5,
    ],
    hierachyDownloadTitle: HOW_TO_UPDATE_STRUCTURE_METADATA,
    hierachyDownloadUrl: OPENSRP_STRUCTURE_HIERARCHY_ENDPOINT,
    hierachyFormSubmit: submitStructureHierachyForm,
    identifierOptions: enabledIdentifierOptions,
    metadataDownloadTitle: DOWNLOAD_STRUCTURE_METADATA,
    metadataOption: MetadataOptions.StructureMetadata,
    metdataUploadTitle: UPLOAD_STRUCTURE_METADATA,
    pageTitle: STRUCTURE_METADATA,
    serviceClass: OpenSRPService,
  };

  return (
    <React.Fragment>
      <GenericSettingsMetadata {...structureMetadataProps} />
    </React.Fragment>
  );
};

export default StructureMetadataImportView;
