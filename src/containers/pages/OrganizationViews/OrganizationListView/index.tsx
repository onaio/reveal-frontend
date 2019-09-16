/** Organization Assignment component for listing all organizations */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
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
  CREATE_TEAM_URL,
  HOME,
  HOME_URL,
  NEW_TEAM,
  SINGLE_TEAM_URL,
  TEAM_LIST_URL,
  TEAMS,
} from '../../../../constants';
import organizationsReducer, {
  Organization,
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/organizations';
import * as fixtures from '../../../../store/ducks/tests/fixtures';
import './index.css';

reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** interface to describe our custom created SingleOrganizationView props */
interface OrganizationsListViewProps {
  organizations: Organization[];
}

/** the default props for SingleOrganizationView */
const defaultListViewProps: OrganizationsListViewProps = {
  organizations: [],
};

/** the interface for all SingleOrganizationView props  */
export type OrgsListViewPropsType = OrganizationsListViewProps & RouteComponentProps;

const OrganizationListView = (props: OrgsListViewPropsType) => {
  const { organizations } = props;
  if (organizations.length < 1) {
    return <Loading />;
  }
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: TEAMS,
      url: TEAM_LIST_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  // tslint:disable-next-line: no-empty
  function handleSubmit(event: React.FormEvent) {}

  const inlineSearchFormProps: InlineSearchFormProps = {
    handleSubmit,
    inputId: 'search',
    inputPlaceholder: 'Search organizations',
  };

  const listViewProps = {
    data: organizations.map((organization: Organization) => {
      return [
        <Link to={`${SINGLE_TEAM_URL}/${organization.identifier}`} key={organization.identifier}>
          {organization.identifier}
        </Link>,
        <Link to={`${SINGLE_TEAM_URL}/${organization.identifier}`} key={organization.identifier}>
          {organization.name}
        </Link>,
      ];
    }),
    headerItems: ['#', 'Organization Name', 'Area'],
    tableClass: 'table table-bordered',
  };

  const linkAsButtonProps = {
    text: NEW_TEAM,
    to: CREATE_TEAM_URL,
  };

  return (
    <div>
      <Helmet>
        <title>{`${TEAMS}(${organizations.length})`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row id="header-row">
        <Col className="xs">
          {/** ? Should this be the number of organizations in store or in the api */}
          <h2 className="mb-3 mt-5 page-title">{`${TEAMS}(${organizations.length})`}</h2>
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
    organizations: fixtures.organizations, // getOrganizationsArray(state),
  };
};

/** connects the organization list view to store */
const ConnectedOrgsListView = connect(mapStateToProps)(OrganizationListView);

export default ConnectedOrgsListView;
