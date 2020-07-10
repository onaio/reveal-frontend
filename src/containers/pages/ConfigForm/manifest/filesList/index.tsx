import { ConnectedManifestFilesList } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  DOWNLOAD_LABEL,
  EDIT_LABEL,
  FILE_NAME_LABEL,
  FILE_VERSION_LABEL,
  FIND_RELEASE_FILES,
  HOME,
  IDENTIFIER_LABEL,
  MODULE_LABEL,
  RELEASES_LABEL,
  UPLOAD_EDIT_LABEL,
  UPOL0AD_FILE_LABEL,
} from '../../../../../configs/lang';
import {
  FILE_UPLOAD_TYPE,
  HOME_URL,
  MANIFEST_FILE_UPLOAD,
  MANIFEST_RELEASE_URL,
  OPENSRP_FORMS_ENDPOINT,
  OPENSRP_MANIFEST_FORMS_ENDPOINT,
} from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';
import { defaultConfigProps, drillDownProps } from '../../helpers';

/** simple wrapper for manifest file lists component */
export const ManifestFiles = (props: RouteComponentProps<RouteParams>) => {
  const formVersion = props.match.params.id || '';
  const breadcrumbProps = {
    currentPage: {
      label: formVersion,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: RELEASES_LABEL,
        url: MANIFEST_RELEASE_URL,
      },
    ],
  };

  const fileListProps = {
    ...defaultConfigProps,
    downloadEndPoint: OPENSRP_FORMS_ENDPOINT,
    downloadLabel: DOWNLOAD_LABEL,
    drillDownProps,
    editLabel: EDIT_LABEL,
    endpoint: OPENSRP_MANIFEST_FORMS_ENDPOINT,
    fileNameLabel: FILE_NAME_LABEL,
    fileUploadUrl: MANIFEST_FILE_UPLOAD,
    fileVersionLabel: FILE_VERSION_LABEL,
    formVersion,
    identifierLabel: IDENTIFIER_LABEL,
    isJsonValidator: false,
    moduleLabel: MODULE_LABEL,
    placeholder: FIND_RELEASE_FILES,
    uploadEditLabel: UPLOAD_EDIT_LABEL,
    uploadFileLabel: UPOL0AD_FILE_LABEL,
    uploadTypeUrl: FILE_UPLOAD_TYPE,
  };

  return (
    <div>
      <Helmet>
        <title>{`${RELEASES_LABEL}: ${formVersion}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{`${RELEASES_LABEL}: ${formVersion}`}</h3>
        </Col>
      </Row>
      <ConnectedManifestFilesList {...fileListProps} />
    </div>
  );
};
