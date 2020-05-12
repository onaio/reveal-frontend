import ListView from '@onaio/list-view';
import reducerRegistry from '@onaio/redux-reducer-registry';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Select from 'react-select';
import {
  Alert,
  Col,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
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
import { fetchFiles, File } from '../../../../store/ducks/opensrp/files/index';
import filesReducer, {
  getFilesArray,
  reducerName as filesReducerName,
} from '../../../../store/ducks/opensrp/files/index';
import { uploadedStudentsLists } from '../dummy-data/dummy';
/** register the plans reducer */
reducerRegistry.register(filesReducerName, filesReducer);
/** interface to describe props for StudentListView component */
export interface StudentListViewProps {
  fetchFilesActionCreator: typeof fetchFiles;
  files: File[] | null;
}
/** default props for StudentListView component */
export const defaultStudentListViewProps: StudentListViewProps = {
  fetchFilesActionCreator: fetchFiles,
  files: null,
};

export const StudentListView = (props: any) => {
  React.useEffect(() => {
    if (!props.files.length) {
      /**
       * Fetch files incase the files are not available e.g when page is refreshed
       */
      const { fetchFilesActionCreator } = props;
      fetchFilesActionCreator(uploadedStudentsLists);
    }
    /**
     * We do not need to re-run since this effect doesn't depend on any values from api yet
     */
  }, []);
  // const apimockData: File[] = [...uploadedStudentsLists];
  const selectProps: any = {
    noOptionsMessage: 'No options',
    // onChange: this.change,
    options: {
      hello: '123',
      holla: '1234',
    },
    placeholder: 'Select',
  };
  /** Overide renderRows to render html inside td */
  let listViewProps;
  if (props.files.length) {
    const rowData = [...props.files];
    const rows = rowData.map((items: any, itemKey: any) => {
      return (
        <tr key={itemKey}>
          {Object.keys(items).map((item: any) => {
            const value = items[item];
            if (value && isNaN(value) && value.includes('.csv')) {
              return (
                <td>
                  {value}
                  &nbsp;
                  <a href={items.url}>(Downloads)</a>
                  {/* {delete items.url}
                  {delete items.identifier} */}
                </td>
              );
            } else if (value && item !== 'url' && item !== 'identifier') {
              return <td>{value}</td>;
            } else {
              return null;
            }
          })}
        </tr>
      );
    });
    listViewProps = {
      headerItems: ['File Name', 'Owner', 'File Size', 'Number of Students', 'Upload Date'],
      renderRows: () => {
        return <tbody>{rows}</tbody>;
      },
      tableClass: 'table table-bordered',
    };
  }
  /** Load Modal once we hit this route */
  if (props.location.pathname === '/students/upload') {
    const closeUploadModal = {
      text: 'Cancel',
      to: '/students',
    };
    const uploadCsv = {
      text: 'Submit Upload',
      to: '/students/upload',
    };
    return (
      <div>
        <Modal isOpen={true}>
          <ModalHeader>Modal title</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="exampleFile">Upload File</Label>
              <Input type="file" name="file" id="exampleFile" />
              <FormText color="muted">
                Instructions to follow / requirements before upload.
              </FormText>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <LinkAsButton {...closeUploadModal} />
            <LinkAsButton {...uploadCsv} />
          </ModalFooter>
        </Modal>
      </div>
    );
  }
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
  const downloadStudentList = {
    classNameProp: 'btn btn-primary float-left mt-5',
    text: 'Download',
    to: '/student/download',
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
      <Row id="table-row">
        <Col>{listViewProps ? <ListView {...listViewProps} /> : null} </Col>
      </Row>
      <hr />
      <Row id="export-row">
        <Col>
          <h3 className="mb-3 mt-5 page-title">{EXPORT_STUDENT_LIST}</h3>
          {/* Download Form goes here */}
          <Alert color="light">Export Country based on Geographical level!</Alert>
          <span>Geographical level to include</span> &nbsp;
          <div style={{ display: 'inline-block', width: '24rem' }}>
            <Select {...selectProps} />
          </div>
          <Col className="xs">
            <LinkAsButton {...downloadStudentList} />
          </Col>
        </Col>
      </Row>
    </div>
  );
};
StudentListView.defaultProps = defaultStudentListViewProps;
// connect to store
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

const ConnectedStudentListView = connect(mapStateToProps, mapDispatchToProps)(StudentListView);
export default ConnectedStudentListView;
