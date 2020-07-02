import { ConnectedUploadConfigFile } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
// import { useHistory } from "react-router-dom";
import { Col, Row } from 'reactstrap';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  EDIT_FORM,
  FILE_NAME_LABEL,
  FILE_UPLOAD_LABEL,
  FORM_DRAFT_FILES,
  FORM_NAME_REQUIRED_LABEL,
  FORM_REQUIRED_LABEL,
  HOME,
  JSON_VALIDATORS,
  MODULE_LABEL,
  RELATED_TO_LABEL,
  RELEASES_LABEL,
  UPLOAD_FORM,
} from '../../../../../configs/lang';
import {
  HOME_URL,
  JSON_VALIDATORS_URL,
  MANIFEST_RELEASE_URL,
  OPENSRP_FORMS_ENDPOINT,
  VALIDATOR_UPLOAD_TYPE,
  VIEW_DRAFT_FILES_URL,
} from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';
import { defaultConfigProps } from '../../helpers';

/** openSrp form config upload wrapper */
const UploadConfigFilePage = (props: RouteComponentProps<RouteParams>) => {
  // check if previous link is drafts
  const { location } = props;
  const fromDRaft: boolean = (location.state && (location.state as any).fromDrafts) || false;

  const formId = props.match.params.id || null;
  const isJsonValidator = props.match.params.type === VALIDATOR_UPLOAD_TYPE;

  // differentiate between draft and releases page
  const prevPageLabel = fromDRaft ? FORM_DRAFT_FILES : RELEASES_LABEL;
  const prevPageUrl = fromDRaft ? VIEW_DRAFT_FILES_URL : MANIFEST_RELEASE_URL;
  const releasesOrDraftPage = { label: prevPageLabel, url: prevPageUrl };

  const validatorPage = { label: JSON_VALIDATORS, url: JSON_VALIDATORS_URL };

  const prevPage = isJsonValidator ? validatorPage : releasesOrDraftPage;
  const pageTitle = formId ? EDIT_FORM : UPLOAD_FORM;

  const breadcrumbProps = {
    currentPage: {
      label: pageTitle,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      prevPage,
    ],
  };

  const uploadProps = {
    ...defaultConfigProps,
    draftFilesUrl: VIEW_DRAFT_FILES_URL,
    endpoint: OPENSRP_FORMS_ENDPOINT,
    fileNameLabel: FILE_NAME_LABEL,
    fileUploadLabel: FILE_UPLOAD_LABEL,
    formId,
    formNameRequiredLable: FORM_NAME_REQUIRED_LABEL,
    formRequiredLabel: FORM_REQUIRED_LABEL,
    isJsonValidator,
    moduleLabel: MODULE_LABEL,
    relatedToLabel: RELATED_TO_LABEL,
    validatorsUrl: JSON_VALIDATORS_URL,
  };

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{pageTitle}</h3>
        </Col>
      </Row>
      <ConnectedUploadConfigFile {...uploadProps} />
    </div>
  );
};

export default UploadConfigFilePage;
