/** The Single Organizations view page:
 * lists details pertaining to a specific organization
 */
import { FlexObject } from '@onaio/drill-down-table/dist/types/helpers/utils';
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { capitalize, values } from 'lodash';
import React, { useEffect } from 'react';
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
  DETAILS,
  EDIT_TEAM,
  EDIT_TEAM_URL,
  HOME,
  HOME_URL,
  IDENTIFIER,
  MEMBERS,
  NAME,
  OPENSRP_ORGANIZATION_ENDPOINT,
  ORGANIZATIONS_LABEL,
  SINGLE_TEAM_URL,
  TEAM_LIST_URL,
  TEAMS,
  USERNAME,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import organizationsReducer, {
  fetchOrganizations,
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
  serviceClass: typeof OpenSRPService;
  fetchOrganizationsAction: typeof fetchOrganizations;
}

/** the default props for SingleOrganizationView */
const defaultProps: SingleOrganizationViewProps = {
  fetchOrganizationsAction: fetchOrganizations,
  organization: null,
  organizationMembers: [],
  serviceClass: OpenSRPService,
};

/** the interface for all SingleOrganizationView props  */
type SingleOrgViewPropsType = SingleOrganizationViewProps & RouteComponentProps<RouteParams>;

const SingleOrganizationView = (props: SingleOrgViewPropsType) => {
  const { organization, organizationMembers, serviceClass, fetchOrganizationsAction } = props;

  // props //

  // props for the header breadcrumb
  const basePage = {
    label: TEAMS,
    url: TEAM_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: organization!.identifier,
      url: `${SINGLE_TEAM_URL}/${organization!.identifier}`,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage, basePage];

  // listViewProps for organization members // TODO - This is placeholder code
  const listViewProps = {
    data: organizationMembers.map((organizationMember: any) => values(organizationMember)),
    headerItems: [USERNAME, NAME, ORGANIZATIONS_LABEL],
    tableClass: 'table table-bordered',
  };

  // LinkAsButton Props
  const linkAsButtonProps = {
    text: EDIT_TEAM,
    to: `${EDIT_TEAM_URL}/${organization!.identifier}`,
  };

  // functions / methods //
  const loadOrganization = async (service: typeof serviceClass, organizationId: string) => {
    const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT);

    serve
      .read(organizationId)
      .then((response: Organization[]) => store.dispatch(fetchOrganizationsAction(response)))
      .catch((err: Error) => {
        /** still don't know what we should do with errors */
      });
  };

  useEffect(() => {
    loadOrganization(serviceClass, organization!.identifier);
  }, []);

  if (!organization) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{`${ORGANIZATIONS_LABEL} - ${organization.name}`}</title>
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
        <div className="card-header">{`${ORGANIZATIONS_LABEL} ${DETAILS}`}</div>
        <div className="card-body">
          <Row>
            <Col className="col-6">
              <Row>
                <Col className="text-muted mb-4 col-6">{IDENTIFIER}</Col>
                <Col className=" mb-4 col-6">{organization.identifier}</Col>
              </Row>
            </Col>
            <Col className="col-6">
              <Row>
                <Col className="text-muted mb-4 col-6">{NAME}</Col>
                <Col className=" mb-4 col-6">{organization.name}</Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
      <h3 className="mb-3 mt-5">{`${ORGANIZATIONS_LABEL} ${MEMBERS}`}</h3>
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
