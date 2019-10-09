/** Practitioner Assignment component for listing all practitioners */
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
  FieldProps,
  Props as InlineSearchFormProps,
} from '../../../../components/InlineSearchForm';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading';
import {
  ACTIONS,
  CREATE_PRACTITIONER_URL,
  EDIT,
  EDIT_PRACTITIONER_URL,
  HOME,
  HOME_URL,
  IDENTIFIER,
  NAME,
  NEW_TEAM,
  OPENSRP_ORGANIZATION_ENDPOINT,
  OPENSRP_PRACTITIONER_ENDPOINT,
  OPENSRP_PRACTITIONER_ROLE_ENDPOINT,
  ORGANIZATION_LABEL,
  ORGANIZATIONS_LABEL,
  PRACTITIONER,
  PRACTITIONERS,
  PRACTITIONERS_LIST_URL,
  SEARCH,
  USERNAME,
  VIEW,
} from '../../../../constants';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import practitionersReducer, {
  fetchPractitioners,
  getPractitionersArray,
  Practitioner,
  reducerName as practitionersReducerName,
} from '../../../../store/ducks/opensrp/practitioners';
import './index.css';

reducerRegistry.register(practitionersReducerName, practitionersReducer);

/** interface to describe our custom created SinglePractitionerView props */
interface Props {
  fetchPractitionersCreator: typeof fetchPractitioners;
  practitioners: Practitioner[];
  serviceClass: typeof OpenSRPService;
}

/** the default props for SinglePractitionerView */
const defaultListViewProps: Props = {
  fetchPractitionersCreator: fetchPractitioners,
  practitioners: [],
  serviceClass: OpenSRPService,
};

/** the interface for all SinglePractitionerView props  */
export type PropsTypes = Props & RouteComponentProps;

const PractitionerListView = (props: PropsTypes) => {
  const {
    practitioners,
    serviceClass,
    fetchPractitionersCreator: fetchPractitionersAction,
  } = props;

  /** props to pass to the headerBreadCrumb */
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: PRACTITIONERS,
      url: PRACTITIONERS_LIST_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  /** props for the inline search form, used to search an practitioner via an api call */
  const inlineSearchFormProps: InlineSearchFormProps = {
    handleSubmit,
    inputId: 'search',
    inputPlaceholder: `${SEARCH} ${PRACTITIONERS}`,
  };

  /** Props for the practitioner's listing table */
  const listViewProps = {
    data: practitioners.map((practitioner: Practitioner) => {
      return [
        practitioner.name,
        practitioner.username,
        practitioner.identifier,
        <Link
          to={`${EDIT_PRACTITIONER_URL}/${practitioner.identifier}`}
          key={`action-${practitioner.identifier}`}
        >
          {EDIT}
        </Link>,
      ];
    }),
    headerItems: [`${PRACTITIONER} ${NAME}`, `${USERNAME}`, `${IDENTIFIER}`, `${ACTIONS}`],
    tableClass: 'table table-bordered',
  };

  // props for the link displayed as button: used to add new practitioner
  const linkAsButtonProps = {
    text: NEW_TEAM,
    to: CREATE_PRACTITIONER_URL,
  };

  // functions/methods

  /** function to handle the submit on the inline search form */
  // tslint:disable-next-line: no-empty
  function handleSubmit(data: FieldProps) {}

  const loadPractitioners = async (service: typeof serviceClass) => {
    const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT);
    serve
      .list()
      .then((response: Practitioner[]) => store.dispatch(fetchPractitionersAction(response)))
      .catch((err: Error) => {
        /** TODO - find something to do with error */
      });
  };

  useEffect(() => {
    loadPractitioners(serviceClass);
  }, []);

  // break early if practitioners are absent
  const isLoading = practitioners.length < 1;
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{`${PRACTITIONERS}(${practitioners.length})`}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row id="header-row">
        <Col className="xs">
          <h2 className="mb-3 mt-5 page-title">{`${PRACTITIONERS} (${practitioners.length})`}</h2>
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

PractitionerListView.defaultProps = defaultListViewProps;

export { PractitionerListView };

// connect to store

const mapStateToProps = (state: Partial<Store>) => {
  return {
    practitioners: getPractitionersArray(state),
  };
};

/** connects the practitioner list view to store */
const ConnectedPractitionersListView = connect(mapStateToProps)(PractitionerListView);

export default ConnectedPractitionersListView;
