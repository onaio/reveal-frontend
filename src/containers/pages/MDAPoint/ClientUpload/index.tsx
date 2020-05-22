import { Formik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import * as Yup from 'yup';
import LinkAsButton from '../../../../components/LinkAsButton';
import { STUDENTS_LIST_URL } from '../../../../constants';
import { postUploadedFile } from '../ClientListView/helpers/serviceHooks';
import UploadStatus from '../ClientUploadStatus/';
export const uploadValidationSchema = Yup.object().shape({
  file: Yup.mixed().required(),
});
/** interface to describe props for ExportForm component */
export interface UploadFormField {
  file: string | null;
  location: any;
}
export const ClientUpload = (props: any) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [ifDoneHere, setIfDoneHere] = useState<boolean>(false);
  const defaultInitialValues: UploadFormField = {
    file: null,
    location: props.location,
  };
  const closeUploadModal = {
    classNameProp: 'focus-investigation btn btn-primary float-right mt-0',
    text: 'Go Back',
    to: '/clients/students',
  };
  if (ifDoneHere) {
    return <Redirect to={STUDENTS_LIST_URL} />;
  }
  const setStateIfDone = () => {
    setIfDoneHere(true);
  };
  return (
    <div>
      <Modal isOpen={true}>
        <ModalHeader>Modal title</ModalHeader>
        <ModalBody>
          <Formik
            initialValues={defaultInitialValues}
            validationSchema={uploadValidationSchema}
            // tslint:disable-next-line: jsx-no-lambda
            onSubmit={async (_, { setSubmitting }) => {
              const setSubmittingStatus = () => setSubmitting(false);
              const data = new FormData();
              data.append('file', selectedFile);
              await postUploadedFile(data, setStateIfDone, setSubmittingStatus);
            }}
          >
            {({ values, setFieldValue, handleSubmit, errors, isSubmitting }) => (
              <form onSubmit={handleSubmit} data-enctype="multipart/form-data">
                <FormGroup>
                  <Label for="upload-file">Upload File</Label>
                  <Input
                    type="file"
                    name="file"
                    id="exampleFile"
                    accept=".csv"
                    // tslint:disable-next-line: jsx-no-lambda
                    onChange={(event: any) => {
                      setSelectedFile(event.target.files[0]);
                      setFieldValue(
                        'file',
                        event && event.target && event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormGroup>
                <UploadStatus uploadFile={values.file} />

                {errors && errors.file ? (
                  <small className="form-text text-danger jurisdictions-error">{errors.file}</small>
                ) : null}
                <hr />
                <div style={{ display: 'inline-block', width: '12rem' }}>
                  <Button
                    type="submit"
                    id="studentexportform-submit-button"
                    className="btn btn-md btn btn-primary"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                  <LinkAsButton {...closeUploadModal} />
                </div>
              </form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};
export default ClientUpload;
