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
  ADD,
  EDIT,
  HOME,
  IDENTIFIER,
  NAME,
  PRACTITIONER,
  PRACTITIONERS,
  SEARCH,
  USERNAME,
} from '../../../../configs/lang';
import {
  CREATE_PRACTITIONER_URL,
  EDIT_PRACTITIONER_URL,
  HOME_URL,
  PRACTITIONERS_LIST_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { abortFetch } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import practitionersReducer, {
  fetchPractitioners,
  getPractitionersArray,
  Practitioner,
  reducerName as practitionersReducerName,
} from '../../../../store/ducks/opensrp/practitioners';
import { loadPractitioners } from '../helpers/serviceHooks';

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

const PractitionersListView = (props: PropsTypes) => {
  const { practitioners, serviceClass, fetchPractitionersCreator } = props;
  const controller = new AbortController();
  const signal = controller.signal;
  // functions/methods

  /** function to handle the submit on the inline search form */
  // tslint:disable-next-line: no-empty
  function handleSubmit(_: FieldProps) {}

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

  /** props for the inline search form, used to search a practitioner via an api call */
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
    text: `${ADD} ${PRACTITIONER}`,
    to: CREATE_PRACTITIONER_URL,
  };

  /** hook to load all practitioners and dispatch to them to store */
  useEffect(() => {
    loadPractitioners(serviceClass, fetchPractitionersCreator, signal).catch(error =>
      displayError(error)
    );
    return () => {
      abortFetch({ controller });
    };
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

PractitionersListView.defaultProps = defaultListViewProps;

export { PractitionersListView };

// connect to store

/** maps props to state via selectors */
const mapStateToProps = (state: Partial<Store>) => {
  return {
    practitioners: getPractitionersArray(state),
  };
};

/** connects the practitioner list view to store */
const ConnectedPractitionersListView = connect(mapStateToProps)(PractitionersListView);

export default ConnectedPractitionersListView;
