/** The Single Organizations view page:
 * lists details pertaining to a specific organization
 */
import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
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
  ACTIONS,
  DETAILS,
  EDIT_TEAM,
  EDIT_TEAM_URL,
  HOME,
  HOME_URL,
  IDENTIFIER,
  MEMBERS,
  NAME,
  OPENSRP_ORGANIZATION_ENDPOINT,
  ORGANIZATION_LABEL,
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
} from '../../../../store/ducks/opensrp/organizations';
import PractitionerReducer, {
  fetchPractitionerRoles,
  getPractitionersByOrgId,
  Practitioner,
  reducerName as practitionerReducerName,
} from '../../../../store/ducks/opensrp/practitioners';

reducerRegistry.register(organizationsReducerName, organizationsReducer);
reducerRegistry.register(practitionerReducerName, PractitionerReducer);

/** interface to describe props for SingleOrganizationView */
interface SingleOrganizationViewProps {
  organization: Organization | null;
  practitioners: Practitioner[];
  serviceClass: typeof OpenSRPService;
  fetchOrganizationsAction: typeof fetchOrganizations;
  fetchPractitionerRolesAction: typeof fetchPractitionerRoles;
}

/** the default props for SingleOrganizationView */
const defaultProps: SingleOrganizationViewProps = {
  fetchOrganizationsAction: fetchOrganizations,
  fetchPractitionerRolesAction: fetchPractitionerRoles,
  organization: null,
  practitioners: [],
  serviceClass: OpenSRPService,
};

/** the interface for all SingleOrganizationView props  */
type SingleOrgViewPropsType = SingleOrganizationViewProps & RouteComponentProps<RouteParams>;

const SingleOrganizationView = (props: SingleOrgViewPropsType) => {
  const {
    organization,
    practitioners,
    serviceClass,
    fetchOrganizationsAction,
    fetchPractitionerRolesAction,
  } = props;

  const orgId = props.match.params.id ? props.match.params.id : '';

  // functions / methods //

  /** loads the organization data
   * @param {typeof OpenSRPService} service - the opensrp service
   * @Param {string} organizationId - the organization id
   */
  const loadOrganization = async (service: typeof serviceClass, organizationId: string) => {
    const serve = new service(OPENSRP_ORGANIZATION_ENDPOINT);

    serve
      .read(organizationId)
      .then((response: Organization[]) => store.dispatch(fetchOrganizationsAction(response)))
      .catch((err: Error) => {
        /** still don't know what we should do with errors */
      });
  };

  /** loads the practitioners that belong to this organization
   * @param {typeof OpenSRPService} service - the opensrp service
   * @Param {string} organizationId - the organization id
   */
  const loadOrgPractitioners = async (service: typeof serviceClass, organizationId: string) => {
    const serve = new service('');

    serve
      .list()
      .then((response: Practitioner[]) =>
        store.dispatch(fetchPractitionerRolesAction(response, organizationId))
      )
      .catch((err: Error) => {
        /** still don't know what we should do with errors */
      });
  };
  useEffect(() => {
    loadOrganization(serviceClass, orgId);
    loadOrgPractitioners(serviceClass, orgId);
  }, []);

  if (!organization) {
    return <Loading />;
  }
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

  // listViewProps for organization members
  const listViewProps = {
    data: [
      ...practitioners.map((practitioner: any) => [
        practitioner.username,
        practitioner.name,
        <a
          className={`remove-link`}
          key={practitioner.identifier}
          // tslint:disable-next-line: jsx-no-lambda
          onClick={e => alert(practitioner.identifier)}
        >
          View
        </a>,
      ]),
      /** link to remove this practitioner from this organization, effectively delete this practitioner role */
    ],
    headerItems: [USERNAME, NAME, ACTIONS],
    tableClass: 'table table-bordered',
  };

  // LinkAsButton Props
  const linkAsButtonProps = {
    text: EDIT_TEAM,
    to: `${EDIT_TEAM_URL}/${organization!.identifier}`,
  };

  return (
    <div>
      <Helmet>
        <title>{`${ORGANIZATION_LABEL} - ${organization.name}`}</title>
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
        <div className="card-header">{`${ORGANIZATION_LABEL} ${DETAILS}`}</div>
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
      <h3 className="mb-3 mt-5">{`${ORGANIZATION_LABEL} ${MEMBERS}`}</h3>
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
  practitioners: any;
}

/** Maps a prop to a selector from the organizations dux module */
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: SingleOrgViewPropsType
): MapStateToProps => {
  let organizationId = ownProps.match.params.id;
  organizationId = organizationId ? organizationId : '';
  const organization = getOrganizationById(state, organizationId);
  const practitioners = getPractitionersByOrgId(state, organizationId);
  return {
    organization,
    practitioners,
  };
};

/** map props to action creators */
const mapDispatchToProps = {
  fetchOrganizationsAction: fetchOrganizations,
  fetchPractitionerRoles,
};

/** The connected component */
const ConnectedSingleOrgView = connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleOrganizationView);

export default ConnectedSingleOrgView;
