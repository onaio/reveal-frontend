import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, MANIFEST_RELEASES } from '../../../../../configs/lang';
import { HOME_URL, MANIFEST_RELEASE_URL } from '../../../../../constants';
import { RouteParams } from '../../../../../helpers/utils';

/** manifest files props interface */
interface ManifestFilesProps {
  formVersion: string;
}

/** simple wrapper for manifest file lists component */
const ManifestFiles = (props: ManifestFilesProps) => {
  const { formVersion } = props;
  const breadcrumbProps = {
    currentPage: {
      label: `${MANIFEST_RELEASES}: ${formVersion}`,
    },
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
      {
        label: MANIFEST_RELEASES,
        url: MANIFEST_RELEASE_URL,
      },
    ],
  };

  return (
    <div>
      <Helmet>
        <title>{`${MANIFEST_RELEASES}: ${formVersion}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <h3 className="mt-3 mb-3 page-title">{`${MANIFEST_RELEASES}: ${formVersion}`}</h3>
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
): ManifestFilesProps => {
  const formVersion = ownProps.match.params.id || '';
  return {
    formVersion,
  };
};

/** Connected ManifestFiles component */
const ConnectedManifestFiles = connect(mapStateToProps)(ManifestFiles);

export default ConnectedManifestFiles;
