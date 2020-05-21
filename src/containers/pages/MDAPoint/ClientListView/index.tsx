import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { ReactNode } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { ExportForm } from '../../../../components/forms/ExportForm';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading/index';
import { ENABLE_MDA_POINT } from '../../../../configs/env';
import {
  ADD_NEW_CSV,
  CLIENTS_TITLE,
  HOME,
  STUDENTS_TITLE,
  UPLOADED_CLIENT_LISTS,
  UPLOADED_STUDENT_LISTS,
} from '../../../../configs/lang';
import { HOME_URL, STUDENTS_LIST_URL, UPLOAD_STUDENT_CSV_URL } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { OpenSRPService } from '../../../../services/opensrp';
import { fetchFiles, File } from '../../../../store/ducks/opensrp/files/index';
import filesReducer, {
  getFilesArray,
  reducerName as filesReducerName,
} from '../../../../store/ducks/opensrp/files/index';
import { ClientUpload } from '../ClientUpload';
import { fetchCsvData, loadFiles } from './helpers/serviceHooks';
/** register the plans reducer */
reducerRegistry.register(filesReducerName, filesReducer);
/** interface to describe props for ClientListView component */
export interface ClientListViewProps {
  fetchFilesActionCreator: typeof fetchFiles;
  files: File[] | null;
  serviceClass: typeof OpenSRPService;
}
/** default props for ClientListView component */
export const defaultClientListViewProps: ClientListViewProps = {
  fetchFilesActionCreator: fetchFiles,
  files: null,
  serviceClass: OpenSRPService,
};
/**
 * Builds list view table data
 * @param {File[] } rowData file data coming from opensrp/history endpoint
 */
export const buildListViewData: (rowData: File[]) => ReactNode[][] | undefined = rowData => {
  return rowData.map((row: File, key: number) => {
    return [
      <p key={key}>
        {row.fileName} &nbsp;
        <a href="#" onClick={fetchCsvData(row.url, row.fileName)}>
          (Downloads)
        </a>
      </p>,
      row.providerID,
      row.uploadDate,
    ];
  });
};

export const ClientListView = (props: ClientListViewProps & RouteComponentProps) => {
  React.useEffect(() => {
    if (!(props.files && props.files.length)) {
      /**
       * Fetch files incase the files are not available e.g when page is refreshed
       */
      loadFiles().catch(err => displayError(err));
      // fetchFilesActionCreator(uploadedStudentsLists);
    }
    /**
     * We do not need to re-run since this effect doesn't depend on any values from api yet
     */
  }, []);
  /** Overide renderRows to render html inside td */
  let listViewProps;
  if (props.files && props.files.length) {
    listViewProps = {
      data: buildListViewData(props.files),
      headerItems: ['File Name', 'Owner', 'File Size', 'Number of Students', 'Upload Date'],
      tableClass: 'table table-bordered',
    };
  }
  /** Load Modal once we hit this route */
  if (props.location.pathname === '/clients/students/upload') {
    return <ClientUpload />;
  }
  /** props to pass to the headerBreadCrumb */
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: ENABLE_MDA_POINT ? STUDENTS_TITLE : CLIENTS_TITLE,
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
          <h3 className="mb-3 mt-5 page-title">
            {ENABLE_MDA_POINT ? UPLOADED_STUDENT_LISTS : UPLOADED_CLIENT_LISTS}
          </h3>
        </Col>
        <Col className="xs">
          <LinkAsButton {...csvUploadButtonProps} />
        </Col>
      </Row>
      <Row id="table-row">
        <Col>
          {listViewProps && props.files && props.files.length ? (
            <ListView {...listViewProps} />
          ) : (
            <Loading minHeight={'12px'} />
          )}
        </Col>
      </Row>
      <hr />
      <ExportForm />
    </div>
  );
};
ClientListView.defaultProps = defaultClientListViewProps;

/** maps props to state via selectors */
const mapStateToProps = (state: Partial<Store>) => {
  const files = getFilesArray(state);
  return {
    files,
  };
};

const mapDispatchToProps = {
  fetchFilesActionCreator: fetchFiles,
};

const ConnectedClientListView = connect(mapStateToProps, mapDispatchToProps)(ClientListView);
export default ConnectedClientListView;
