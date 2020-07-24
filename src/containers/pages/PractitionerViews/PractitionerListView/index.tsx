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
import { createChangeHandler, SearchForm } from '../../../../components/forms/Search';
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
  USERNAME,
} from '../../../../configs/lang';
import {
  CREATE_PRACTITIONER_URL,
  EDIT_PRACTITIONER_URL,
  HOME_URL,
  PRACTITIONERS_LIST_URL,
  QUERY_PARAM_TITLE,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { getQueryParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import practitionersReducer, {
  fetchPractitioners,
  makePractitionersSelector,
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
  name?: string;
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

  // functions/methods

  /** props to pass to the headerBreadCrumb */
  const breadcrumbProps: Partial<BreadCrumbProps> = {
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
    loadPractitioners(serviceClass, fetchPractitionersCreator).catch(error => displayError(error));
  }, []);

  // break early if practitioners are absent
  const isLoading = practitioners.length < 1 && !props.name;
  if (isLoading) {
    return <Loading />;
  }

  const searchFormChangeHandler = createChangeHandler(QUERY_PARAM_TITLE, props);

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
      <Row>
        <Col>
          <SearchForm onChangeHandler={searchFormChangeHandler} />
        </Col>
      </Row>
      <hr />
      <ListView {...listViewProps} />
    </div>
  );
};

PractitionersListView.defaultProps = defaultListViewProps;

export { PractitionersListView };

// connect to store

type MapStateToProps = Pick<Props, 'name' | 'practitioners'>;

/** maps props to state via selectors */
const mapStateToProps = (state: Partial<Store>, ownProps: PropsTypes): MapStateToProps => {
  const practitionersSelector = makePractitionersSelector();
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  return {
    name: searchedTitle,
    practitioners: practitionersSelector(state, { name: searchedTitle }),
  };
};

/** connects the practitioner list view to store */
const ConnectedPractitionersListView = connect(mapStateToProps)(PractitionersListView);

export default ConnectedPractitionersListView;
