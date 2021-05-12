import { DrillDownTable } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import { Dictionary } from '@onaio/utils';
import React, { useState } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Cell } from 'react-table';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import { ExportForm } from '../../../../components/forms/ExportForm';
import LinkAsButton from '../../../../components/LinkAsButton';
import HeaderBreadcrumb, {
  BreadCrumbProps,
} from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../../components/page/Loading/index';
import {
  defaultOptions,
  renderInFilterFactory,
} from '../../../../components/Table/DrillDownFilters/utils';
import { NoDataComponent } from '../../../../components/Table/NoDataComponent';
import { CLIENT_LABEL } from '../../../../configs/env';
import {
  ADD_NEW_CSV,
  CLIENTS_TITLE,
  DOWNLOAD,
  FILE_NAME,
  HOME,
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
  QUERY_PARAM_TITLE,
  UPLOAD_CLIENT_CSV_URL,
} from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { getQueryParams, RouteParams } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import {
  fetchFiles,
  File,
  makeFilesArraySelector,
} from '../../../../store/ducks/opensrp/clientfiles/index';
import filesReducer, {
  reducerName as filesReducerName,
} from '../../../../store/ducks/opensrp/clientfiles/index';
import { ClientUpload } from '../ClientUpload';
import { handleDownload, loadFiles } from './helpers/serviceHooks';

/** register the plans reducer */
reducerRegistry.register(filesReducerName, filesReducer);
/** initialize files selector  */
const filesArraySelector = makeFilesArraySelector();

/** interface to describe props for ClientListView component */
export interface ClientListViewProps {
  fetchFilesActionCreator: typeof fetchFiles;
  files: File[];
  serviceClass: typeof OpenSRPService;
  clientLabel: string;
}
/** default props for ClientListView component */
export const defaultClientListViewProps: ClientListViewProps = {
  clientLabel: CLIENT_LABEL,
  fetchFilesActionCreator: fetchFiles,
  files: [],
  serviceClass: OpenSRPService,
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

  /** Load Modal once we hit this route */
  if (location.pathname === UPLOAD_CLIENT_CSV_URL) {
    return <ClientUpload />;
  }

  /** table columns */
  const columns = [
    {
      Cell: (fileObj: Cell<File>) => {
        const original = fileObj.row.original;
        return (
          <span key={original.identifier}>
            {fileObj.value} &nbsp;
            <button
              className="btn btn-link"
              // tslint:disable-next-line: jsx-no-lambda
              onClick={() =>
                handleDownload(original.url, original.fileName, OPENSRP_UPLOAD_DOWNLOAD_ENDPOINT)
              }
            >
              {`(${DOWNLOAD})`}
            </button>
          </span>
        );
      },
      Header: FILE_NAME,
      accessor: 'fileName',
    },
    {
      Header: OWNER,
      accessor: 'providerID',
    },
    {
      Header: UPLOAD_DATE,
      accessor: 'uploadDate',
    },
  ];

  const tableProps = {
    columns,
    data: files as Dictionary[],
    identifierField: 'identifier',
    paginate: true,
    renderInBottomFilterBar: renderInFilterFactory({
      showColumnHider: false,
      showFilters: false,
      showPagination: true,
      showRowHeightPicker: false,
      showSearch: false,
    }),
    renderInTopFilterBar: renderInFilterFactory({
      ...defaultOptions,
      componentProps: props,
      queryParam: QUERY_PARAM_TITLE,
      showColumnHider: false,
      showRowHeightPicker: false,
    }),
    renderNullDataComponent: () => <NoDataComponent />,
    resize: true,
    useDrillDown: false,
  };

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
          <DrillDownTable {...tableProps} />
        </Col>
      </Row>
      <hr />
      <ExportForm />
    </div>
  );
};
ClientListView.defaultProps = defaultClientListViewProps;

/** maps props to state via selectors */
const mapStateToProps = (state: Partial<Store>, ownProps: RouteComponentProps<RouteParams>) => {
  const searchedTitle = getQueryParams(ownProps.location)[QUERY_PARAM_TITLE] as string;
  const files = filesArraySelector(state, {
    fileName: searchedTitle,
  });
  return {
    files,
  };
};

const mapDispatchToProps = {
  fetchFilesActionCreator: fetchFiles,
};

const ConnectedClientListView = connect(mapStateToProps, mapDispatchToProps)(ClientListView);
export default ConnectedClientListView;
