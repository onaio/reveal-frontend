/** Organization Assignment component for listing all organizations */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { useEffect } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  ACTIONS,
  HOME,
  IDENTIFIER,
  NEW_TEAM,
  ORGANIZATION_NAME_TITLE,
  ORGANIZATIONS_LABEL,
  VIEW,
} from '../../../../configs/lang';
import {
  CREATE_ORGANIZATION_URL,
  HOME_URL,
  ORGANIZATIONS_LIST_URL,
  SINGLE_ORGANIZATION_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { OpenSRPService } from '../../../../services/opensrp';
import organizationsReducer, {
  fetchOrganizations,
  makeOrgsArraySelector,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/opensrp/organizations';
import { loadOrganizations } from '../helpers/serviceHooks';
import './index.css';

reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** interface to describe our custom created SingleOrganizationView props */
interface OrganizationsListViewProps {
  fetchOrganizationsAction: typeof fetchOrganizations;
  organizations: Organization[];
  serviceClass: typeof OpenSRPService;
}

/** the default props for SingleOrganizationView */
const defaultListViewProps: OrganizationsListViewProps = {
  fetchOrganizationsAction: fetchOrganizations,
  organizations: [],
  serviceClass: OpenSRPService,
};

/** the interface for all SingleOrganizationView props  */
export type OrgsListViewPropsType = OrganizationsListViewProps & RouteComponentProps;

const OrganizationListView = (props: OrgsListViewPropsType) => {
  const { organizations, serviceClass, fetchOrganizationsAction } = props;

  // functions/methods

  /** props to pass to the headerBreadCrumb */
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: ORGANIZATIONS_LABEL,
      url: ORGANIZATIONS_LIST_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  /** Props for the organization's listing table */
  const listViewProps = {
    data: organizations.map((organization: Organization) => {
      return [
        <Link
          to={`${SINGLE_ORGANIZATION_URL}/${organization.identifier}`}
          key={`orgName-${organization.identifier}`}
          className="organization-name-link"
        >
          {organization.name}
        </Link>,
        organization.identifier,
        <Link
          to={`${SINGLE_ORGANIZATION_URL}/${organization.identifier}`}
          key={`action-${organization.identifier}`}
        >
          {VIEW}
        </Link>,
      ];
    }),
    headerItems: [`${ORGANIZATION_NAME_TITLE}`, `${IDENTIFIER}`, `${ACTIONS}`],
    tableClass: 'table table-bordered',
  };

  // props for the link displayed as button: used to add new organization
  const linkAsButtonProps = {
    text: NEW_TEAM,
    to: CREATE_ORGANIZATION_URL,
  };

  useEffect(() => {
    loadOrganizations(serviceClass, fetchOrganizationsAction).catch(err => displayError(err));
  }, []);

  // break early if organizations are absent
  const isLoading = organizations.length < 1;
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{`${ORGANIZATIONS_LABEL} (${organizations.length})`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row id="header-row">
        <Col className="xs">
          <h2 className="mb-3 mt-5 page-title">{`${ORGANIZATIONS_LABEL} (${organizations.length})`}</h2>
        </Col>
        <Col className="xs">
          <LinkAsButton {...linkAsButtonProps} />
        </Col>
      </Row>
      <hr />
      <ListView {...listViewProps} />
    </div>
  );
};

OrganizationListView.defaultProps = defaultListViewProps;

export { OrganizationListView };

// connect to store

const mapStateToProps = (state: Partial<Store>) => {
  const organizationSelector = makeOrgsArraySelector();
  return {
    organizations: organizationSelector(state, {}),
  };
};

/** connects the organization list view to store */
const ConnectedOrgsListView = connect(mapStateToProps)(OrganizationListView);

export default ConnectedOrgsListView;
