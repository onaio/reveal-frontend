/** Jurisdiction Metadata page
 * Displays Jurisdiction Metadata import form
 */
import React from 'react';
import { submitJurisdictionHierachyForm } from '../../../../components/forms/JurisdictionHierachyDownload/helpers';
import {
  getAllowedMetaDataIdentifiers,
  JurisdictionsMetaDataIdentifierParams,
} from '../../../../components/forms/JurisdictionMetadataDownload/helpers';
import { ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS } from '../../../../configs/env';
import {
  DOWNLOAD_JURISDICTION_METADATA,
  HOW_TO_UPDATE_JURISDICTION_METADATA,
  JURISDICTION_METADATA,
  JURISDICTION_UPLOAD_STEP_1,
  JURISDICTION_UPLOAD_STEP_2,
  JURISDICTION_UPLOAD_STEP_3,
  JURISDICTION_UPLOAD_STEP_4,
  JURISDICTION_UPLOAD_STEP_5,
  UPLOAD_JURISDICTION_METADATA,
} from '../../../../configs/lang';
import {
  JURISDICTION_METADATA_URL,
  OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT,
} from '../../../../constants';
import { MetadataOptions } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import { GenericSettingsMetadata, GenericSettingsMetadataProps } from '../genericMetadata';

/** get enabled identifier options */
const enabledIdentifierOptions = getAllowedMetaDataIdentifiers(
  ENABLED_JURISDICTION_METADATA_IDENTIFIER_OPTIONS as JurisdictionsMetaDataIdentifierParams[],
  MetadataOptions.JurisdictionMetadata
);

/** JurisdictionMetadataImportView component */
const JurisdictionMetadataImportView = () => {
  const jurisdictionMetadataProps: GenericSettingsMetadataProps = {
    currentPageLabel: JURISDICTION_METADATA,
    currentPageUrl: JURISDICTION_METADATA_URL,
    hierachyDownloadSteps: [
      JURISDICTION_UPLOAD_STEP_1,
      JURISDICTION_UPLOAD_STEP_2,
      JURISDICTION_UPLOAD_STEP_3,
      JURISDICTION_UPLOAD_STEP_4,
      JURISDICTION_UPLOAD_STEP_5,
    ],
    hierachyDownloadTitle: HOW_TO_UPDATE_JURISDICTION_METADATA,
    hierachyDownloadUrl: OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT,
    hierachyFormSubmit: submitJurisdictionHierachyForm,
    identifierOptions: enabledIdentifierOptions,
    metadataDownloadTitle: DOWNLOAD_JURISDICTION_METADATA,
    metadataOption: MetadataOptions.JurisdictionMetadata,
    metdataUploadTitle: UPLOAD_JURISDICTION_METADATA,
    pageTitle: JURISDICTION_METADATA,
    serviceClass: OpenSRPService,
  };

  return (
    <React.Fragment>
      <GenericSettingsMetadata {...jurisdictionMetadataProps} />
    </React.Fragment>
  );
};

export default JurisdictionMetadataImportView;
