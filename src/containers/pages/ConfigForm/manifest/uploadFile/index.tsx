import { ConnectedUploadConfigFile } from '@opensrp/form-config';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  EDIT_FORM,
  HOME,
  JSON_VALIDATORS,
  MANIFEST_RELEASES,
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

interface Pageprops {
  formId: string | null;
  isJsonValidator: boolean;
}

const UploadConfigFilePage = (props: Pageprops) => {
  const { formId, isJsonValidator } = props;

  const releasesPage = { label: MANIFEST_RELEASES, url: MANIFEST_RELEASE_URL };
  const validatorPage = { label: JSON_VALIDATORS, url: JSON_VALIDATORS_URL };
  const prevPage = isJsonValidator ? validatorPage : releasesPage;

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
    formId,
    isJsonValidator,
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

/** Map props to state
 * @param {Partial<Store>} -  the  redux store
 */
const mapStateToProps = (
  _: Partial<Store>,
  ownProps: RouteComponentProps<RouteParams>
): Pageprops => {
  const formId = ownProps.match.params.id || null;
  const isJsonValidator = ownProps.match.params.type === VALIDATOR_UPLOAD_TYPE;
  return {
    formId,
    isJsonValidator,
  };
};

/** Connected UploadConfigFilePage component */
const ConnectedUploadConfigFilePage = connect(mapStateToProps)(UploadConfigFilePage);

export default ConnectedUploadConfigFilePage;
