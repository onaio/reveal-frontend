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
import InlineSearchForm, {
  Props as InlineSearchFormProps,
} from '../../../../components/InlineSearchForm';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  ACTIONS,
  CREATE_TEAM_URL,
  HOME,
  HOME_URL,
  IDENTIFIER,
  NAME,
  NEW_TEAM,
  OPENSRP_ORGANIZATION_ENDPOINT,
  ORGANIZATION_LABEL,
  ORGANIZATIONS_LABEL,
  SEARCH,
  SINGLE_TEAM_URL,
  TEAM_LIST_URL,
  VIEW,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import organizationsReducer, {
  fetchOrganizations,
  getOrganizationsArray,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/organizations';
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

  /** props to pass to the headerBreadCrumb */
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: ORGANIZATIONS_LABEL,
      url: TEAM_LIST_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  /** props for the inline search form, used to search an organization via an api call */
  const inlineSearchFormProps: InlineSearchFormProps = {
    handleSubmit,
    inputId: 'search',
    inputPlaceholder: `${SEARCH} ${ORGANIZATION_LABEL}`,
  };

  /** Props for the organization's listing table */
  const listViewProps = {
    data: organizations.map((organization: Organization) => {
      return [
        <Link
          to={`${SINGLE_TEAM_URL}/${organization.identifier}`}
          key={`orgName-${organization.identifier}`}
          className="organization-name-link"
        >
          {organization.name}
        </Link>,
        organization.identifier,
        <Link
          to={`${SINGLE_TEAM_URL}/${organization.identifier}`}
          key={`action-${organization.identifier}`}
        >
          {VIEW}
        </Link>,
      ];
    }),
    headerItems: [`${ORGANIZATION_LABEL} ${NAME}`, `${IDENTIFIER}`, `${ACTIONS}`],
    tableClass: 'table table-bordered',
  };

  // props for the link displayed as button: used to add new organization
  const linkAsButtonProps = {
    text: NEW_TEAM,
    to: CREATE_TEAM_URL,
  };

  // functions/methods

  /** function to handle the submit on the inline search form */
  // tslint:disable-next-line: no-empty
  function handleSubmit(event: React.FormEvent) {}

  const loadOrganizations = async (service: typeof serviceClass) => {
    const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT);
    serve
      .list()
      .then((response: Organization[]) => store.dispatch(fetchOrganizationsAction(response)))
      .catch((err: Error) => {
        /** TODO - find something to do with error */
      });
  };

  useEffect(() => {
    loadOrganizations(serviceClass);
  }, []);

  // break early if organizations are absent
  const isLoading = organizations.length < 1;
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{`${ORGANIZATION_LABEL}(${organizations.length})`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row id="header-row">
        <Col className="xs">
          <h2 className="mb-3 mt-5 page-title">{`${ORGANIZATION_LABEL}(${
            organizations.length
          })`}</h2>
        </Col>
        <Col className="xs">
          <LinkAsButton {...linkAsButtonProps} />
        </Col>
      </Row>
      <hr />
      <InlineSearchForm {...inlineSearchFormProps} />

      <ListView {...listViewProps} />
    </div>
  );
};

OrganizationListView.defaultProps = defaultListViewProps;

export { OrganizationListView };

// connect to store

const mapStateToProps = (state: Partial<Store>) => {
  return {
    organizations: getOrganizationsArray(state),
  };
};

/** connects the organization list view to store */
const ConnectedOrgsListView = connect(mapStateToProps)(OrganizationListView);

export default ConnectedOrgsListView;
