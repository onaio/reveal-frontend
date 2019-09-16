/** The Single Organizations view page:
 * lists details pertaining to a specific organization
 */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { capitalize, values } from 'lodash';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  EDIT_TEAM,
  EDIT_TEAM_URL,
  HOME,
  HOME_URL,
  SINGLE_TEAM_URL,
  TEAM,
  TEAM_DETAILS,
  TEAM_LIST_URL,
  TEAM_MEMBERS,
  TEAMS,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import organizationsReducer, {
  getOrganizationById,
  Organization,
  reducerName as organizationsReducerName,
} from '../../../../store/ducks/organizations';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

reducerRegistry.register(organizationsReducerName, organizationsReducer);

/** Placeholder interface for a organizationMember object schema */
interface OrganizationMember {
  identifier: string;
  name: string;
  organization: string;
  username: string;
}

/** interface to describe props for SingleOrganizationView */
interface SingleOrganizationViewProps {
  organization: Organization | null;
  organizationMembers: OrganizationMember[];
}

/** the default props for SingleOrganizationView */
const defaultProps: SingleOrganizationViewProps = {
  organization: null,
  organizationMembers: [],
};

/** the interface for all SingleOrganizationView props  */
type SingleOrgViewPropsType = SingleOrganizationViewProps & RouteComponentProps<RouteParams>;

const SingleOrganizationView = (props: SingleOrgViewPropsType) => {
  const { organization, organizationMembers } = props;

  // props //

  // props for the header breadcrumb
  const basePage = {
    label: TEAMS,
    url: TEAM_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: organization.identifier,
      url: `${SINGLE_TEAM_URL}/${organization.identifier}`,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage, basePage];

  // listViewProps for organization members
  const listViewProps = {
    data: organizationMembers.map((organizationMember: any) => values(organizationMember)),
    headerItems: ['#', 'Username', 'Name', 'Organization'],
    tableClass: 'table table-bordered',
  };

  // LinkAsButton Props
  const linkAsButtonProps = {
    text: EDIT_TEAM,
    to: `${EDIT_TEAM_URL}/${organization.identifier}`,
  };

  // functions / methods //

  if (!organization) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{`${TEAM} - ${organization.name}`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <br />
      <Row>
        <Col className="xs">
          <h2 className="mb-3 mt-5 page-title">{organization.name}</h2>
        </Col>
        <Col className="link-as-button xs">
          <LinkAsButton {...linkAsButtonProps} />
        </Col>
      </Row>
      <hr />
      <div id="organization-details" className="card mb-3">
        <div className="card-header">{TEAM_DETAILS}</div>
        <div className="card-body">
          {/* the below display should be in 2 cols */}
          {/* If automated how do we preserve the display order */}
          <Row>
            {['identifier', 'name', 'description'].map(element => {
              return (
                <Col className="col-6" key={element} id={element}>
                  <Row>
                    <Col className="text-muted mb-4 col-6">{capitalize(element)}</Col>
                    <Col className=" mb-4 col-6">{(organization as any)[element]}</Col>
                  </Row>
                </Col>
              );
            })}
            {/* */}
          </Row>
        </div>
      </div>
      <h3 className="mb-3 mt-5">{TEAM_MEMBERS}</h3>
      <ListView {...listViewProps} />
    </div>
  );
};

SingleOrganizationView.defaultProps = defaultProps;

export { SingleOrganizationView };

// connecting the component to the store

/** interface to describe props from mapStateToProps */
interface MapStateToProps {
  organization: Organization | null;
  organizationMembers: any;
}

/** Maps a prop to a selector from the organizations dux module */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: SingleOrgViewPropsType
): MapStateToProps => {
  let organizationId = ownProps.match.params.id;
  organizationId = organizationId ? organizationId : '';
  const organization = fixtures.organizations.filter(tm => tm.identifier === organizationId)[0]; // getOrganizationById(state, organizationId);
  const organizationMembers = fixtures.organizationMembers.filter(
    organizationMember => organizationMember.organization === organization.name
  );
  return {
    organization,
    organizationMembers,
  };
};

/** The connected component */
const ConnectedSingleOrgView = connect(mapStateToProps)(SingleOrganizationView);

export default ConnectedSingleOrgView;
