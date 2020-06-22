import { ConnectedManifestFilesList } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, JSON_VALIDATORS } from '../../../../configs/lang';
import {
  HOME_URL,
  JSON_VALIDATORS_URL,
  MANIFEST_FILE_UPLOAD,
  OPENSRP_FORM_METADATA_ENDPOINT,
  OPENSRP_FORMS_ENDPOINT,
  VALIDATOR_UPLOAD_TYPE,
} from '../../../../constants';
import { defaultConfigProps } from '../helpers';

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
    endpoint: OPENSRP_FORM_METADATA_ENDPOINT,
    fileUploadUrl: MANIFEST_FILE_UPLOAD,
    formVersion: null,
    isJsonValidator: true,
    placeholder: 'Find Validator File',
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
