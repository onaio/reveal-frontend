// import ListView from '@onaio/list-view';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  ADD_NEW_CSV,
  EXPORT_STUDENT_LIST,
  HOME,
  STUDENTS_TITLE,
  UPLOADED_STUDENT_LISTS,
} from '../../../../configs/lang';
import { HOME_URL, STUDENTS_LIST_URL, UPLOAD_STUDENT_CSV_URL } from '../../../../constants';

export const StudentListView = (_: any) => {
  /** props to pass to the headerBreadCrumb */
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: STUDENTS_TITLE,
      url: STUDENTS_LIST_URL,
    },
    pages: [],
  };
  const homePage = {
    label: `${HOME}`,
    url: `${HOME_URL}`,
  };
  breadcrumbProps.pages = [homePage];

  // props for the link displayed as button: used to add new practitioner
  const csvUploadButtonProps = {
    text: ADD_NEW_CSV,
    to: UPLOAD_STUDENT_CSV_URL,
  };

  return (
    <div>
      <Helmet>
        <title>{STUDENTS_TITLE}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row id="header-row">
        <Col className="xs">
          <h3 className="mb-3 mt-5 page-title">{UPLOADED_STUDENT_LISTS}</h3>
        </Col>
        <Col className="xs">
          <LinkAsButton {...csvUploadButtonProps} />
        </Col>
      </Row>
      {/* <Row id="table-row">
        <Col>
          <ListView {...listViewProps}
        </Col>
      </Row> */}
      <hr />
      <Row id="export-row">
        <Col>
          <h3 className="mb-3 mt-5 page-title">{EXPORT_STUDENT_LIST}</h3>
          {/* Download Form goes here */}
        </Col>
      </Row>
    </div>
  );
};

// connect to store
/** maps props to state via selectors */
const mapStateToProps = (state: Partial<Store>) => {
  return state;
};

const ConnectedStudentListView = connect(mapStateToProps)(StudentListView);
export default ConnectedStudentListView;
