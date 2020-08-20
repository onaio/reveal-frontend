import { Dictionary } from '@onaio/utils';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import * as Yup from 'yup';
import LinkAsButton from '../../../../components/LinkAsButton';
import { CLIENT_UPLOAD_FORM, REQUIRED, SUBMIT, UPLOAD_FILE } from '../../../../configs/lang';
import {
  CLIENTS_LIST_URL,
  EVENT_NAME_PARAM,
  GO_BACK_TEXT,
  MODAL_BUTTON_CLASS,
  OPENSRP_EVENT_PARAM_VALUE,
} from '../../../../constants';
import { postUploadedFile } from '../ClientListView/helpers/serviceHooks';
import UploadStatus from '../ClientUploadStatus/';
import './index.css';

/** Yup client upload validation schema */
export const uploadValidationSchema = Yup.object().shape({
  file: Yup.mixed().required(REQUIRED),
});
/** Default formik values */
const defaultInitialValues: UploadFormField = {
  file: null,
};
/** interface to describe upload form fields */
export interface UploadFormField {
  file: Blob | null;
}
export interface ClientUploadProps {
  eventValue: string;
  initialValues: UploadFormField;
  fileUploadService: typeof postUploadedFile;
  fileType: string;
  formFieldStyles: Dictionary;
}
export const ClientUpload = (props: ClientUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [ifDoneHere, setIfDoneHere] = useState<boolean>(false);
  const { eventValue, initialValues, fileUploadService, formFieldStyles, fileType } = props;
  const closeUploadModal = {
    classNameProp: MODAL_BUTTON_CLASS,
    text: GO_BACK_TEXT,
    to: CLIENTS_LIST_URL,
  };
  if (ifDoneHere) {
    return <Redirect to={CLIENTS_LIST_URL} />;
  }
  const setStateIfDone = () => {
    setIfDoneHere(true);
  };
  return (
    <div>
      <Modal isOpen={true}>
        <ModalHeader>{CLIENT_UPLOAD_FORM}</ModalHeader>
        <ModalBody>
          <Formik
            initialValues={initialValues}
            validationSchema={uploadValidationSchema}
            // tslint:disable-next-line: jsx-no-lambda
            onSubmit={async (_, { setSubmitting }) => {
              const setSubmittingStatus = () => setSubmitting(false);
              const data = new FormData();
              data.append('file', selectedFile);
              const uploadParams = `?${EVENT_NAME_PARAM}=${eventValue}`;
              await fileUploadService(data, setStateIfDone, setSubmittingStatus, uploadParams);
            }}
          >
            {({ values, setFieldValue, handleSubmit, errors, isSubmitting }) => (
              <Form onSubmit={handleSubmit} data-enctype="multipart/form-data">
                <FormGroup>
                  <Label for="upload-file">{UPLOAD_FILE}</Label>
                  <Input
                    type="file"
                    name="file"
                    id="file"
                    accept={fileType}
                    // tslint:disable-next-line: jsx-no-lambda
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setSelectedFile(event.target && event.target.files && event.target.files[0]);
                      setFieldValue(
                        'file',
                        event && event.target && event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormGroup>
                {values.file && <UploadStatus uploadFile={values.file} />}

                {errors && errors.file ? (
                  <small className="form-text text-danger jurisdictions-error">{errors.file}</small>
                ) : null}
                <hr />
                <div style={formFieldStyles}>
                  <Button
                    type="submit"
                    id="exportform-submit-button"
                    className="btn btn-md btn btn-primary"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {SUBMIT}
                  </Button>
                  <LinkAsButton {...closeUploadModal} />
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};
export const defaultProps: ClientUploadProps = {
  eventValue: OPENSRP_EVENT_PARAM_VALUE,
  fileType: '.csv',
  fileUploadService: postUploadedFile,
  formFieldStyles: { display: 'inline-block', width: '24rem' },
  initialValues: defaultInitialValues,
};
ClientUpload.defaultProps = defaultProps;
export default ClientUpload;
