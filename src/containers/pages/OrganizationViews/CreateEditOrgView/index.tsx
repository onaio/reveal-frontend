/** New Team View page:
 * displays form that's used to create a new team or update openSRP api
 */
import React, { useEffect } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  CREATE_ORGANIZATION_URL,
  EDIT_ORGANIZATION_URL,
  EDIT_TEAM,
  HOME,
  HOME_URL,
  NEW_TEAM,
  OPENSRP_ORGANIZATION_ENDPOINT,
  ORGANIZATIONS_LABEL,
  ORGANIZATIONS_LIST_URL,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import {
  fetchOrganizations,
  getOrganizationById,
  Organization,
} from '../../../../store/ducks/opensrp/organizations';
import OrganizationForm, {
  defaultInitialValues,
  OrganizationFormProps,
} from '../../../forms/OrganizationForm';

/** props for create and editing an organization view */
export interface Props {
  fetchOrganizationsCreator: typeof fetchOrganizations;
  organization: Organization | null;
  serviceClass: typeof OpenSRPService;
}

export const defaultProps: Props = {
  fetchOrganizationsCreator: fetchOrganizations,
  organization: null,
  serviceClass: OpenSRPService,
};

/** type intersection for all types that pertain to the props */
export type CreateEditTeamViewTypes = Props & RouteComponentProps<RouteParams>;

/** CreateEditTeamView component */
const CreateEditTeamView = (props: CreateEditTeamViewTypes) => {
  const { organization, serviceClass, fetchOrganizationsCreator } = props;
  // use route to know if we are editing team or creating team
  const editing = !!props.match.params.id;

  //  props for breadcrumbs
  const basePage = {
    label: ORGANIZATIONS_LABEL,
    url: ORGANIZATIONS_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: editing ? EDIT_TEAM : NEW_TEAM,
      url: editing
        ? `${EDIT_ORGANIZATION_URL}/${organization!.identifier}`
        : CREATE_ORGANIZATION_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage, basePage];

  const organizationFormProps: OrganizationFormProps = {
    disabledFields: [],
    initialValues: editing ? organization! : defaultInitialValues,
    redirectAfterAction: ORGANIZATIONS_LIST_URL,
  };

  /** Load single organization */
  const loadOrganization = async (service: typeof serviceClass, id: string) => {
    const serve = new service(`${OPENSRP_ORGANIZATION_ENDPOINT}/${id}`);
    serve
      .list()
      .then((response: Organization[]) => store.dispatch(fetchOrganizationsCreator(response)))
      .catch((err: Error) => {
        /** TODO - find something to do with error */
      });
  };

  useEffect(() => {
    loadOrganization(OpenSRPService, organization!.identifier);
  }, []);

  if (!organization) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{NEW_TEAM}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <OrganizationForm {...organizationFormProps} />
        </Col>
      </Row>
    </div>
  );
};

CreateEditTeamView.defaultProps = defaultProps;

export { CreateEditTeamView };

interface DispatchedProps {
  organization: Organization;
}

// connect to store
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: CreateEditTeamViewTypes
): DispatchedProps => {
  let teamId = ownProps.match.params.id;
  teamId = teamId ? teamId : '';
  const organization = getOrganizationById(state, teamId);
  return { organization };
};

const ConnectedCreateEditTeamView = connect(mapStateToProps)(CreateEditTeamView);

export default ConnectedCreateEditTeamView;
