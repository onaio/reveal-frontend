/** New Practitioner View page:
 * displays form that's used to create a new practitioner or update openSRP api
 */
import reducerRegistry from '@onaio/redux-reducer-registry';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  CREATE_PRACTITIONER_URL,
  EDIT_PRACTITIONER_URL,
  HOME,
  HOME_URL,
  NEW_TEAM,
} from '../../../../constants';
import { RouteParams } from '../../../../helpers/utils';
import reducer, {
  getPractitionerById,
  Practitioner,
  reducerName,
} from '../../../../store/ducks/practitioners';
import PractitionerForm, {
  defaultInitialValues,
  PractitionerFormProps,
} from '../../../forms/PractitionerForm';

reducerRegistry.register(reducerName, reducer);

export interface Props {
  practitioner: Practitioner | null;
}

export const defaultProps: Props = {
  practitioner: null,
};

export type CreateEditPractitionerTypes = Props & RouteComponentProps<RouteParams>;

// TODO - concern: say person 1 starts editing an entry, but then person 2 thinks
// TODO -  of editing the same resource but starts doing so after person1 and finishes
// TODO - doing so after person1, sth hits the fan.
const CreateEditPractitioner = (props: CreateEditPractitionerTypes) => {
  const { practitioner } = props;
  // use route to know if we are editing practitioner or creating practitioner
  const editing = !!props.match.params.id;

  //  props for breadcrumbs

  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: editing ? `edit Practitioner` : `new Practitioner`,
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
  breadcrumbProps.pages = [homePage];

  /** props for practitioner form */
  const practitionerFormProps: PractitionerFormProps = {
    disabledFields: [],
    initialValues: editing ? practitioner! : defaultInitialValues,
    redirectAfterAction: HOME_URL,
  };
  return (
    <div>
      <Helmet>
        <title>{NEW_TEAM}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col md={8}>
          <PractitionerForm {...practitionerFormProps} />
        </Col>
      </Row>
    </div>
  );
};

CreateEditPractitioner.defaultProps = defaultProps;

export { CreateEditPractitioner };

type DispatchedProps = Props;

// connect to store
const mapStateToprops = (
  state: Partial<Store>,
  ownProps: CreateEditPractitionerTypes
): DispatchedProps => {
  let practitionerId = ownProps.match.params.id;
  practitionerId = practitionerId ? practitionerId : '';
  const practitioner = getPractitionerById(state, practitionerId);
  return { practitioner };
};

const ConnectedCreateEditPractitioner = connect(mapStateToprops)(CreateEditPractitioner);

export default ConnectedCreateEditPractitioner;
