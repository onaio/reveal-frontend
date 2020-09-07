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
import { createChangeHandler, SearchForm } from '../../../../components/forms/Search';
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
  NO_ROWS_FOUND,
  ORGANIZATION_NAME_TITLE,
  ORGANIZATIONS_LABEL,
  VIEW,
} from '../../../../configs/lang';
import {
  CREATE_ORGANIZATION_URL,
  HOME_URL,
  ORGANIZATIONS_LIST_URL,
  QUERY_PARAM_TITLE,
  SINGLE_ORGANIZATION_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { useLoadingReducer } from '../../../../helpers/useLoadingReducer';
import { getQueryParams } from '../../../../helpers/utils';
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
  const { startLoading, stopLoading, loading } = useLoadingReducer(organizations.length === 0);

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
    const organizationsLoadingKey = 'organization';
    startLoading(organizationsLoadingKey, organizations.length === 0);
    loadOrganizations(serviceClass, fetchOrganizationsAction)
      .finally(() => {
        stopLoading(organizationsLoadingKey);
      })
      .catch(err => displayError(err));
  }, []);

  if (loading()) {
    return <Loading />;
  }

  const searchFormChangeHandler = createChangeHandler(QUERY_PARAM_TITLE, props);

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
      <Row>
        <Col>
          <SearchForm onChangeHandler={searchFormChangeHandler} />
        </Col>
      </Row>
      <ListView {...listViewProps} />
      {!organizations.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_ROWS_FOUND}
          <hr />
        </div>
      )}
    </div>
  );
};

OrganizationListView.defaultProps = defaultListViewProps;

export { OrganizationListView };

// connect to store

type MapStateToProps = Pick<OrganizationsListViewProps, 'organizations'>;

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: OrgsListViewPropsType
): MapStateToProps => {
  const organizationSelector = makeOrgsArraySelector();
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  return {
    organizations: organizationSelector(state, { name: searchedTitle }),
  };
};

/** connects the organization list view to store */
const ConnectedOrgsListView = connect(mapStateToProps)(OrganizationListView);

export default ConnectedOrgsListView;
