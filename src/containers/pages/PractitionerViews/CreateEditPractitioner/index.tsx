/** Edit / New Practitioner View page:
 * displays form that's used to create a new practitioner or update openSRP api
 */
import React, { useEffect } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import PractitionerForm, {
  defaultInitialValues,
  PractitionerFormFields,
  PractitionerFormProps,
} from '../../../../components/forms/PractitionerForm';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { EDIT_PRACTITIONER, HOME, NEW_PRACTITIONER, PRACTITIONERS } from '../../../../configs/lang';
import {
  CREATE_PRACTITIONER_URL,
  EDIT_PRACTITIONER_URL,
  HOME_URL,
  PRACTITIONERS_LIST_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { RouteParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import {
  fetchPractitioners,
  makePractitionersSelector,
  Practitioner,
} from '../../../../store/ducks/opensrp/practitioners';
import { loadPractitioner } from '../helpers/serviceHooks';

/** props for create and editing an practitioner view */
export interface Props {
  allPractitioners: Practitioner[];
  fetchPractitionersCreator: typeof fetchPractitioners;
  practitioner: Practitioner | null;
  serviceClass: typeof OpenSRPService;
}

/** default props for createEditPractitioner component */
export const defaultProps: Props = {
  allPractitioners: [],
  fetchPractitionersCreator: fetchPractitioners,
  practitioner: null,
  serviceClass: OpenSRPService,
};

/** type intersection for all types that pertain to the props */
export type PropsTypes = Props & RouteComponentProps<RouteParams>;

/** CreateEditTeamView component */
const CreateEditPractitionerView = (props: PropsTypes) => {
  const { allPractitioners, practitioner, serviceClass, fetchPractitionersCreator } = props;
  // use route to know if we are editing practitioner or creating practitioner
  const editing = !!props.match.params.id;

  //  props for breadcrumbs
  const basePage = {
    label: PRACTITIONERS,
    url: PRACTITIONERS_LIST_URL,
  };
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: editing ? EDIT_PRACTITIONER : NEW_PRACTITIONER,
      url: editing
        ? `${EDIT_PRACTITIONER_URL}/${practitioner!.identifier}`
        : CREATE_PRACTITIONER_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage, basePage];

  /** props for the practitioner form */
  const practitionerFormProps: PractitionerFormProps = {
    allPractitioners,
    disabledFields: [],
    initialValues: editing ? (practitioner as PractitionerFormFields) : defaultInitialValues,
    redirectAfterAction: PRACTITIONERS_LIST_URL,
    serviceClass: OpenSRPService,
  };

  useEffect(() => {
    if (editing) {
      let practitionerId = props.match.params.id;
      practitionerId = practitionerId ? practitionerId : '';
      loadPractitioner(practitionerId, serviceClass, fetchPractitionersCreator).catch(error =>
        displayError(error)
      );
    }
  }, []);

  return (
    <div>
      <Helmet>
        <title>{practitioner === null ? NEW_PRACTITIONER : EDIT_PRACTITIONER}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={6}>
          <PractitionerForm {...practitionerFormProps} />
        </Col>
      </Row>
    </div>
  );
};

CreateEditPractitionerView.defaultProps = defaultProps;

export { CreateEditPractitionerView };

/** Interface for connected state to props */
interface DispatchedProps {
  allPractitioners: Practitioner[];
  practitioner: Practitioner | null;
}

// connect to store
const mapStateToProps = (state: Partial<Store>, ownProps: PropsTypes): DispatchedProps => {
  let practitionerId = ownProps.match.params.id;
  practitionerId = practitionerId ? practitionerId : '';
  const practitionersSelector = makePractitionersSelector();

  const practitioners = practitionersSelector(state, { identifiers: [practitionerId] });
  const allPractitioners = practitionersSelector(state, {});
  const practitioner = practitioners.length === 1 ? practitioners[0] : null;
  return {
    allPractitioners,
    practitioner,
  };
};

/** map props to action creators */
const mapDispatchToProps = {
  fetchPractitionersCreator: fetchPractitioners,
};

const ConnectedCreateEditPractitionerView = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateEditPractitionerView);

export default ConnectedCreateEditPractitionerView;
