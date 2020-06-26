import { ConnectedManifestFilesList } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  DOWNLOAD_LABEL,
  EDIT_LABEL,
  FILE_NAME_LABEL,
  FILE_VERSION_LABEL,
  FIND_VALIDATOR_FILES,
  HOME,
  IDENTIFIER_LABEL,
  JSON_VALIDATORS,
  MODULE_LABEL,
  UPLOAD_EDIT_LABEL,
  UPOL0AD_FILE_LABEL,
} from '../../../../configs/lang';
import {
  HOME_URL,
  JSON_VALIDATORS_URL,
  MANIFEST_FILE_UPLOAD,
  OPENSRP_FORM_METADATA_ENDPOINT,
  OPENSRP_FORMS_ENDPOINT,
  VALIDATOR_UPLOAD_TYPE,
} from '../../../../constants';
import { defaultConfigProps, drillDownProps } from '../helpers';

/** openSrp form config JSON validator wrapper */
export const JSONValidatorListPage = () => {
  const breadcrumbProps = {
    currentPage: {
      label: JSON_VALIDATORS,
      url: JSON_VALIDATORS_URL,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  const validatorProps = {
    ...defaultConfigProps,
    downloadEndPoint: OPENSRP_FORMS_ENDPOINT,
    downloadLabel: DOWNLOAD_LABEL,
    drillDownProps,
    editLabel: EDIT_LABEL,
    endpoint: OPENSRP_FORM_METADATA_ENDPOINT,
    fileNameLabel: FILE_NAME_LABEL,
    fileUploadUrl: MANIFEST_FILE_UPLOAD,
    fileVersionLabel: FILE_VERSION_LABEL,
    formVersion: null,
    identifierLabel: IDENTIFIER_LABEL,
    isJsonValidator: true,
    moduleLabel: MODULE_LABEL,
    placeholder: FIND_VALIDATOR_FILES,
    uploadEditLabel: UPLOAD_EDIT_LABEL,
    uploadFileLabel: UPOL0AD_FILE_LABEL,
    uploadTypeUrl: VALIDATOR_UPLOAD_TYPE,
  };

  return (
    <div>
      <Helmet>
        <title>{JSON_VALIDATORS}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{JSON_VALIDATORS}</h3>
        </Col>
      </Row>
      <ConnectedManifestFilesList {...validatorProps} />
    </div>
  );
};
