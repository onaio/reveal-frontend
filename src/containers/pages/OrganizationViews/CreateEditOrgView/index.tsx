/** New Team View page:
 * displays form that's used to create a new team or update openSRP api
 */
import React, { useEffect } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import OrganizationForm, {
  defaultInitialValues,
  OrganizationFormFields,
  OrganizationFormProps,
  submitForm,
} from '../../../../components/forms/OrganizationForm';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { EDIT_TEAM, HOME, NEW_TEAM, ORGANIZATIONS_LABEL } from '../../../../configs/lang';
import {
  CREATE_ORGANIZATION_URL,
  EDIT_ORGANIZATION_URL,
  HOME_URL,
  ORGANIZATIONS_LIST_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import {
  fetchOrganizations,
  makeOrgsArraySelector,
  Organization,
} from '../../../../store/ducks/opensrp/organizations';
import { loadOrganization } from '../helpers/serviceHooks';

/** props for create and editing an organization view */
export interface Props {
  fetchOrganizationsCreator: typeof fetchOrganizations;
  organization: Organization | null;
  serviceClass: typeof OpenSRPService;
}

/** default props for createEditOrganization component */
export const defaultProps: Props = {
  fetchOrganizationsCreator: fetchOrganizations,
  organization: null,
  serviceClass: OpenSRPService,
};

/** type intersection for all types that pertain to the props */
export type CreateEditTeamViewTypes = Props & RouteComponentProps<RouteParams>;

/** CreateEditTeamView component */
const CreateEditOrgView = (props: CreateEditTeamViewTypes) => {
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

  /** props for the organization form */
  const organizationFormProps: OrganizationFormProps = {
    OpenSRPService,
    disabledFields: [],
    initialValues: editing ? (organization as OrganizationFormFields) : defaultInitialValues,
    redirectAfterAction: ORGANIZATIONS_LIST_URL,
    submitForm,
  };

  useEffect(() => {
    if (editing) {
      let organizationId = props.match.params.id;
      organizationId = organizationId ? organizationId : '';
      loadOrganization(organizationId, serviceClass, fetchOrganizationsCreator).catch(err =>
        displayError(err)
      );
    }
  }, []);

  return (
    <div>
      <Helmet>
        <title>{organization === null ? NEW_TEAM : EDIT_TEAM}</title>
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

CreateEditOrgView.defaultProps = defaultProps;

export { CreateEditOrgView };

/** Interface for connected state to props */
interface DispatchedProps {
  organization: Organization | null;
}

// connect to store
const mapStateToProps = (
  state: Partial<Store>,
  ownProps: CreateEditTeamViewTypes
): DispatchedProps => {
  let organizationId = ownProps.match.params.id;
  organizationId = organizationId ? organizationId : '';
  const orgSelector = makeOrgsArraySelector();

  const organizations = orgSelector(state, { identifiers: [organizationId] });
  const organization = organizations.length === 1 ? organizations[0] : null;

  return { organization };
};

/** map props to action creators */
const mapDispatchToProps = {
  fetchOrganizationsCreator: fetchOrganizations,
};

const ConnectedCreateEditOrgView = connect(mapStateToProps, mapDispatchToProps)(CreateEditOrgView);

export default ConnectedCreateEditOrgView;
