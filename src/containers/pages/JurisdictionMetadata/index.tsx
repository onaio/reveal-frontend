/** Jurisdiction Metadata page
 * Displays Jurisdiction Metadata import form
 */
import React from 'react';
import Helmet from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import JurisdictionMetadata, {
  defaultInitialValues,
  JurisdictionMetadataFormProps,
  submitForm,
} from '../../../components/forms/JurisdictionMetadata';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { HOME, UPLOAD_JURISDICTION_METADATA } from '../../../configs/lang';
import {
  HOME_URL,
  ORGANIZATIONS_LIST_URL,
  UPLOAD_JURISDICTION_METADATA_URL,
} from '../../../constants';
import { RouteParams } from '../../../helpers/utils';
import { OpenSRPService } from '../../../services/opensrp';
import { JurisdictionMetadataImport } from '../../../store/ducks/opensrp/jurisdictionMetadata';

export interface Props {
  jurisdictionMetadataImport: JurisdictionMetadataImport | null;
  serviceClass: typeof OpenSRPService;
}

export const defaultProps: Props = {
  jurisdictionMetadataImport: null,
  serviceClass: OpenSRPService,
};

/** type intersection for all types that pertain to the props */
export type JurisdictionMetadataImportViewTypes = Props & RouteComponentProps<RouteParams>;

/** JurisdictionMetadataImportView component */
const JurisdictionMetadataImportView = () => {
  //  props for breadcrumbs
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: UPLOAD_JURISDICTION_METADATA,
      url: UPLOAD_JURISDICTION_METADATA_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  /** props for the Jurisdiction Metadata form */
  const jurisdictionMetadataFormProps: JurisdictionMetadataFormProps = {
    OpenSRPService,
    disabledFields: [],
    initialValues: defaultInitialValues,
    redirectAfterAction: ORGANIZATIONS_LIST_URL,
    submitForm,
  };

  return (
    <div>
      <Helmet>
        <title>{UPLOAD_JURISDICTION_METADATA}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <JurisdictionMetadata {...jurisdictionMetadataFormProps} />
        </Col>
      </Row>
    </div>
  );
};

JurisdictionMetadataImportView.defaultProps = defaultProps;

export default JurisdictionMetadataImportView;
