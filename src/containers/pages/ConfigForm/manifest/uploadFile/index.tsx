import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  EDIT_FORM,
  FORM_DRAFT_FILES,
  HOME,
  JSON_VALIDATORS,
  UPLOAD_FORM,
} from '../../../../../configs/lang';
import { HOME_URL, JSON_VALIDATORS_URL, VIEW_DRAFT_FILES_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';

interface Pageprops {
  formVersion: string | null;
  isJsonValidator: string | null;
}

const UploadConfigFilePage = (props: Pageprops) => {
  const { formVersion, isJsonValidator } = props;

  const draftPage = { label: FORM_DRAFT_FILES, url: VIEW_DRAFT_FILES_URL };
  const validatorPage = { label: JSON_VALIDATORS, url: JSON_VALIDATORS_URL };
  const prevPage = isJsonValidator ? validatorPage : draftPage;

  const pageTitle = formVersion ? EDIT_FORM : UPLOAD_FORM;

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
  const formVersion = ownProps.match.params.id || null;
  const isJsonValidator = ownProps.match.params.validator || null;
  return {
    formVersion,
    isJsonValidator,
  };
};

/** Connected UploadConfigFilePage component */
const ConnectedUploadConfigFilePage = connect(mapStateToProps)(UploadConfigFilePage);

export default ConnectedUploadConfigFilePage;
