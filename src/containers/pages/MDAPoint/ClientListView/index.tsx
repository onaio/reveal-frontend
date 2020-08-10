import ListView, { ListViewProps } from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { ReactNode, useState } from 'react';
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
import { CLIENT_LABEL } from '../../../../configs/env';
import {
  ADD_NEW_CSV,
  CLIENTS_TITLE,
  DOWNLOAD,
  FILE_NAME,
  HOME,
  NO_DATA_FOUND,
  OWNER,
  STUDENTS_TITLE,
  UPLOAD_DATE,
  UPLOADED_CLIENT_LISTS,
  UPLOADED_STUDENT_LISTS,
} from '../../../../configs/lang';
import {
  CLIENTS_LIST_URL,
  HOME_URL,
  OPENSRP_UPLOAD_DOWNLOAD_ENDPOINT,
  TABLE_BORDERED_CLASS,
  UPLOAD_CLIENT_CSV_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { OpenSRPService } from '../../../../services/opensrp';
import { fetchFiles, File } from '../../../../store/ducks/opensrp/clientfiles/index';
import filesReducer, {
  getFilesArray,
  reducerName as filesReducerName,
} from '../../../../store/ducks/opensrp/clientfiles/index';
import { ClientUpload } from '../ClientUpload';
import { handleDownload, loadFiles } from './helpers/serviceHooks';
/** register the plans reducer */
reducerRegistry.register(filesReducerName, filesReducer);
/** interface to describe props for ClientListView component */
export interface ClientListViewProps {
  fetchFilesActionCreator: typeof fetchFiles;
  files: File[] | null;
  serviceClass: typeof OpenSRPService;
  clientLabel: string;
}
/** default props for ClientListView component */
export const defaultClientListViewProps: ClientListViewProps = {
  clientLabel: CLIENT_LABEL,
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
    const { url, fileName } = row;
    return [
      <p key={key}>
        {fileName} &nbsp;
        {/* tslint:disable-next-line jsx-no-lambda */}
        <a href="#" onClick={() => handleDownload(url, fileName, OPENSRP_UPLOAD_DOWNLOAD_ENDPOINT)}>
          {`(${DOWNLOAD})`}
        </a>
      </p>,
      row.providerID,
      row.uploadDate,
    ];
  });
};

export const ClientListView = (props: ClientListViewProps & RouteComponentProps) => {
  const { location, files, clientLabel } = props;

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!(files && files.length)) {
      /**
       * Fetch files incase the files are not available e.g when page is refreshed
       */
      loadFiles(fetchFiles, OpenSRPService, setLoading).catch(err => displayError(err));
    }
    /**
     * We do not need to re-run since this effect doesn't depend on any values from api yet
     */
  }, []);
  /** Overide renderRows to render html inside td */
  const listViewProps: Pick<ListViewProps, 'data' | 'headerItems' | 'tableClass'> = {
    data: [],
    headerItems: [FILE_NAME, OWNER, UPLOAD_DATE],
    tableClass: TABLE_BORDERED_CLASS,
  };
  if (files && files.length) {
    listViewProps.data = buildListViewData(files) || [];
  }
  /** Load Modal once we hit this route */
  if (location.pathname === UPLOAD_CLIENT_CSV_URL) {
    return <ClientUpload />;
  }
  /** props to pass to the headerBreadCrumb */
  const breadcrumbProps: BreadCrumbProps = {
    currentPage: {
      label: clientLabel === STUDENTS_TITLE ? STUDENTS_TITLE : CLIENTS_TITLE,
      url: CLIENTS_LIST_URL,
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
    to: UPLOAD_CLIENT_CSV_URL,
  };

  /** show loader */
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Helmet>
        <title>{clientLabel === STUDENTS_TITLE ? STUDENTS_TITLE : CLIENTS_TITLE}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row id="header-row">
        <Col className="xs">
          <h3 className="mb-3 mt-5 page-title">
            {clientLabel === STUDENTS_TITLE ? UPLOADED_STUDENT_LISTS : UPLOADED_CLIENT_LISTS}
          </h3>
        </Col>
        <Col className="xs">
          <LinkAsButton {...csvUploadButtonProps} />
        </Col>
      </Row>
      <Row id="table-row">
        <Col>
          <ListView {...listViewProps} />
          {!(files && files.length) && <div>{NO_DATA_FOUND}</div>}
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
