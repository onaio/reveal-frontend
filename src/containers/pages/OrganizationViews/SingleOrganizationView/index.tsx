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
  ORGANIZATIONS_LABEL,
  SINGLE_TEAM_URL,
  TEAM_LIST_URL,
  TEAMS,
  USERNAME,
} from '../../../../constants';
import { generateNameSpacedUUID, RouteParams } from '../../../../helpers/utils';
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
interface Practitioner {
  identifier: string;
  name: string;
  username: string;
}

/** interface to describe props for SingleOrganizationView */
interface SingleOrganizationViewProps {
  organization: Organization | null;
  practitioners: Practitioner[];
  serviceClass: typeof OpenSRPService;
  fetchOrganizationsAction: typeof fetchOrganizations;
}

/** the default props for SingleOrganizationView */
const defaultProps: SingleOrganizationViewProps = {
  fetchOrganizationsAction: fetchOrganizations,
  organization: null,
  practitioners: [],
  serviceClass: OpenSRPService,
};

/** the interface for all SingleOrganizationView props  */
type SingleOrgViewPropsType = SingleOrganizationViewProps & RouteComponentProps<RouteParams>;

const SingleOrganizationView = (props: SingleOrgViewPropsType) => {
  const { organization, practitioners, serviceClass, fetchOrganizationsAction } = props;

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
    data: [
      ...practitioners.map((practitioner: any) => [
        practitioner.username,
        practitioner.name,
        <a
          className={`remove-link`}
          key={practitioner.identifier}
          // tslint:disable-next-line: jsx-no-lambda
          onClick={e => handleRemovePractitioner(practitioner.identifier, e)}
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

  // functions / methods //

  const handleRemovePractitioner = (practitionerId: string, event: React.MouseEvent) => {
    event.preventDefault();
    unassignPractitioner(OpenSRPService, organization!.identifier, practitionerId);
  };

  /** removes/unassigns a practitioner from an organization */
  const unassignPractitioner = async (
    service: typeof serviceClass,
    organizationId: string,
    practitionerId: string
  ) => {
    const serve = new service(`/practitionerRole`);

    serve
      .delete()
      .then(() => {
        // probably remove the practitioner link from store if saved, then rerender
      })
      .catch((err: Error) => {
        /** Do something with error */
      });
  };

  /** Assigning a practitioner to an organization */
  const assignPractitioner = async (
    service: typeof serviceClass,
    organizationId: string,
    // tslint:disable-next-line: no-shadowed-variable
    practitioners: Practitioner[]
  ) => {
    const serve = new service(`/practitionerRole`);
    // make the  post request and on success, add the practitioners records to the store, rerender

    const code = {
      text: 'Community Health worker',
    };
    const payload = practitioners.map(practitioner => ({
      active: true,
      code,
      identifier: generateNameSpacedUUID('', ''),
      organization: organizationId,
      practitioner: practitioner.identifier,
    }));
    serve.create(payload).then(() => {
      /** save practitioners to store, rerender */
    });
  };
  /** */
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
  const practitioners: Practitioner[] = [];
  return {
    organization,
    practitioners,
  };
};

/** The connected component */
const ConnectedSingleOrgView = connect(mapStateToProps)(SingleOrganizationView);

export default ConnectedSingleOrgView;
