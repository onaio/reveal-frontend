import { ConnectedManifestDraftFiles } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  DOWNLOAD_LABEL,
  FILE_NAME_LABEL,
  FILE_VERSION_LABEL,
  FIND_DRAFT_FILE_LABEL,
  FORM_DRAFT_FILES,
  HOME,
  IDENTIFIER_LABEL,
  MAKE_RELEASE_LABEL,
  MODULE_LABEL,
} from '../../../../../configs/lang';
import {
  FILE_UPLOAD_TYPE,
  HOME_URL,
  MANIFEST_FILE_UPLOAD,
  MANIFEST_RELEASE_URL,
  OPENSRP_FORM_METADATA_ENDPOINT,
  OPENSRP_FORMS_ENDPOINT,
  OPENSRP_MANIFEST_ENDPOINT,
  VIEW_DRAFT_FILES_URL,
} from '../../../../../constants';
import { defaultConfigProps, drillDownProps } from '../../helpers';

/** simple wrapper for manifest draft file lists component */
export const ManifestDraftFilesPage = () => {
  const breadcrumbProps = {
    currentPage: {
      label: FORM_DRAFT_FILES,
      url: VIEW_DRAFT_FILES_URL,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  const draftProps = {
    ...defaultConfigProps,
    downloadEndPoint: OPENSRP_FORMS_ENDPOINT,
    downloadLabel: DOWNLOAD_LABEL,
    drillDownProps,
    endpoint: OPENSRP_FORM_METADATA_ENDPOINT,
    fileNameLabel: FILE_NAME_LABEL,
    fileVersionLabel: FILE_VERSION_LABEL,
    formUploadUrl: MANIFEST_FILE_UPLOAD,
    identifierLabel: IDENTIFIER_LABEL,
    makeReleaseLabel: MAKE_RELEASE_LABEL,
    manifestEndPoint: OPENSRP_MANIFEST_ENDPOINT,
    moduleLabel: MODULE_LABEL,
    placeholder: FIND_DRAFT_FILE_LABEL,
    releasesUrl: MANIFEST_RELEASE_URL,
    uploadTypeUrl: FILE_UPLOAD_TYPE,
  };

  return (
    <div>
      <Helmet>
        <title>{FORM_DRAFT_FILES}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{FORM_DRAFT_FILES}</h3>
        </Col>
      </Row>
      <ConnectedManifestDraftFiles {...draftProps} />
    </div>
  );
};
